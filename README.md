# aws-projects

[![CI](https://github.com/jussiohag/aws-projects/actions/workflows/ci.yml/badge.svg)](https://github.com/jussiohag/aws-projects/actions/workflows/ci.yml)
[![License: Private](https://img.shields.io/badge/license-private-red)](LICENSE)

AWS architecture demos built with CDK (Python). Each project demonstrates a production-ready pattern deployed to `eu-north-1` (Stockholm).

## Projects

| Project | Services | Description |
|---------|----------|-------------|
| [Data Lake](projects/data-lake/) | S3, Glue, Athena, Iceberg | Helsinki open data pipeline with CSV → Parquet → Iceberg evolution |
| [HA Web Service](projects/ha-web-service/) | VPC, ALB, Fargate, DynamoDB | Two-AZ Fargate service with no NAT Gateway architecture |

## Architecture Overview

See [docs/architecture.md](docs/architecture.md) for detailed diagrams, design decisions, and cost analysis.

## Quick Start

### Prerequisites

- AWS CLI v2 configured with `eu-north-1`
- AWS CDK v2 (`npm install -g aws-cdk`)
- Python 3.12+
- Docker (for Fargate project)

### Deploy a project

```bash
cd projects/<project-name>/cdk
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cdk deploy
```

### Tear down

```bash
cdk destroy   # per project
```

## Project Structure

```
aws-projects/
├── projects/
│   ├── data-lake/
│   │   ├── cdk/              CDK stack (S3, Glue, Athena)
│   │   ├── queries/          Athena SQL (raw, Parquet, Iceberg)
│   │   └── scripts/          Data download + Helsinki CSV
│   └── ha-web-service/
│       ├── cdk/              CDK stack (VPC, ALB, Fargate, DynamoDB)
│       └── app/              FastAPI container + Dockerfile
├── docs/
│   └── architecture.md       Detailed architecture documentation
└── private/                  .gitignored — credentials, interview prep
```

## Tech Stack

- **IaC**: AWS CDK v2 (Python)
- **Compute**: ECS Fargate (256 CPU / 512 MB)
- **Storage**: S3, DynamoDB (on-demand)
- **Analytics**: Glue Data Catalog, Athena, Apache Iceberg
- **Networking**: VPC (2 AZ), ALB, VPC Gateway + Interface Endpoints
- **Application**: FastAPI, uvicorn, boto3

## Cost

Both projects run under $2/day combined. DynamoDB and S3 are pennies at demo scale. The main costs are the ALB (~$0.50/day) and VPC interface endpoints (~$0.24/day each). Destroy stacks when not in use.

## License

Private — all rights reserved.
