# HA Web Service Demo Results — 2026-06-15

## Infrastructure (CDK)
- VPC: 2 AZs, public + private subnets, no NAT Gateway
- ALB: `HaWebS-Servi-CkYPwhwvnS6p-2092562009.eu-north-1.elb.amazonaws.com`
- ECS Fargate: 2 tasks (256 CPU, 512 MB), circuit breaker enabled
- DynamoDB: `ha-web-items`, on-demand billing, PITR enabled
- VPC Endpoints: DynamoDB (gateway), S3 (gateway), ECR Docker + API (interface), CloudWatch Logs (interface)

## Architecture Talking Points
- **No NAT Gateway**: saves ~$64/mo (2 AZ x $32). DynamoDB + S3 via free gateway endpoints. ECR + CloudWatch via interface endpoints (~$7/mo each but only for demo).
- **Private subnets**: Fargate tasks have no public IP, no internet egress. All AWS service traffic stays on AWS backbone.
- **Circuit breaker**: failed deploys roll back automatically instead of waiting 3 hours.
- **Self-healing**: kill a task, ECS replaces it in ~30 seconds.

## API Endpoints
- `GET /health` — health check
- `GET /items` — list items
- `GET /items/{id}` — get item
- `POST /items` — create item
- `PUT /items/{id}` — update item
- `DELETE /items/{id}` — delete item

## Verified
- Health check: 200 OK
- DynamoDB CRUD: all operations working
- Running tasks: 2/2 (desired=2, running=2)
