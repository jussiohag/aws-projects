# Static Hosting

React frontend for the other three projects in this repository, served from S3
behind CloudFront. The CDK stack creates a private bucket with origin access
control, so the bucket is never publicly readable and CloudFront is the only way
in.

**[Open the deployed frontend](https://d1bccyxq5pc9x6.cloudfront.net)**

## Architecture

![CloudFront and private S3 static hosting architecture](../../docs/diagrams/static-hosting.svg)

See the [architecture guide](../../docs/architecture.md#static-hosting) for the request, deployment, and SPA fallback flows.

## What it shows

| Component | Backed by |
|-----------|-----------|
| `ChatDemo` | RAG on Bedrock, through API Gateway |
| `CrudDemo` | HA Web Service, through the ALB |
| `ArchDiagram` | Static architecture diagrams for all projects |
| `CostTable` | Per-project running cost breakdown |
| `DecisionCard` | Design decisions and the tradeoffs behind them |

## Stack

React 19, TypeScript, Vite, React Router, Vitest with Testing Library.
Infrastructure in AWS CDK v2 (Python): S3, CloudFront, `BucketDeployment`.

## Local development

```bash
npm install
cp .env.example .env      # fill in the API URLs from the other stacks
npm run dev
```

The demo components call the RAG and HA Web Service APIs, so those stacks need to
be deployed and their URLs in `.env` for the live panels to return anything. The
architecture, cost and decision sections work without any backend.

## Test and lint

```bash
npm test              # vitest run
npm run test:coverage
npm run lint
```

## Deploy

```bash
npm run build         # emits dist/

cd cdk
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cdk deploy
```

`cdk deploy` uploads `dist/` to the bucket and prints `DistributionUrl`, the
CloudFront URL the site is served from.

## Tear down

```bash
cd cdk && cdk destroy
```
