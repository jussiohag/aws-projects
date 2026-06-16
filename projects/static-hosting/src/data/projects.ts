export type ServiceTag = string;

export type ProjectStatus = "deployed" | "this-site";

export interface CostItem {
  resource: string;
  unit: string;
  monthlyCost: string;
  note?: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  route: string;
  status: ProjectStatus;
  description: string;
  services: ServiceTag[];
  costItems: CostItem[];
  dailyCost: string;
}

export const PROJECTS: Project[] = [
  {
    id: "data-lake",
    name: "Data Lake",
    icon: "🏗️",
    route: "/data-lake",
    status: "deployed",
    description:
      "S3 → Glue → Athena pipeline with Iceberg tables. 99% cost reduction via columnar format conversion.",
    services: ["S3", "Glue", "Athena", "Iceberg"],
    costItems: [
      { resource: "S3 Storage", unit: "GB/month", monthlyCost: "<$0.01" },
      { resource: "Glue Crawler", unit: "per run", monthlyCost: "~$0.01" },
      {
        resource: "Athena Queries",
        unit: "$5/TB scanned",
        monthlyCost: "<$0.01",
        note: "99% reduction with Parquet/Iceberg",
      },
    ],
    dailyCost: "<$0.01",
  },
  {
    id: "ha-web-service",
    name: "HA Web Service",
    icon: "🌐",
    route: "/ha-web-service",
    status: "deployed",
    description:
      "Multi-AZ Fargate behind ALB with DynamoDB. Zero internet egress via VPC endpoints.",
    services: ["VPC", "ALB", "Fargate", "DynamoDB", "VPC Endpoints"],
    costItems: [
      { resource: "ALB", unit: "per hour", monthlyCost: "~$15" },
      { resource: "Fargate (2 tasks)", unit: "per hour", monthlyCost: "~$7" },
      {
        resource: "DynamoDB (on-demand)",
        unit: "per request",
        monthlyCost: "<$1",
      },
      {
        resource: "VPC Endpoints (3)",
        unit: "per hour",
        monthlyCost: "~$22",
        note: "Saves ~$50/month vs NAT Gateways",
      },
    ],
    dailyCost: "~$1.50",
  },
  {
    id: "rag-bedrock",
    name: "RAG on Bedrock",
    icon: "🤖",
    route: "/rag-bedrock",
    status: "deployed",
    description:
      "Serverless Q&A over Helsinki service data. Lambda + API Gateway + Claude Haiku.",
    services: ["Lambda", "API GW", "Bedrock", "Claude"],
    costItems: [
      { resource: "Lambda", unit: "per invocation", monthlyCost: "~$0.00" },
      { resource: "API Gateway", unit: "per request", monthlyCost: "~$0.00" },
      {
        resource: "Bedrock (Haiku)",
        unit: "per query",
        monthlyCost: "~$0.001/query",
      },
    ],
    dailyCost: "~$0.00",
  },
  {
    id: "static-hosting",
    name: "Static Hosting",
    icon: "📄",
    route: "/static-hosting",
    status: "this-site",
    description:
      "This portfolio itself — S3 + CloudFront with OAC. React SPA deployed via CDK.",
    services: ["S3", "CloudFront", "OAC", "React"],
    costItems: [
      { resource: "S3 Storage", unit: "GB/month", monthlyCost: "<$0.01" },
      {
        resource: "CloudFront",
        unit: "per request + GB",
        monthlyCost: "<$1",
        note: "Free tier covers most demo traffic",
      },
    ],
    dailyCost: "<$0.01",
  },
];

export const STATS = {
  projectCount: PROJECTS.length,
  serviceCount: "12+",
  dailyCost: "~$2/day",
  region: "eu-north-1",
};
