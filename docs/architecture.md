# Architecture Documentation

## Overview

This repository contains two AWS architecture demos, each solving a distinct problem with production-ready patterns. Both are deployed to `eu-north-1` (Stockholm) using AWS CDK (Python).

---

## Project 1: Mini Data Lake

### Problem

Open data from Helsinki's service map is available as JSON/CSV but needs to be queryable at scale with minimal cost. As data evolves, we need the ability to update individual records without rewriting entire datasets.

### Solution

A three-tier data lake on S3 with progressive optimization:

```
Tier 1: Raw (CSV)           → Full table scans, highest cost
Tier 2: Curated (Parquet)   → Columnar reads, 99% less data scanned
Tier 3: Iceberg             → ACID transactions, time travel, schema evolution
```

### Design Decisions

**Why Glue Crawler instead of manual schema?**
For this demo, the crawler auto-detects CSV schema and registers it in the Data Catalog. In production, you would define schemas explicitly with Glue Schema Registry or Lake Formation to prevent schema drift.

**Why Athena CTAS for Parquet conversion?**
CTAS (CREATE TABLE AS SELECT) is the simplest way to convert formats. For recurring pipelines, you would use a Glue ETL job or Spark on EMR. CTAS is sufficient for one-time or low-frequency conversions.

**Why Iceberg instead of Delta Lake or Hudi?**
Iceberg is natively supported in Athena (v3), Glue, and EMR without additional configuration. AWS S3 Tables builds on Iceberg as the default table format. It is the direction AWS is investing in — relevant given that S3 Tables was launched in late 2024 and Jarkko Hirvonen posts about it regularly.

**Why a 1 GB scan limit on the Athena workgroup?**
At $5/TB, an accidental `SELECT *` on a large dataset can be expensive. The workgroup-level byte scan limit acts as a guardrail. For production, combine this with IAM policies restricting which workgroups users can access.

### Cost Model

| Operation | Cost |
|-----------|------|
| S3 storage (3.6 MB raw + Parquet + Iceberg) | < $0.01/month |
| Glue Crawler run | ~$0.01 (billed per DPU-second) |
| Athena query (raw CSV, 3.7 MB) | $0.000019 |
| Athena query (Parquet, 39 KB) | $0.0000002 |

At this scale, the data lake is essentially free. The cost story becomes significant at TB+ scale where the Parquet optimization saves real money.

---

## Project 2: HA Web Service

### Problem

Deploy a REST API that is highly available across multiple Availability Zones, with a persistent data store, while minimizing cost and attack surface.

### Solution

ECS Fargate in private subnets behind an ALB, with DynamoDB accessed through a VPC Gateway Endpoint. No NAT Gateway.

### Design Decisions

**Why no NAT Gateway?**

This is the central architecture decision. Traditional VPC designs route private subnet traffic through NAT Gateways for internet access. This project demonstrates that for many workloads, NAT Gateways are unnecessary:

| Concern | NAT Gateway | VPC Endpoints |
|---------|-------------|---------------|
| Cost | $32/month/AZ + data processing | Gateway: free. Interface: ~$7/month each |
| Security | Tasks can reach any internet host | Tasks can only reach specific AWS services |
| Latency | Traverses NAT + internet gateway | Stays on AWS backbone |
| Availability | Single point of failure per AZ | Managed by AWS, multi-AZ |

The Fargate tasks only need to reach: DynamoDB (data), ECR (image pull), S3 (ECR layer storage), and CloudWatch (logs). All of these are AWS services with VPC endpoint support.

**When you still need NAT:**
- Third-party API calls (Stripe, Twilio, etc.)
- Package manager access at runtime (pip install, npm install)
- Calling services without VPC endpoint support

For this workload, none of those apply.

**Why Fargate over EC2?**

| Factor | EC2 | Fargate |
|--------|-----|---------|
| Patching | You manage OS, runtime | AWS manages everything |
| Scaling | Minutes (instance launch) | Seconds (task placement) |
| Cost at low scale | Minimum 1 instance always running | Pay per task per second |
| Cost at high scale | Reserved Instances cheaper | Savings Plans available |

For a demo with 2 small tasks, Fargate is simpler and cheaper. At scale with predictable workloads, EC2 with Reserved Instances may be more cost-effective.

**Why DynamoDB over RDS?**

| Factor | DynamoDB | RDS |
|--------|----------|-----|
| Pricing model | Per-request (on-demand) | Per-hour (instance always running) |
| HA setup | Built-in, multi-AZ by default | Multi-AZ requires 2x cost |
| Schema | Flexible (NoSQL) | Fixed (relational) |
| VPC access | Free gateway endpoint | Runs inside VPC (no endpoint needed) |

For a key-value CRUD API with on-demand access patterns, DynamoDB on-demand is the natural fit. The gateway endpoint means zero network cost for DynamoDB traffic.

**Why circuit breaker on the ECS service?**

Without a circuit breaker, a bad deployment where tasks fail to start will block for up to 3 hours before CloudFormation times out and rolls back. The circuit breaker detects failing tasks within minutes and triggers automatic rollback.

### Self-Healing Demonstration

To demonstrate HA, kill a running task:

1. Find a task ID: `aws ecs list-tasks --cluster <cluster> --service <service>`
2. Stop it: `aws ecs stop-task --cluster <cluster> --task <task-id>`
3. Watch ECS launch a replacement in ~30 seconds
4. The ALB routes traffic to the healthy task during recovery — zero downtime

### Network Flow

```
Client → ALB (public subnet, port 80)
  → Fargate task (private subnet, port 8000)
    → DynamoDB (via gateway endpoint, no internet)
    → CloudWatch Logs (via interface endpoint)

Image pull at startup:
  Fargate → ECR API (interface endpoint)
  Fargate → ECR Docker (interface endpoint)
  Fargate → S3 (gateway endpoint, for image layers)
```

---

## Shared Patterns

### Tagging Strategy

All resources are tagged with:
- `Project`: identifies which project owns the resource
- `Owner`: `jussi`
- `Environment`: `demo`

These tags enable cost allocation, resource grouping in the console, and automated cleanup scripts.

### Removal Policy

All resources use `RemovalPolicy.DESTROY` — they are deleted when the stack is destroyed. This is correct for demo/dev environments. In production, data resources (S3, DynamoDB) should use `RETAIN` or `SNAPSHOT`.

### CDK Best Practices Applied

- L3 constructs where available (`ApplicationLoadBalancedFargateService`)
- L1 (`Cfn*`) constructs where L2/L3 don't exist (Glue Crawler, Athena Workgroup)
- Environment-specific stacks (`env=cdk.Environment(...)`)
- Outputs for important resource identifiers
- Security defaults: block public access on S3, least-privilege IAM, encryption enabled
