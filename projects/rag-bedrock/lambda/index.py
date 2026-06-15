import csv
import io
import json
import os

import boto3

BUCKET = os.environ["DATA_BUCKET"]
DATA_KEY = os.environ.get("DATA_KEY", "raw/helsinki_service_points.csv")
MODEL_ID = os.environ.get("MODEL_ID", "eu.anthropic.claude-haiku-4-5-20251001-v1:0")
REGION = os.environ.get("AWS_REGION", "eu-north-1")

s3 = boto3.client("s3", region_name=REGION)
bedrock = boto3.client("bedrock-runtime", region_name=REGION)

_cached_data = None


def load_data():
    global _cached_data
    if _cached_data is not None:
        return _cached_data

    response = s3.get_object(Bucket=BUCKET, Key=DATA_KEY)
    content = response["Body"].read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    _cached_data = list(reader)
    return _cached_data


def search_relevant(query, data, max_results=50):
    query_lower = query.lower()
    terms = query_lower.split()

    scored = []
    for row in data:
        text = " ".join(str(v).lower() for v in row.values())
        score = sum(1 for term in terms if term in text)
        if score > 0:
            scored.append((score, row))

    scored.sort(key=lambda x: -x[0])
    return [row for _, row in scored[:max_results]]


def format_context(results):
    if not results:
        return "No matching service points found in the Helsinki data."

    lines = []
    for r in results:
        parts = []
        if r.get("name_en"):
            parts.append(r["name_en"])
        elif r.get("name_fi"):
            parts.append(r["name_fi"])
        if r.get("street_address_fi"):
            parts.append(f"Address: {r['street_address_fi']}")
        if r.get("municipality"):
            parts.append(f"Municipality: {r['municipality']}")
        if r.get("provider_type"):
            parts.append(f"Provider type: {r['provider_type']}")
        if r.get("www_fi"):
            parts.append(f"Website: {r['www_fi']}")
        if r.get("phone"):
            parts.append(f"Phone: {r['phone']}")
        lines.append(" | ".join(parts))

    return "\n".join(lines)


def ask_bedrock(question, context):
    system_prompt = (
        "You are a helpful assistant that answers questions about Helsinki city services "
        "using the provided data from Helsinki's service map (palvelukartta). "
        "Base your answers on the data provided. If the data doesn't contain enough "
        "information to answer, say so. Be concise and specific."
    )

    user_message = (
        f"Here is data from Helsinki's service map:\n\n{context}\n\n"
        f"Question: {question}\n\n"
        "Answer based on the data above."
    )

    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_message}],
    })

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body,
    )

    result = json.loads(response["body"].read())
    return result["content"][0]["text"]


def handler(event, context):
    try:
        if event.get("httpMethod") == "GET" and event.get("path") == "/health":
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"status": "healthy", "service": "rag-bedrock"}),
            }

        body = json.loads(event.get("body", "{}"))
        question = body.get("question", "").strip()

        if not question:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing 'question' field"}),
            }

        data = load_data()
        relevant = search_relevant(question, data)
        context_text = format_context(relevant)
        answer = ask_bedrock(question, context_text)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "question": question,
                "answer": answer,
                "sources_used": len(relevant),
                "model": MODEL_ID,
            }),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
