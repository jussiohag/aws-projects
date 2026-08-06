export interface Decision {
  title: string;
  context: string;
  decision: string;
  consequences: string;
}

export interface ProjectDecisions {
  projectId: string;
  keyPoints: { title: string; description: string }[];
  decisions: Decision[];
}

export const DECISIONS: Record<string, ProjectDecisions> = {
  "data-lake": {
    projectId: "data-lake",
    keyPoints: [
      {
        title: "CSV → Parquet → Iceberg",
        description:
          "Progressive optimization: raw CSV for ingestion, Parquet for analytics (99% scan reduction), Iceberg for ACID operations.",
      },
      {
        title: "Glue Crawler",
        description:
          "Auto-detects CSV schema and registers in Glue Data Catalog. No manual schema definitions needed.",
      },
      {
        title: "Athena Workgroup",
        description:
          "Dedicated workgroup with 1 GB scan limit guardrail. Prevents accidental full-table scans on raw data.",
      },
      {
        title: "Helsinki Open Data",
        description:
          "21,498 service points from Helsinki Service Map API. Real data makes the demo meaningful.",
      },
    ],
    decisions: [
      {
        title: "Keyword search over vector embeddings",
        context:
          "RAG retrieval needs to find relevant Helsinki service records from CSV data.",
        decision:
          "Use keyword matching (term-frequency scoring) instead of vector embeddings.",
        consequences:
          "Zero infrastructure cost, simple implementation. Misses semantic similarity (e.g., 'parks' ≠ 'puisto'). Acceptable for demo; production would use Bedrock Knowledge Base + OpenSearch Serverless.",
      },
    ],
  },
  "ha-web-service": {
    projectId: "ha-web-service",
    keyPoints: [
      {
        title: "No NAT Gateways",
        description:
          "VPC endpoints replace NAT for AWS service access. Saves ~$50/month, improves security by eliminating internet egress.",
      },
      {
        title: "Multi-AZ",
        description:
          "2 Fargate tasks across availability zones. ECS replaces failed tasks in ~30 seconds with circuit breaker rollback.",
      },
      {
        title: "Least-Privilege IAM",
        description:
          "Separate task execution role (ECR/CloudWatch) and task role (DynamoDB only). No wildcard policies.",
      },
      {
        title: "On-Demand Billing",
        description:
          "DynamoDB on-demand + Fargate pay-per-use. No pre-provisioned capacity. ~$1.50/day total.",
      },
    ],
    decisions: [
      {
        title: "VPC endpoints over NAT Gateways",
        context:
          "Fargate tasks in private subnets need access to ECR, CloudWatch, DynamoDB, and S3.",
        decision:
          "Use VPC gateway endpoints (free: DynamoDB, S3) and interface endpoints (~$7/month each: ECR Docker, ECR API, CloudWatch Logs).",
        consequences:
          "~$22/month for interface endpoints vs ~$70/month for 2 NAT Gateways. No internet egress path from private subnets — better security posture.",
      },
      {
        title: "Fargate over EC2",
        context: "Need container hosting for a FastAPI application.",
        decision:
          "Use Fargate (serverless containers) instead of EC2-backed ECS.",
        consequences:
          "No instance management, automatic patching, pay-per-second. Slightly higher per-vCPU cost but lower operational overhead for a demo.",
      },
    ],
  },
  "rag-bedrock": {
    projectId: "rag-bedrock",
    keyPoints: [
      {
        title: "Serverless",
        description:
          "Lambda + API Gateway — zero idle cost. Pay only per query (~$0.001).",
      },
      {
        title: "EU Inference Profile",
        description:
          "Uses eu.anthropic.claude-haiku-4-5 to keep data in EU. Required for GDPR compliance.",
      },
      {
        title: "API Key + Throttling",
        description:
          "10 req/sec rate limit, 5 burst, 100/day quota. Prevents runaway costs.",
      },
      {
        title: "Keyword Retrieval",
        description:
          "Simple term-frequency search over cached CSV. Zero vector DB cost. Production would use OpenSearch Serverless.",
      },
    ],
    decisions: [
      {
        title: "Lambda over Fargate for RAG",
        context: "Need a compute layer to run retrieval + Bedrock invocation.",
        decision:
          "Use Lambda (512 MB, 60s timeout) instead of a persistent Fargate service.",
        consequences:
          "Zero idle cost, scales to zero. Cold start adds ~1s latency on first request. Acceptable for demo traffic patterns.",
      },
    ],
  },
  "static-hosting": {
    projectId: "static-hosting",
    keyPoints: [
      {
        title: "S3 + CloudFront",
        description:
          "Private S3 bucket with CloudFront distribution. Origin Access Control (OAC) replaces legacy OAI.",
      },
      {
        title: "SPA Routing",
        description:
          "CloudFront custom error responses redirect 403/404 to /index.html for client-side routing.",
      },
      {
        title: "CDK BucketDeployment",
        description:
          "Uploads dist/ to S3 and invalidates CloudFront cache on every deploy.",
      },
      {
        title: "React + Vite",
        description:
          "TypeScript SPA with CSS modules. Builds to static files — no server needed.",
      },
    ],
    decisions: [
      {
        title: "OAC over OAI",
        context: "Need to grant CloudFront access to a private S3 bucket.",
        decision:
          "Use Origin Access Control (OAC), the newer mechanism, instead of Origin Access Identity (OAI).",
        consequences:
          "Supports SSE-KMS, better security model, actively maintained by AWS. OAI is legacy and may be deprecated.",
      },
    ],
  },
};
