# RAG on Bedrock — Helsinki Service Q&A

A retrieval-augmented generation (RAG) API that answers natural language questions about Helsinki city services using Claude on Amazon Bedrock. The knowledge source is Helsinki's open service map data (21,498 service points) stored in the data lake S3 bucket.

## Architecture

```
User question
      │
      ▼
  API Gateway (REST)
      │
      ▼
  Lambda function
      │
      ├──► S3: read Helsinki service points CSV
      │         (keyword search for relevant records)
      │
      ├──► Bedrock: send context + question to Claude Haiku
      │
      └──► Return answer + source count
```

## What It Demonstrates

### Retrieval-Augmented Generation

RAG combines retrieval (finding relevant data) with generation (LLM produces a natural language answer). This prevents hallucination by grounding answers in actual data.

The retrieval step here uses keyword matching against the Helsinki CSV. In production, you would use:
- **Bedrock Knowledge Bases** with a vector store (OpenSearch Serverless, Aurora, Pinecone) for semantic search via embeddings
- **Amazon Titan Embeddings** or similar for vectorizing documents and queries

This demo avoids the vector store to keep costs at zero when idle. The Lambda + API Gateway pattern is the same regardless of retrieval method.

### Cross-Region Inference

Uses the EU inference profile (`eu.anthropic.claude-haiku-4-5-20251001-v1:0`) which routes requests across EU regions for better availability. The IAM policy allows `bedrock:InvokeModel` across all regions since the profile may route to any EU region.

### Integration with the Data Lake

This project reads directly from the data lake's S3 bucket (`helsinki-data-lake-<account>/raw/`), demonstrating how different services can consume the same data source. The data lake handles ingestion and cataloging; this project handles intelligent querying.

## Example

```bash
API="https://<api-id>.execute-api.eu-north-1.amazonaws.com/prod"

# Ask a question
curl -X POST "$API/ask" \
  -H "Content-Type: application/json" \
  -d '{"question":"What libraries are in Helsinki?"}'

# Response
{
  "question": "What libraries are in Helsinki?",
  "answer": "Based on the data, Helsinki has several libraries including...",
  "sources_used": 50,
  "model": "eu.anthropic.claude-haiku-4-5-20251001-v1:0"
}
```

## Deploy

Requires the data lake stack to be deployed first (needs the S3 bucket with Helsinki data).

```bash
cd cdk
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cdk deploy
```

## Resources Created

| Resource | Cost |
|----------|------|
| Lambda (512 MB, 60s timeout) | ~$0.00 at demo scale |
| API Gateway (REST) | ~$0.00 at demo scale |
| CloudWatch Logs | ~$0.00 |
| Bedrock (Haiku per-token) | ~$0.001 per query |

**Total**: effectively free at demo scale. No idle costs — Lambda and API Gateway are pay-per-request only.

## Production Improvements

For a production RAG system, you would add:
- **Vector store** (OpenSearch Serverless or Aurora pgvector) for semantic search instead of keyword matching
- **Bedrock Knowledge Base** for managed ingestion, chunking, and embedding
- **Guardrails** for content filtering and PII redaction
- **Caching** (API Gateway caching or ElastiCache) for repeated queries
- **Authentication** (Cognito or API keys) on the API Gateway

## Tear Down

```bash
cdk destroy
```
