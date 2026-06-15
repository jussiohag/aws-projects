# RAG on Bedrock Demo Results — 2026-06-15

## Infrastructure (CDK)
- Lambda: `RagStack-RagFunction` (Python 3.12, 512 MB, 60s timeout)
- API Gateway: `https://wworjg30n3.execute-api.eu-north-1.amazonaws.com/prod/`
- Model: `eu.anthropic.claude-haiku-4-5-20251001-v1:0` (EU inference profile)
- Data source: `s3://helsinki-data-lake-REDACTED-ACCOUNT-ID/raw/helsinki_service_points.csv`

## Example Queries

**"Tell me about Oodi library"** — Found the Oodi cultural installation entry, returned address and website.

**"What healthcare services are available in Espoo?"** — Found student health care service, returned address and provider type.

**"What libraries are in Helsinki?"** — Keyword search didn't match (libraries are "kirjasto" in Finnish). Model correctly reported data limitation.

## Verified
- Health endpoint: 200 OK
- POST /ask: returns structured JSON with answer, source count, and model ID
- Bedrock invocation: working via EU inference profile
- Error handling: returns clean JSON errors for missing fields
