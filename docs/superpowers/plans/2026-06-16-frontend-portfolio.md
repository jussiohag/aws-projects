# AWS Portfolio Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React SPA that showcases four AWS architecture demos with architecture docs and live interactive demos, hosted on S3 + CloudFront.

**Architecture:** Single-page app with React Router. Landing page with project cards navigates to detail pages with tabbed content (Architecture, Try It, Cost, Decisions). Interactive demos call live AWS endpoints for HA Web Service (CRUD) and RAG (chat). Data Lake shows pre-computed query results. The site itself is the fourth project, deployed via CDK.

**Tech Stack:** React 19, Vite, TypeScript, CSS modules, React Router v7, CDK Python (S3 + CloudFront)

**Design Spec:** `docs/superpowers/specs/2026-06-16-frontend-portfolio-design.md`

---

## File Map

```
projects/static-hosting/
├── cdk/
│   ├── app.py                          — CDK entry point
│   ├── cdk.json                        — CDK config
│   ├── cdk/__init__.py
│   ├── cdk/static_hosting_stack.py     — S3 + CloudFront + OAC stack
│   └── requirements.txt                — CDK Python deps
├── src/
│   ├── main.tsx                        — React entry point
│   ├── App.tsx                         — Router setup
│   ├── App.module.css
│   ├── routes/
│   │   ├── Landing.tsx
│   │   ├── Landing.module.css
│   │   ├── DataLake.tsx
│   │   ├── HaWebService.tsx
│   │   ├── RagBedrock.tsx
│   │   ├── StaticHosting.tsx
│   │   └── ProjectDetail.module.css    — shared detail page styles
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Layout.module.css
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectCard.module.css
│   │   ├── ProjectHeader.tsx
│   │   ├── ProjectHeader.module.css
│   │   ├── TabPanel.tsx
│   │   ├── TabPanel.module.css
│   │   ├── ArchDiagram.tsx
│   │   ├── ArchDiagram.module.css
│   │   ├── CrudDemo.tsx
│   │   ├── CrudDemo.module.css
│   │   ├── ChatDemo.tsx
│   │   ├── ChatDemo.module.css
│   │   ├── QueryViewer.tsx
│   │   ├── QueryViewer.module.css
│   │   ├── CostTable.tsx
│   │   ├── CostTable.module.css
│   │   └── DecisionCard.tsx
│   │   └── DecisionCard.module.css
│   ├── data/
│   │   ├── projects.ts                — project metadata (names, tags, routes)
│   │   ├── queries.ts                 — pre-computed Athena query results
│   │   └── decisions.ts               — ADR content per project
│   └── styles/
│       └── theme.css                  — CSS custom properties (AWS dark theme)
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── package.json
```

**Existing files modified:**
- `projects/ha-web-service/app/main.py` — add CORS middleware
- `projects/rag-bedrock/cdk/cdk/rag_stack.py` — add CORS to API Gateway
- `Makefile` — add static-hosting targets

---

## Task 1: Scaffold Vite + React + TypeScript Project

**Files:**
- Create: `projects/static-hosting/package.json`
- Create: `projects/static-hosting/vite.config.ts`
- Create: `projects/static-hosting/tsconfig.json`
- Create: `projects/static-hosting/tsconfig.node.json`
- Create: `projects/static-hosting/index.html`
- Create: `projects/static-hosting/src/main.tsx`
- Create: `projects/static-hosting/src/App.tsx`
- Create: `projects/static-hosting/src/vite-env.d.ts`

- [ ] **Step 1: Create project directory and initialize Vite**

```bash
cd projects/static-hosting
npm create vite@latest . -- --template react-ts
```

Select "Ignore files and continue" if prompted about existing directory.

- [ ] **Step 2: Install dependencies**

```bash
cd projects/static-hosting
npm install react-router-dom
npm install -D @types/react @types/react-dom
```

- [ ] **Step 3: Verify dev server starts**

```bash
cd projects/static-hosting
npm run dev -- --port 3000
```

Expected: Vite dev server running at http://localhost:3000, default React page renders.

- [ ] **Step 4: Clean up scaffolded files**

Delete `src/App.css`, `src/index.css`, `src/assets/`. Replace `src/App.tsx` with:

```tsx
export function App() {
  return <div>AWS Portfolio</div>;
}
```

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Update `index.html` title to "AWS Architecture Demos".

- [ ] **Step 5: Configure strict TypeScript**

In `tsconfig.json`, ensure `"strict": true` is set (Vite template includes this by default). Add to `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Update `vite.config.ts` to resolve the path alias:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 6: Verify build**

```bash
cd projects/static-hosting
npm run build
```

Expected: `dist/` directory created with `index.html` and JS/CSS bundles.

- [ ] **Step 7: Commit**

```bash
git add projects/static-hosting/
git commit -m "feat(static-hosting): scaffold Vite + React + TypeScript project"
```

---

## Task 2: AWS Dark Theme CSS

**Files:**
- Create: `projects/static-hosting/src/styles/theme.css`

- [ ] **Step 1: Create theme CSS with custom properties**

```css
:root {
  --bg-primary: #1a1a2e;
  --bg-card: #232f3e;
  --bg-deep: #0f0f1a;
  --accent: #ff9900;
  --accent-hover: #ec7211;
  --text-heading: #ffffff;
  --text-body: #e0e0e0;
  --text-secondary: #999999;
  --text-muted: #888888;
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #ef4444;
  --border: #333333;
  --border-card: #3a4553;
  --font-ui: system-ui, -apple-system, sans-serif;
  --font-mono: "SF Mono", "Cascadia Code", "Fira Code", monospace;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-ui);
  color: var(--text-body);
  background: var(--bg-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
}

code, pre {
  font-family: var(--font-mono);
}
```

- [ ] **Step 2: Import theme in main.tsx**

Update `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/theme.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 3: Verify dark theme renders**

```bash
cd projects/static-hosting && npm run dev -- --port 3000
```

Expected: dark background (#1a1a2e), white text visible.

- [ ] **Step 4: Commit**

```bash
git add projects/static-hosting/src/styles/
git add projects/static-hosting/src/main.tsx
git commit -m "feat(static-hosting): add AWS dark theme CSS custom properties"
```

---

## Task 3: Router + Layout Component

**Files:**
- Create: `projects/static-hosting/src/components/Layout.tsx`
- Create: `projects/static-hosting/src/components/Layout.module.css`
- Modify: `projects/static-hosting/src/App.tsx`

- [ ] **Step 1: Create Layout component**

`src/components/Layout.tsx`:

```tsx
import { NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

const GITHUB_URL = "https://github.com/jussiohag/aws-projects";

export function Layout() {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>
          ☁ AWS Portfolio
        </NavLink>
        <div className={styles.links}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            Projects
          </NavLink>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHub ↗
          </a>
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create Layout styles**

`src/components/Layout.module.css`:

```css
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--bg-deep);
  border-bottom: 1px solid var(--border);
}

.logo {
  color: var(--accent);
  font-weight: bold;
  font-size: 18px;
  text-decoration: none;
}

.links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
}

.link:hover {
  color: var(--text-body);
}

.activeLink {
  composes: link;
  color: var(--accent);
}

.main {
  flex: 1;
}

@media (max-width: 768px) {
  .nav {
    padding: 12px 16px;
  }

  .links {
    gap: 12px;
  }
}
```

- [ ] **Step 3: Set up router in App.tsx**

`src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";

function Placeholder({ name }: { name: string }) {
  return <div style={{ padding: 24, color: "var(--text-heading)" }}>{name}</div>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Placeholder name="Landing" />} />
          <Route path="data-lake" element={<Placeholder name="Data Lake" />} />
          <Route
            path="ha-web-service"
            element={<Placeholder name="HA Web Service" />}
          />
          <Route
            path="rag-bedrock"
            element={<Placeholder name="RAG on Bedrock" />}
          />
          <Route
            path="static-hosting"
            element={<Placeholder name="Static Hosting" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Verify routing works**

```bash
cd projects/static-hosting && npm run dev -- --port 3000
```

Navigate to `/`, `/data-lake`, `/ha-web-service`, `/rag-bedrock`, `/static-hosting`. Each should show the placeholder name with the sticky nav. "Projects" link returns to landing.

- [ ] **Step 5: Commit**

```bash
git add projects/static-hosting/src/
git commit -m "feat(static-hosting): add router and Layout component with nav"
```

---

## Task 4: Project Data Layer

**Files:**
- Create: `projects/static-hosting/src/data/projects.ts`
- Create: `projects/static-hosting/src/data/queries.ts`
- Create: `projects/static-hosting/src/data/decisions.ts`

- [ ] **Step 1: Create project metadata**

`src/data/projects.ts`:

```ts
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
```

- [ ] **Step 2: Create pre-computed query data**

`src/data/queries.ts`:

```ts
export interface QueryResult {
  columns: string[];
  rows: string[][];
}

export interface AthenaQuery {
  id: string;
  label: string;
  filename: string;
  sql: string;
  description: string;
  result: QueryResult;
  bytesScanned?: { format: string; bytes: string }[];
}

export const QUERIES: AthenaQuery[] = [
  {
    id: "explore-raw",
    label: "Explore Raw",
    filename: "01_explore_raw.sql",
    description: "Query raw CSV data in S3 via Athena",
    sql: `SELECT municipality, COUNT(*) as service_count
FROM helsinki_open_data.raw
GROUP BY municipality
ORDER BY service_count DESC
LIMIT 20;`,
    result: {
      columns: ["municipality", "service_count"],
      rows: [
        ["helsinki", "15234"],
        ["espoo", "3891"],
        ["vantaa", "2373"],
      ],
    },
    bytesScanned: [{ format: "CSV", bytes: "2.1 MB" }],
  },
  {
    id: "ctas-parquet",
    label: "CSV → Parquet",
    filename: "02_ctas_parquet.sql",
    description: "Convert raw CSV to partitioned Parquet with CTAS",
    sql: `CREATE TABLE helsinki_open_data.curated
WITH (
    format = 'PARQUET',
    external_location = 's3://...data-lake-.../curated/',
    partitioned_by = ARRAY['municipality']
) AS
SELECT id, name_fi, name_en, street_address_fi,
       address_zip, provider_type, latitude, longitude,
       www_fi, phone, municipality
FROM helsinki_open_data.raw;`,
    result: {
      columns: ["status"],
      rows: [["21498 rows written"]],
    },
  },
  {
    id: "query-parquet",
    label: "Query Parquet",
    filename: "03_query_parquet.sql",
    description: "Same query on Parquet — compare bytes scanned",
    sql: `SELECT municipality, COUNT(*) as service_count
FROM helsinki_open_data.curated
GROUP BY municipality
ORDER BY service_count DESC
LIMIT 20;`,
    result: {
      columns: ["municipality", "service_count"],
      rows: [
        ["helsinki", "15234"],
        ["espoo", "3891"],
        ["vantaa", "2373"],
      ],
    },
    bytesScanned: [
      { format: "CSV", bytes: "2.1 MB" },
      { format: "Parquet", bytes: "21 KB" },
    ],
  },
  {
    id: "partition-prune",
    label: "Partition Pruning",
    filename: "04_parquet_partition_prune.sql",
    description: "Partition pruning — only scans the Helsinki partition",
    sql: `SELECT name_fi, street_address_fi, provider_type
FROM helsinki_open_data.curated
WHERE municipality = 'helsinki'
LIMIT 10;`,
    result: {
      columns: ["name_fi", "street_address_fi", "provider_type"],
      rows: [
        ["Oodi", "Töölönlahdenkatu 4", "SELF_PRODUCED"],
        ["Kallion kirjasto", "Viides linja 11", "SELF_PRODUCED"],
        ["Töölön kirjasto", "Topeliuksenkatu 6", "SELF_PRODUCED"],
      ],
    },
  },
  {
    id: "iceberg-create",
    label: "Create Iceberg",
    filename: "05_iceberg_create.sql",
    description: "Create an Iceberg table with ACID support",
    sql: `CREATE TABLE helsinki_open_data.services_iceberg (
    id BIGINT,
    name_fi STRING,
    name_en STRING,
    street_address_fi STRING,
    address_zip STRING,
    municipality STRING,
    provider_type STRING,
    latitude DOUBLE,
    longitude DOUBLE,
    www_fi STRING,
    phone STRING
)
LOCATION 's3://...data-lake-.../iceberg/services/'
TBLPROPERTIES ('table_type' = 'ICEBERG');`,
    result: {
      columns: ["status"],
      rows: [["Table created"]],
    },
  },
  {
    id: "iceberg-insert",
    label: "Insert Data",
    filename: "06_iceberg_insert.sql",
    description: "Populate Iceberg table from raw data",
    sql: `INSERT INTO helsinki_open_data.services_iceberg
SELECT CAST(id AS BIGINT),
       name_fi, name_en, street_address_fi, address_zip,
       municipality, provider_type,
       CAST(latitude AS DOUBLE),
       CAST(longitude AS DOUBLE),
       www_fi, phone
FROM helsinki_open_data.raw;`,
    result: {
      columns: ["status"],
      rows: [["21498 rows inserted"]],
    },
  },
  {
    id: "iceberg-update",
    label: "Iceberg UPDATE",
    filename: "07_iceberg_update.sql",
    description: "UPDATE a row — impossible with plain Parquet/Hive",
    sql: `UPDATE helsinki_open_data.services_iceberg
SET name_en = 'Helsinki Central Library Oodi'
WHERE id = 62976;`,
    result: {
      columns: ["status"],
      rows: [["1 row updated"]],
    },
  },
  {
    id: "time-travel",
    label: "Time Travel",
    filename: "08_iceberg_time_travel.sql",
    description: "Query data as it was before the UPDATE",
    sql: `SELECT name_en
FROM helsinki_open_data.services_iceberg
FOR TIMESTAMP AS OF TIMESTAMP '2026-06-15 14:00:00 UTC'
WHERE id = 62976;`,
    result: {
      columns: ["name_en"],
      rows: [["(null)"]],
    },
  },
];
```

- [ ] **Step 3: Create architecture decisions data**

`src/data/decisions.ts`:

```ts
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
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd projects/static-hosting && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add projects/static-hosting/src/data/
git commit -m "feat(static-hosting): add project metadata, query data, and decisions"
```

---

## Task 5: ProjectCard Component

**Files:**
- Create: `projects/static-hosting/src/components/ProjectCard.tsx`
- Create: `projects/static-hosting/src/components/ProjectCard.module.css`

- [ ] **Step 1: Create ProjectCard component**

`src/components/ProjectCard.tsx`:

```tsx
import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isThisSite = project.status === "this-site";

  return (
    <Link
      to={project.route}
      className={`${styles.card} ${isThisSite ? styles.thisSite : ""}`}
    >
      <div className={styles.header}>
        <span className={styles.icon}>{project.icon}</span>
        <span
          className={`${styles.badge} ${isThisSite ? styles.badgeThisSite : styles.badgeDeployed}`}
        >
          {isThisSite ? "THIS SITE" : "DEPLOYED"}
        </span>
      </div>
      <h3 className={styles.name}>{project.name}</h3>
      <p className={styles.description}>{project.description}</p>
      <div className={styles.tags}>
        {project.services.map((service) => (
          <span key={service} className={styles.tag}>
            {service}
          </span>
        ))}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create ProjectCard styles**

`src/components/ProjectCard.module.css`:

```css
.card {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, transform 0.2s;
}

.card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.thisSite {
  border-color: var(--accent);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.icon {
  font-size: 24px;
}

.badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
}

.badgeDeployed {
  background: #1a472a;
  color: var(--color-success);
}

.badgeThisSite {
  background: #3d2800;
  color: var(--accent);
}

.name {
  margin: 0 0 6px;
  font-size: 16px;
  color: var(--text-heading);
}

.description {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  background: var(--bg-primary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--text-muted);
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/static-hosting/src/components/ProjectCard*
git commit -m "feat(static-hosting): add ProjectCard component"
```

---

## Task 6: Landing Page

**Files:**
- Create: `projects/static-hosting/src/routes/Landing.tsx`
- Create: `projects/static-hosting/src/routes/Landing.module.css`
- Modify: `projects/static-hosting/src/App.tsx` — replace placeholder

- [ ] **Step 1: Create Landing page**

`src/routes/Landing.tsx`:

```tsx
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS, STATS } from "@/data/projects";
import styles from "./Landing.module.css";

export function Landing() {
  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <h1 className={styles.title}>AWS Architecture Demos</h1>
        <p className={styles.subtitle}>
          Production-grade infrastructure patterns deployed to eu-north-1
        </p>
        <div className={styles.badges}>
          <span className={styles.badge}>CDK Python</span>
          <span className={styles.badge}>eu-north-1</span>
          <span className={styles.badge}>{STATS.projectCount} Projects</span>
        </div>
      </section>

      <section className={styles.grid}>
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </section>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{STATS.projectCount}</span>
          <span className={styles.statLabel}>Projects</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{STATS.serviceCount}</span>
          <span className={styles.statLabel}>AWS Services</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{STATS.dailyCost}</span>
          <span className={styles.statLabel}>Total Cost</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{STATS.region}</span>
          <span className={styles.statLabel}>Region</span>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create Landing styles**

`src/routes/Landing.module.css`:

```css
.landing {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero {
  text-align: center;
  padding: 48px 0 36px;
}

.title {
  margin: 0 0 8px;
  font-size: 32px;
  color: var(--text-heading);
}

.subtitle {
  margin: 0 0 16px;
  color: var(--text-muted);
  font-size: 16px;
}

.badges {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.badge {
  background: var(--bg-card);
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  color: var(--accent);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.stats {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  justify-content: space-around;
  text-align: center;
  margin-bottom: 48px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.statValue {
  font-size: 20px;
  color: var(--accent);
  font-weight: bold;
}

.statLabel {
  font-size: 11px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .stats {
    flex-wrap: wrap;
    gap: 16px;
  }

  .stat {
    min-width: 40%;
  }
}
```

- [ ] **Step 3: Wire Landing into router**

Update `src/App.tsx` — replace the `Placeholder` for the index route:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Landing } from "@/routes/Landing";

function Placeholder({ name }: { name: string }) {
  return <div style={{ padding: 24, color: "var(--text-heading)" }}>{name}</div>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="data-lake" element={<Placeholder name="Data Lake" />} />
          <Route
            path="ha-web-service"
            element={<Placeholder name="HA Web Service" />}
          />
          <Route
            path="rag-bedrock"
            element={<Placeholder name="RAG on Bedrock" />}
          />
          <Route
            path="static-hosting"
            element={<Placeholder name="Static Hosting" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Verify landing page renders**

```bash
cd projects/static-hosting && npm run dev -- --port 3000
```

Expected: hero section, 2x2 project card grid, stats bar. Cards are clickable and navigate to detail routes. Static Hosting card has orange border. Mobile view (resize to <768px) shows single column.

- [ ] **Step 5: Commit**

```bash
git add projects/static-hosting/src/routes/Landing* projects/static-hosting/src/App.tsx
git commit -m "feat(static-hosting): add Landing page with hero, project cards, and stats"
```

---

## Task 7: Shared Detail Page Components (ProjectHeader + TabPanel)

**Files:**
- Create: `projects/static-hosting/src/components/ProjectHeader.tsx`
- Create: `projects/static-hosting/src/components/ProjectHeader.module.css`
- Create: `projects/static-hosting/src/components/TabPanel.tsx`
- Create: `projects/static-hosting/src/components/TabPanel.module.css`
- Create: `projects/static-hosting/src/components/CostTable.tsx`
- Create: `projects/static-hosting/src/components/CostTable.module.css`
- Create: `projects/static-hosting/src/components/DecisionCard.tsx`
- Create: `projects/static-hosting/src/components/DecisionCard.module.css`

- [ ] **Step 1: Create ProjectHeader**

`src/components/ProjectHeader.tsx`:

```tsx
import type { Project } from "@/data/projects";
import styles from "./ProjectHeader.module.css";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const isThisSite = project.status === "this-site";

  return (
    <div className={styles.header}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>
            {project.icon} {project.name}
          </h1>
          <p className={styles.description}>{project.description}</p>
        </div>
        <span
          className={`${styles.badge} ${isThisSite ? styles.badgeThisSite : styles.badgeDeployed}`}
        >
          {isThisSite ? "THIS SITE" : "DEPLOYED"}
        </span>
      </div>
      <div className={styles.tags}>
        {project.services.map((service) => (
          <span key={service} className={styles.tag}>
            {service}
          </span>
        ))}
      </div>
    </div>
  );
}
```

`src/components/ProjectHeader.module.css`:

```css
.header {
  padding: 32px 24px 24px;
  border-bottom: 1px solid var(--border);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
  margin-bottom: 12px;
}

.title {
  margin: 0 0 6px;
  font-size: 24px;
  color: var(--text-heading);
}

.description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.badge {
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.badgeDeployed {
  background: #1a472a;
  color: var(--color-success);
}

.badgeThisSite {
  background: #3d2800;
  color: var(--accent);
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: var(--bg-card);
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--accent);
}
```

- [ ] **Step 2: Create TabPanel**

`src/components/TabPanel.tsx`:

```tsx
import { useState, type ReactNode } from "react";
import styles from "./TabPanel.module.css";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabPanelProps {
  tabs: Tab[];
}

export function TabPanel({ tabs }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div>
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tab.id === activeTab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.content}>{activeContent}</div>
    </div>
  );
}
```

`src/components/TabPanel.module.css`:

```css
.tabBar {
  display: flex;
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
}

.tab {
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  font-family: var(--font-ui);
}

.tab:hover {
  color: var(--text-body);
}

.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.content {
  padding: 24px;
}
```

- [ ] **Step 3: Create CostTable**

`src/components/CostTable.tsx`:

```tsx
import type { CostItem } from "@/data/projects";
import styles from "./CostTable.module.css";

interface CostTableProps {
  items: CostItem[];
  dailyCost: string;
}

export function CostTable({ items, dailyCost }: CostTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Resource</th>
            <th>Unit</th>
            <th>Est. Monthly</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.resource}>
              <td>{item.resource}</td>
              <td className={styles.mono}>{item.unit}</td>
              <td className={styles.cost}>{item.monthlyCost}</td>
              <td className={styles.note}>{item.note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.total}>
        Daily estimate: <span className={styles.totalValue}>{dailyCost}</span>
      </div>
    </div>
  );
}
```

`src/components/CostTable.module.css`:

```css
.wrapper {
  max-width: 720px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  text-align: left;
  padding: 8px 12px;
  background: var(--bg-card);
  color: var(--accent);
  font-weight: 600;
  font-size: 13px;
}

.table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-body);
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

.cost {
  color: var(--accent);
  font-weight: 600;
}

.note {
  color: var(--text-secondary);
  font-size: 13px;
}

.total {
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-deep);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
}

.totalValue {
  color: var(--accent);
  font-weight: bold;
}
```

- [ ] **Step 4: Create DecisionCard**

`src/components/DecisionCard.tsx`:

```tsx
import type { ProjectDecisions } from "@/data/decisions";
import styles from "./DecisionCard.module.css";

interface DecisionCardProps {
  data: ProjectDecisions;
}

export function DecisionCards({ data }: DecisionCardProps) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>Key Architecture Decisions</h3>
      <div className={styles.keyPoints}>
        {data.keyPoints.map((point) => (
          <div key={point.title} className={styles.point}>
            <div className={styles.pointTitle}>{point.title}</div>
            <div className={styles.pointDesc}>{point.description}</div>
          </div>
        ))}
      </div>

      {data.decisions.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Decision Records</h3>
          {data.decisions.map((decision) => (
            <div key={decision.title} className={styles.adr}>
              <h4 className={styles.adrTitle}>{decision.title}</h4>
              <div className={styles.adrSection}>
                <span className={styles.adrLabel}>Context</span>
                <p>{decision.context}</p>
              </div>
              <div className={styles.adrSection}>
                <span className={styles.adrLabel}>Decision</span>
                <p>{decision.decision}</p>
              </div>
              <div className={styles.adrSection}>
                <span className={styles.adrLabel}>Consequences</span>
                <p>{decision.consequences}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
```

`src/components/DecisionCard.module.css`:

```css
.wrapper {
  max-width: 720px;
}

.sectionTitle {
  font-size: 16px;
  color: var(--text-heading);
  margin: 0 0 16px;
}

.keyPoints {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
}

.point {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 16px;
}

.pointTitle {
  color: var(--accent);
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 4px;
}

.pointDesc {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.adr {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 16px;
}

.adrTitle {
  color: var(--text-heading);
  font-size: 15px;
  margin: 0 0 12px;
}

.adrSection {
  margin-bottom: 8px;
}

.adrLabel {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent);
  margin-bottom: 2px;
}

.adrSection p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .keyPoints {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Verify all components compile**

```bash
cd projects/static-hosting && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add projects/static-hosting/src/components/
git commit -m "feat(static-hosting): add ProjectHeader, TabPanel, CostTable, DecisionCard components"
```

---

## Task 8: Architecture Diagrams

**Files:**
- Create: `projects/static-hosting/src/components/ArchDiagram.tsx`
- Create: `projects/static-hosting/src/components/ArchDiagram.module.css`

- [ ] **Step 1: Create ArchDiagram component**

`src/components/ArchDiagram.tsx`:

```tsx
import styles from "./ArchDiagram.module.css";

interface DiagramNode {
  label: string;
  icon: string;
  sublabel?: string;
}

interface DiagramProps {
  nodes: DiagramNode[];
}

function DiagramFlow({ nodes }: DiagramProps) {
  return (
    <div className={styles.flow}>
      {nodes.map((node, i) => (
        <div key={node.label} className={styles.nodeGroup}>
          {i > 0 && <div className={styles.arrow}>→</div>}
          <div className={styles.node}>
            <span className={styles.nodeIcon}>{node.icon}</span>
            <span className={styles.nodeLabel}>{node.label}</span>
            {node.sublabel && (
              <span className={styles.nodeSub}>{node.sublabel}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const DIAGRAMS: Record<string, DiagramNode[]> = {
  "data-lake": [
    { label: "Helsinki API", icon: "🌍" },
    { label: "S3 raw/", icon: "📦", sublabel: "CSV" },
    { label: "Glue Crawler", icon: "🕷️", sublabel: "Schema Detection" },
    { label: "Athena", icon: "🔍", sublabel: "SQL Queries" },
    { label: "S3 curated/", icon: "📦", sublabel: "Parquet / Iceberg" },
  ],
  "ha-web-service": [
    { label: "Internet", icon: "🌍" },
    { label: "ALB", icon: "⚖️", sublabel: "Public Subnet" },
    { label: "Fargate ×2", icon: "🐳", sublabel: "Private Subnet (2 AZ)" },
    { label: "DynamoDB", icon: "📊", sublabel: "VPC Endpoint" },
  ],
  "rag-bedrock": [
    { label: "Client", icon: "💻" },
    { label: "API Gateway", icon: "🚪", sublabel: "API Key + Throttle" },
    { label: "Lambda", icon: "⚡", sublabel: "Retrieve + Invoke" },
    { label: "Bedrock", icon: "🤖", sublabel: "Claude Haiku" },
  ],
  "static-hosting": [
    { label: "Browser", icon: "💻" },
    { label: "CloudFront", icon: "🌐", sublabel: "CDN + HTTPS" },
    { label: "OAC", icon: "🔑", sublabel: "Access Control" },
    { label: "S3 Bucket", icon: "📦", sublabel: "Static Files" },
  ],
};

interface ArchDiagramProps {
  projectId: string;
}

export function ArchDiagram({ projectId }: ArchDiagramProps) {
  const nodes = DIAGRAMS[projectId];
  if (!nodes) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>Architecture Diagram</div>
      <DiagramFlow nodes={nodes} />
    </div>
  );
}
```

- [ ] **Step 2: Create ArchDiagram styles**

`src/components/ArchDiagram.module.css`:

```css
.wrapper {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  margin-bottom: 24px;
}

.label {
  text-align: center;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.flow {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
}

.nodeGroup {
  display: flex;
  align-items: center;
}

.arrow {
  color: var(--border-card);
  font-size: 20px;
  margin: 0 8px;
}

.node {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  min-width: 100px;
  text-align: center;
}

.nodeIcon {
  font-size: 20px;
  margin-bottom: 4px;
}

.nodeLabel {
  font-size: 12px;
  color: var(--text-body);
  font-weight: 600;
}

.nodeSub {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .flow {
    flex-direction: column;
  }

  .arrow {
    transform: rotate(90deg);
    margin: 4px 0;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/static-hosting/src/components/ArchDiagram*
git commit -m "feat(static-hosting): add ArchDiagram component with per-project diagrams"
```

---

## Task 9: QueryViewer Component (Data Lake Demo)

**Files:**
- Create: `projects/static-hosting/src/components/QueryViewer.tsx`
- Create: `projects/static-hosting/src/components/QueryViewer.module.css`

- [ ] **Step 1: Create QueryViewer component**

`src/components/QueryViewer.tsx`:

```tsx
import { useState } from "react";
import { QUERIES } from "@/data/queries";
import styles from "./QueryViewer.module.css";

export function QueryViewer() {
  const [activeQuery, setActiveQuery] = useState(QUERIES[0].id);
  const query = QUERIES.find((q) => q.id === activeQuery) ?? QUERIES[0];

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        {QUERIES.map((q) => (
          <button
            key={q.id}
            className={`${styles.tab} ${q.id === activeQuery ? styles.activeTab : ""}`}
            onClick={() => setActiveQuery(q.id)}
          >
            {q.label}
          </button>
        ))}
      </div>

      <p className={styles.description}>{query.description}</p>

      <pre className={styles.sql}>
        <code>{query.sql}</code>
      </pre>

      <div className={styles.resultLabel}>Results preview (pre-computed):</div>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          {query.result.columns.map((col) => (
            <span key={col}>{col}</span>
          ))}
        </div>
        {query.result.rows.map((row, i) => (
          <div key={i} className={styles.tableRow}>
            {row.map((cell, j) => (
              <span key={j}>{cell}</span>
            ))}
          </div>
        ))}
      </div>

      {query.bytesScanned && (
        <div className={styles.costLine}>
          📊 Bytes scanned:{" "}
          {query.bytesScanned.map((b, i) => (
            <span key={b.format}>
              {i > 0 && " → "}
              <span
                className={
                  b.format === "CSV" ? styles.costHigh : styles.costLow
                }
              >
                {b.bytes} ({b.format})
              </span>
            </span>
          ))}
          {query.bytesScanned.length > 1 && (
            <span className={styles.costSaving}> — 99% reduction</span>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create QueryViewer styles**

`src/components/QueryViewer.module.css`:

```css
.wrapper {
  max-width: 720px;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.tab {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  font-family: var(--font-ui);
}

.tab:hover {
  color: var(--text-body);
}

.activeTab {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
  font-weight: bold;
}

.description {
  color: var(--text-secondary);
  font-size: 13px;
  margin: 0 0 12px;
}

.sql {
  background: var(--bg-deep);
  border-radius: var(--radius-sm);
  padding: 12px;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  margin: 0 0 16px;
  color: var(--text-body);
}

.resultLabel {
  color: var(--text-muted);
  font-size: 12px;
  margin-bottom: 8px;
}

.table {
  background: var(--bg-deep);
  border-radius: var(--radius-sm);
  overflow: hidden;
  font-size: 12px;
  margin-bottom: 16px;
}

.tableHeader {
  display: flex;
  gap: 0;
  background: var(--bg-card);
  padding: 6px 10px;
  color: var(--accent);
  font-weight: bold;
}

.tableHeader span,
.tableRow span {
  flex: 1;
}

.tableRow {
  display: flex;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border);
  color: var(--text-body);
}

.costLine {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

.costHigh {
  color: var(--color-error);
}

.costLow {
  color: var(--color-success);
}

.costSaving {
  color: var(--color-success);
  font-weight: bold;
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/static-hosting/src/components/QueryViewer*
git commit -m "feat(static-hosting): add QueryViewer component for Data Lake demo"
```

---

## Task 10: CrudDemo Component (HA Web Service Demo)

**Files:**
- Create: `projects/static-hosting/src/components/CrudDemo.tsx`
- Create: `projects/static-hosting/src/components/CrudDemo.module.css`

- [ ] **Step 1: Create CrudDemo component**

`src/components/CrudDemo.tsx`:

```tsx
import { useState } from "react";
import styles from "./CrudDemo.module.css";

const API_BASE = import.meta.env.VITE_HA_WEB_API_URL ?? "";

interface ApiResponse {
  status: number;
  latencyMs: number;
  body: unknown;
}

export function CrudDemo() {
  const [name, setName] = useState("Helsinki Central Library");
  const [category, setCategory] = useState("library");
  const [description, setDescription] = useState(
    "Oodi — award-winning public library",
  );
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function callApi(method: string, path: string, body?: unknown) {
    if (!API_BASE) {
      setError("API URL not configured (set VITE_HA_WEB_API_URL)");
      return;
    }
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setResponse({
        status: res.status,
        latencyMs: Math.round(performance.now() - start),
        body: data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    callApi("POST", "/items", { name, category, description });
  }

  function handleList() {
    callApi("GET", "/items");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Create Item</div>
          <label className={styles.label}>
            Name
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Category
            <input
              className={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Description
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button
            className={styles.button}
            onClick={handleCreate}
            disabled={loading}
          >
            POST /items
          </button>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>Response</div>
          {error && <div className={styles.error}>{error}</div>}
          {response && (
            <div className={styles.response}>
              <div className={styles.responseMeta}>
                <span
                  className={
                    response.status < 300
                      ? styles.statusOk
                      : styles.statusError
                  }
                >
                  {response.status}
                </span>
                <span className={styles.latency}>
                  {response.latencyMs}ms
                </span>
              </div>
              <pre className={styles.json}>
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </div>
          )}
          {!response && !error && (
            <div className={styles.placeholder}>
              Send a request to see the response
            </div>
          )}
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={handleList}
              disabled={loading}
            >
              GET /items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CrudDemo styles**

`src/components/CrudDemo.module.css`:

```css
.wrapper {
  max-width: 720px;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.panel {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 16px;
}

.panelTitle {
  color: var(--accent);
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 12px;
}

.label {
  display: block;
  color: var(--text-muted);
  font-size: 11px;
  margin-bottom: 8px;
}

.input,
.textarea {
  display: block;
  width: 100%;
  margin-top: 4px;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text-body);
  font-family: var(--font-ui);
}

.textarea {
  min-height: 60px;
  resize: vertical;
}

.button {
  width: 100%;
  margin-top: 4px;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  font-family: var(--font-ui);
}

.button:hover {
  background: var(--accent-hover);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.response {
  background: var(--bg-deep);
  border-radius: var(--radius-sm);
  padding: 12px;
}

.responseMeta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.statusOk {
  color: var(--color-success);
  font-weight: 600;
}

.statusError {
  color: var(--color-error);
  font-weight: 600;
}

.latency {
  color: var(--text-muted);
  font-size: 13px;
}

.json {
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  margin: 0;
  color: var(--text-body);
}

.error {
  color: var(--color-error);
  font-size: 13px;
  margin-bottom: 8px;
}

.placeholder {
  color: var(--text-muted);
  font-size: 13px;
  padding: 24px;
  text-align: center;
}

.actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.actionButton {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  font-family: var(--font-ui);
}

.actionButton:hover {
  color: var(--text-body);
}

.actionButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .panels {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/static-hosting/src/components/CrudDemo*
git commit -m "feat(static-hosting): add CrudDemo component for HA Web Service"
```

---

## Task 11: ChatDemo Component (RAG Demo)

**Files:**
- Create: `projects/static-hosting/src/components/ChatDemo.tsx`
- Create: `projects/static-hosting/src/components/ChatDemo.module.css`

- [ ] **Step 1: Create ChatDemo component**

`src/components/ChatDemo.tsx`:

```tsx
import { useState } from "react";
import styles from "./ChatDemo.module.css";

const API_BASE = import.meta.env.VITE_RAG_API_URL ?? "";
const API_KEY = import.meta.env.VITE_RAG_API_KEY ?? "";

interface Message {
  role: "user" | "assistant";
  content: string;
  meta?: { sourcesUsed: number; model: string; latencyMs: number };
}

export function ChatDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const question = input.trim();
    if (!question) return;

    if (!API_BASE || !API_KEY) {
      setError("RAG API not configured (set VITE_RAG_API_URL and VITE_RAG_API_KEY)");
      return;
    }

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const latencyMs = Math.round(performance.now() - start);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          meta: {
            sourcesUsed: data.sources_used,
            model: data.model,
            latencyMs,
          },
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.chat}>
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.empty}>
              Ask a question about Helsinki services
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.role === "user" ? styles.userMsg : styles.assistantMsg
              }
            >
              <div className={styles.msgContent}>{msg.content}</div>
              {msg.meta && (
                <div className={styles.meta}>
                  {msg.meta.sourcesUsed} sources · {msg.meta.model.split("/").pop()} ·{" "}
                  {(msg.meta.latencyMs / 1000).toFixed(1)}s
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className={styles.assistantMsg}>
              <div className={styles.msgContent}>Thinking...</div>
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Helsinki services..."
            disabled={loading}
          />
          <button
            className={styles.sendButton}
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
          >
            Ask →
          </button>
        </div>
      </div>
      <div className={styles.rateNote}>
        Rate limited: 10 req/sec, 100 req/day
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ChatDemo styles**

`src/components/ChatDemo.module.css`:

```css
.wrapper {
  max-width: 600px;
}

.chat {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 16px;
}

.messages {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.empty {
  color: var(--text-muted);
  text-align: center;
  padding: 48px 0;
  font-size: 14px;
}

.userMsg {
  background: var(--bg-deep);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 8px;
  max-width: 80%;
}

.assistantMsg {
  background: #1a472a;
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 4px;
  margin-left: 20%;
  max-width: 80%;
}

.msgContent {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-body);
}

.meta {
  text-align: right;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

.error {
  color: var(--color-error);
  font-size: 13px;
  margin-bottom: 8px;
}

.inputRow {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 13px;
  color: var(--text-body);
  font-family: var(--font-ui);
}

.sendButton {
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  font-family: var(--font-ui);
}

.sendButton:hover {
  background: var(--accent-hover);
}

.sendButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rateNote {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 8px;
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/static-hosting/src/components/ChatDemo*
git commit -m "feat(static-hosting): add ChatDemo component for RAG on Bedrock"
```

---

## Task 12: Wire Up All Detail Pages

**Files:**
- Create: `projects/static-hosting/src/routes/DataLake.tsx`
- Create: `projects/static-hosting/src/routes/HaWebService.tsx`
- Create: `projects/static-hosting/src/routes/RagBedrock.tsx`
- Create: `projects/static-hosting/src/routes/StaticHosting.tsx`
- Create: `projects/static-hosting/src/routes/ProjectDetail.module.css`
- Modify: `projects/static-hosting/src/App.tsx`

- [ ] **Step 1: Create shared detail page styles**

`src/routes/ProjectDetail.module.css`:

```css
.page {
  max-width: 960px;
  margin: 0 auto;
}

.backLink {
  display: inline-block;
  padding: 12px 24px;
  font-size: 14px;
  color: var(--accent);
}

.backLink:hover {
  color: var(--accent-hover);
}
```

- [ ] **Step 2: Create DataLake detail page**

`src/routes/DataLake.tsx`:

```tsx
import { Link } from "react-router-dom";
import { PROJECTS } from "@/data/projects";
import { DECISIONS } from "@/data/decisions";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TabPanel } from "@/components/TabPanel";
import { ArchDiagram } from "@/components/ArchDiagram";
import { QueryViewer } from "@/components/QueryViewer";
import { CostTable } from "@/components/CostTable";
import { DecisionCards } from "@/components/DecisionCard";
import styles from "./ProjectDetail.module.css";

const PROJECT = PROJECTS.find((p) => p.id === "data-lake")!;
const PROJECT_DECISIONS = DECISIONS["data-lake"];

export function DataLake() {
  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Back to Projects
      </Link>
      <ProjectHeader project={PROJECT} />
      <TabPanel
        tabs={[
          {
            id: "architecture",
            label: "Architecture",
            content: (
              <>
                <ArchDiagram projectId="data-lake" />
                <DecisionCards data={PROJECT_DECISIONS} />
              </>
            ),
          },
          {
            id: "try-it",
            label: "Try It",
            content: <QueryViewer />,
          },
          {
            id: "cost",
            label: "Cost",
            content: (
              <CostTable
                items={PROJECT.costItems}
                dailyCost={PROJECT.dailyCost}
              />
            ),
          },
          {
            id: "decisions",
            label: "Decisions",
            content: <DecisionCards data={PROJECT_DECISIONS} />,
          },
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create HaWebService detail page**

`src/routes/HaWebService.tsx`:

```tsx
import { Link } from "react-router-dom";
import { PROJECTS } from "@/data/projects";
import { DECISIONS } from "@/data/decisions";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TabPanel } from "@/components/TabPanel";
import { ArchDiagram } from "@/components/ArchDiagram";
import { CrudDemo } from "@/components/CrudDemo";
import { CostTable } from "@/components/CostTable";
import { DecisionCards } from "@/components/DecisionCard";
import styles from "./ProjectDetail.module.css";

const PROJECT = PROJECTS.find((p) => p.id === "ha-web-service")!;
const PROJECT_DECISIONS = DECISIONS["ha-web-service"];

export function HaWebService() {
  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Back to Projects
      </Link>
      <ProjectHeader project={PROJECT} />
      <TabPanel
        tabs={[
          {
            id: "architecture",
            label: "Architecture",
            content: (
              <>
                <ArchDiagram projectId="ha-web-service" />
                <DecisionCards data={PROJECT_DECISIONS} />
              </>
            ),
          },
          {
            id: "try-it",
            label: "Try It",
            content: <CrudDemo />,
          },
          {
            id: "cost",
            label: "Cost",
            content: (
              <CostTable
                items={PROJECT.costItems}
                dailyCost={PROJECT.dailyCost}
              />
            ),
          },
          {
            id: "decisions",
            label: "Decisions",
            content: <DecisionCards data={PROJECT_DECISIONS} />,
          },
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 4: Create RagBedrock detail page**

`src/routes/RagBedrock.tsx`:

```tsx
import { Link } from "react-router-dom";
import { PROJECTS } from "@/data/projects";
import { DECISIONS } from "@/data/decisions";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TabPanel } from "@/components/TabPanel";
import { ArchDiagram } from "@/components/ArchDiagram";
import { ChatDemo } from "@/components/ChatDemo";
import { CostTable } from "@/components/CostTable";
import { DecisionCards } from "@/components/DecisionCard";
import styles from "./ProjectDetail.module.css";

const PROJECT = PROJECTS.find((p) => p.id === "rag-bedrock")!;
const PROJECT_DECISIONS = DECISIONS["rag-bedrock"];

export function RagBedrock() {
  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Back to Projects
      </Link>
      <ProjectHeader project={PROJECT} />
      <TabPanel
        tabs={[
          {
            id: "architecture",
            label: "Architecture",
            content: (
              <>
                <ArchDiagram projectId="rag-bedrock" />
                <DecisionCards data={PROJECT_DECISIONS} />
              </>
            ),
          },
          {
            id: "try-it",
            label: "Try It",
            content: <ChatDemo />,
          },
          {
            id: "cost",
            label: "Cost",
            content: (
              <CostTable
                items={PROJECT.costItems}
                dailyCost={PROJECT.dailyCost}
              />
            ),
          },
          {
            id: "decisions",
            label: "Decisions",
            content: <DecisionCards data={PROJECT_DECISIONS} />,
          },
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 5: Create StaticHosting detail page**

`src/routes/StaticHosting.tsx`:

```tsx
import { Link } from "react-router-dom";
import { PROJECTS } from "@/data/projects";
import { DECISIONS } from "@/data/decisions";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TabPanel } from "@/components/TabPanel";
import { ArchDiagram } from "@/components/ArchDiagram";
import { CostTable } from "@/components/CostTable";
import { DecisionCards } from "@/components/DecisionCard";
import styles from "./ProjectDetail.module.css";

const PROJECT = PROJECTS.find((p) => p.id === "static-hosting")!;
const PROJECT_DECISIONS = DECISIONS["static-hosting"];

function ThisSiteDemo() {
  return (
    <div style={{ maxWidth: 600 }}>
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          padding: 20,
        }}
      >
        <h3
          style={{
            color: "var(--text-heading)",
            margin: "0 0 12px",
            fontSize: 16,
          }}
        >
          You are here
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 13,
            lineHeight: 1.5,
            margin: "0 0 16px",
          }}
        >
          This portfolio is itself an AWS project. It's a React SPA built with
          Vite and TypeScript, deployed to an S3 bucket behind a CloudFront
          distribution with Origin Access Control (OAC).
        </p>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 13,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Every <code style={{ color: "var(--accent)" }}>make deploy-static</code>{" "}
          builds the React app, uploads the dist/ to S3, and invalidates the
          CloudFront cache — all via a CDK BucketDeployment construct.
        </p>
      </div>
    </div>
  );
}

export function StaticHosting() {
  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Back to Projects
      </Link>
      <ProjectHeader project={PROJECT} />
      <TabPanel
        tabs={[
          {
            id: "architecture",
            label: "Architecture",
            content: (
              <>
                <ArchDiagram projectId="static-hosting" />
                <DecisionCards data={PROJECT_DECISIONS} />
              </>
            ),
          },
          {
            id: "try-it",
            label: "Try It",
            content: <ThisSiteDemo />,
          },
          {
            id: "cost",
            label: "Cost",
            content: (
              <CostTable
                items={PROJECT.costItems}
                dailyCost={PROJECT.dailyCost}
              />
            ),
          },
          {
            id: "decisions",
            label: "Decisions",
            content: <DecisionCards data={PROJECT_DECISIONS} />,
          },
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 6: Update App.tsx with real routes**

`src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Landing } from "@/routes/Landing";
import { DataLake } from "@/routes/DataLake";
import { HaWebService } from "@/routes/HaWebService";
import { RagBedrock } from "@/routes/RagBedrock";
import { StaticHosting } from "@/routes/StaticHosting";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="data-lake" element={<DataLake />} />
          <Route path="ha-web-service" element={<HaWebService />} />
          <Route path="rag-bedrock" element={<RagBedrock />} />
          <Route path="static-hosting" element={<StaticHosting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 7: Verify all pages render**

```bash
cd projects/static-hosting && npm run dev -- --port 3000
```

Navigate through all routes. Each detail page should show: back link, project header, 4 tabs. Architecture tab shows diagram + key points. Try It tab shows the project-specific demo component. Cost tab shows cost table. Decisions tab shows ADRs.

- [ ] **Step 8: Verify build succeeds**

```bash
cd projects/static-hosting && npm run build
```

Expected: `dist/` created with no errors.

- [ ] **Step 9: Commit**

```bash
git add projects/static-hosting/src/routes/ projects/static-hosting/src/App.tsx
git commit -m "feat(static-hosting): add all detail pages with tabs and demos"
```

---

## Task 13: CORS — HA Web Service

**Files:**
- Modify: `projects/ha-web-service/app/main.py:1-10`

- [ ] **Step 1: Add CORS middleware to FastAPI**

Add after the `app = FastAPI(...)` line in `projects/ha-web-service/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)
```

Using `allow_origins=["*"]` for the demo. In production, restrict to the CloudFront domain.

- [ ] **Step 2: Verify the app still starts locally**

```bash
cd projects/ha-web-service/app && python -c "from main import app; print('OK')"
```

Expected: `OK` (no import errors).

- [ ] **Step 3: Commit**

```bash
git add projects/ha-web-service/app/main.py
git commit -m "feat(ha-web-service): add CORS middleware for frontend integration"
```

---

## Task 14: CORS — RAG API Gateway

**Files:**
- Modify: `projects/rag-bedrock/cdk/cdk/rag_stack.py:56-70` (api definition area)

- [ ] **Step 1: Add CORS to API Gateway**

In `projects/rag-bedrock/cdk/cdk/rag_stack.py`, add `default_cors_preflight_options` to the `RestApi` constructor:

```python
        api = apigw.RestApi(
            self,
            "RagApi",
            rest_api_name="Helsinki RAG API",
            description="RAG-powered Q&A over Helsinki service map data",
            deploy_options=apigw.StageOptions(
                stage_name="prod",
                throttling_rate_limit=10,
                throttling_burst_limit=5,
            ),
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=["GET", "POST", "OPTIONS"],
                allow_headers=["Content-Type", "x-api-key"],
            ),
        )
```

- [ ] **Step 2: Verify CDK synth**

```bash
cd projects/rag-bedrock/cdk && source .venv/bin/activate && cdk synth --quiet
```

Expected: no errors, CloudFormation template generated.

- [ ] **Step 3: Commit**

```bash
git add projects/rag-bedrock/cdk/cdk/rag_stack.py
git commit -m "feat(rag-bedrock): add CORS to API Gateway for frontend integration"
```

---

## Task 15: CDK Stack — S3 + CloudFront

**Files:**
- Create: `projects/static-hosting/cdk/app.py`
- Create: `projects/static-hosting/cdk/cdk/__init__.py`
- Create: `projects/static-hosting/cdk/cdk/static_hosting_stack.py`
- Create: `projects/static-hosting/cdk/cdk.json`
- Create: `projects/static-hosting/cdk/requirements.txt`

- [ ] **Step 1: Create CDK requirements**

`projects/static-hosting/cdk/requirements.txt`:

```
aws-cdk-lib>=2.259.0
constructs>=10.5.0
```

- [ ] **Step 2: Create CDK app entry point**

`projects/static-hosting/cdk/app.py`:

```python
#!/usr/bin/env python3
import aws_cdk as cdk
from cdk.static_hosting_stack import StaticHostingStack

app = cdk.App()
StaticHostingStack(
    app,
    "StaticHostingStack",
    env=cdk.Environment(region="eu-north-1"),
)
app.synth()
```

- [ ] **Step 3: Create cdk.json**

`projects/static-hosting/cdk/cdk.json`:

```json
{
  "app": "python3 app.py",
  "watch": {
    "include": ["**"],
    "exclude": ["README.md", "cdk*.json", "requirements*.txt", "**/__pycache__", "tests"]
  }
}
```

- [ ] **Step 4: Create empty __init__.py**

`projects/static-hosting/cdk/cdk/__init__.py`: empty file.

- [ ] **Step 5: Create the stack**

`projects/static-hosting/cdk/cdk/static_hosting_stack.py`:

```python
from aws_cdk import (
    Stack,
    RemovalPolicy,
    CfnOutput,
    Tags,
    Duration,
    aws_s3 as s3,
    aws_s3_deployment as s3_deploy,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
)
from constructs import Construct


class StaticHostingStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        Tags.of(self).add("Project", "static-hosting")
        Tags.of(self).add("Owner", "jussi")
        Tags.of(self).add("Environment", "demo")

        bucket = s3.Bucket(
            self,
            "SiteBucket",
            versioned=True,
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
        )

        distribution = cloudfront.Distribution(
            self,
            "SiteDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED,
            ),
            default_root_object="index.html",
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_page_path="/index.html",
                    response_http_status=200,
                    ttl=Duration.seconds(0),
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_page_path="/index.html",
                    response_http_status=200,
                    ttl=Duration.seconds(0),
                ),
            ],
        )

        s3_deploy.BucketDeployment(
            self,
            "DeploySite",
            sources=[s3_deploy.Source.asset("../dist")],
            destination_bucket=bucket,
            distribution=distribution,
            distribution_paths=["/*"],
        )

        CfnOutput(self, "DistributionUrl",
                  value=f"https://{distribution.distribution_domain_name}")
        CfnOutput(self, "BucketName", value=bucket.bucket_name)
```

- [ ] **Step 6: Set up Python venv and install**

```bash
cd projects/static-hosting/cdk && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
```

- [ ] **Step 7: Build frontend first, then verify CDK synth**

```bash
cd projects/static-hosting && npm run build
cd projects/static-hosting/cdk && source .venv/bin/activate && cdk synth --quiet
```

Expected: CloudFormation template generated, no errors. The stack references `../dist` which must exist from the npm build.

- [ ] **Step 8: Commit**

```bash
git add projects/static-hosting/cdk/
git commit -m "feat(static-hosting): add CDK stack for S3 + CloudFront hosting"
```

---

## Task 16: Makefile Updates

**Files:**
- Modify: `Makefile`

- [ ] **Step 1: Add static-hosting targets to Makefile**

Add these targets to the existing `Makefile`:

```makefile
build-static:
	cd projects/static-hosting && npm run build

deploy-static: build-static
	cd projects/static-hosting/cdk && source .venv/bin/activate && cdk deploy

destroy-static:
	cd projects/static-hosting/cdk && source .venv/bin/activate && cdk destroy
```

Update the existing `lint` target to include static-hosting:

```makefile
lint:
	@cd projects/data-lake/cdk && source .venv/bin/activate && python -m py_compile cdk/data_lake_stack.py
	@cd projects/ha-web-service/cdk && source .venv/bin/activate && python -m py_compile cdk/ha_web_stack.py
	@cd projects/static-hosting/cdk && source .venv/bin/activate && python -m py_compile cdk/static_hosting_stack.py
	@cd projects/static-hosting && npx tsc --noEmit
	@echo "Lint OK"
```

Update the existing `synth` target:

```makefile
synth:
	cd projects/data-lake/cdk && source .venv/bin/activate && cdk synth --quiet
	cd projects/ha-web-service/cdk && source .venv/bin/activate && cdk synth --quiet
	cd projects/static-hosting && npm run build && cd cdk && source .venv/bin/activate && cdk synth --quiet
```

- [ ] **Step 2: Verify make lint**

```bash
make lint
```

Expected: "Lint OK"

- [ ] **Step 3: Commit**

```bash
git add Makefile
git commit -m "feat: add static-hosting targets to Makefile"
```

---

## Task 17: Environment Config + .gitignore

**Files:**
- Create: `projects/static-hosting/.env.example`
- Create: `projects/static-hosting/.gitignore`

- [ ] **Step 1: Create .env.example**

`projects/static-hosting/.env.example`:

```
VITE_HA_WEB_API_URL=https://your-alb-url.eu-north-1.elb.amazonaws.com
VITE_RAG_API_URL=https://your-api-id.execute-api.eu-north-1.amazonaws.com/prod/
VITE_RAG_API_KEY=your-api-key-here
```

- [ ] **Step 2: Create .gitignore**

`projects/static-hosting/.gitignore`:

```
node_modules/
dist/
.env
.env.local
cdk/.venv/
cdk/cdk.out/
```

- [ ] **Step 3: Commit**

```bash
git add projects/static-hosting/.env.example projects/static-hosting/.gitignore
git commit -m "chore(static-hosting): add .env.example and .gitignore"
```

---

## Task 18: Final Verification

- [ ] **Step 1: Run full build**

```bash
cd projects/static-hosting && npm run build
```

Expected: `dist/` generated, no errors.

- [ ] **Step 2: Run type check**

```bash
cd projects/static-hosting && npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 3: Run make lint from project root**

```bash
make lint
```

Expected: "Lint OK"

- [ ] **Step 4: Manual browser walkthrough**

```bash
cd projects/static-hosting && npm run dev -- --port 3000
```

Verify:
1. Landing page: hero, 4 project cards, stats bar
2. Each detail page: header, 4 working tabs
3. Data Lake Try It: query tabs switch, SQL + results display
4. Static Hosting Try It: "You are here" content
5. HA Web Service Try It: form renders (API calls need `.env` configured)
6. RAG Try It: chat renders (API calls need `.env` configured)
7. Mobile responsive: resize to <768px, single column layout
8. Navigation: back links, Projects nav link, sticky nav

- [ ] **Step 5: Commit any final fixes if needed**

```bash
git add -A && git commit -m "fix(static-hosting): address final verification issues"
```

Only if there are fixes. Skip if everything passes.

---

## Task 19: Set Up Vitest + React Testing Library

**Files:**
- Modify: `projects/static-hosting/package.json` (add dev deps)
- Create: `projects/static-hosting/vitest.config.ts`
- Create: `projects/static-hosting/src/test/setup.ts`

- [ ] **Step 1: Install test dependencies**

```bash
cd projects/static-hosting
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

- [ ] **Step 2: Create vitest config**

`projects/static-hosting/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
```

- [ ] **Step 3: Create test setup file**

`projects/static-hosting/src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add test script to package.json**

Add to `scripts` in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 5: Verify vitest runs (no tests yet)**

```bash
cd projects/static-hosting && npm test
```

Expected: "No test files found" or similar — confirms vitest is configured.

- [ ] **Step 6: Commit**

```bash
git add projects/static-hosting/vitest.config.ts projects/static-hosting/src/test/ projects/static-hosting/package.json projects/static-hosting/package-lock.json
git commit -m "chore(static-hosting): set up Vitest + React Testing Library"
```

---

## Task 20: Data Layer Tests

**Files:**
- Create: `projects/static-hosting/src/data/projects.test.ts`
- Create: `projects/static-hosting/src/data/queries.test.ts`
- Create: `projects/static-hosting/src/data/decisions.test.ts`

- [ ] **Step 1: Write project data tests**

`src/data/projects.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PROJECTS, STATS } from "./projects";

describe("PROJECTS", () => {
  it("has exactly 4 projects", () => {
    expect(PROJECTS).toHaveLength(4);
  });

  it("each project has required fields", () => {
    for (const p of PROJECTS) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.route).toMatch(/^\//);
      expect(p.services.length).toBeGreaterThan(0);
      expect(p.costItems.length).toBeGreaterThan(0);
    }
  });

  it("has unique ids and routes", () => {
    const ids = PROJECTS.map((p) => p.id);
    const routes = PROJECTS.map((p) => p.route);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("static-hosting has this-site status", () => {
    const staticHosting = PROJECTS.find((p) => p.id === "static-hosting");
    expect(staticHosting?.status).toBe("this-site");
  });

  it("all other projects have deployed status", () => {
    const others = PROJECTS.filter((p) => p.id !== "static-hosting");
    for (const p of others) {
      expect(p.status).toBe("deployed");
    }
  });
});

describe("STATS", () => {
  it("project count matches PROJECTS length", () => {
    expect(STATS.projectCount).toBe(PROJECTS.length);
  });

  it("region is eu-north-1", () => {
    expect(STATS.region).toBe("eu-north-1");
  });
});
```

- [ ] **Step 2: Write query data tests**

`src/data/queries.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { QUERIES } from "./queries";

describe("QUERIES", () => {
  it("has 8 queries matching the SQL files", () => {
    expect(QUERIES).toHaveLength(8);
  });

  it("each query has required fields", () => {
    for (const q of QUERIES) {
      expect(q.id).toBeTruthy();
      expect(q.label).toBeTruthy();
      expect(q.sql).toBeTruthy();
      expect(q.result.columns.length).toBeGreaterThan(0);
      expect(q.result.rows.length).toBeGreaterThan(0);
    }
  });

  it("has unique ids", () => {
    const ids = QUERIES.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("query-parquet has both CSV and Parquet bytes scanned", () => {
    const parquet = QUERIES.find((q) => q.id === "query-parquet");
    expect(parquet?.bytesScanned).toHaveLength(2);
    expect(parquet?.bytesScanned?.[0].format).toBe("CSV");
    expect(parquet?.bytesScanned?.[1].format).toBe("Parquet");
  });
});
```

- [ ] **Step 3: Write decisions data tests**

`src/data/decisions.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { DECISIONS } from "./decisions";
import { PROJECTS } from "./projects";

describe("DECISIONS", () => {
  it("has decisions for every project", () => {
    for (const p of PROJECTS) {
      expect(DECISIONS[p.id]).toBeDefined();
      expect(DECISIONS[p.id].projectId).toBe(p.id);
    }
  });

  it("each project has at least one key point", () => {
    for (const d of Object.values(DECISIONS)) {
      expect(d.keyPoints.length).toBeGreaterThan(0);
    }
  });

  it("each key point has title and description", () => {
    for (const d of Object.values(DECISIONS)) {
      for (const kp of d.keyPoints) {
        expect(kp.title).toBeTruthy();
        expect(kp.description).toBeTruthy();
      }
    }
  });

  it("each decision has context, decision, and consequences", () => {
    for (const d of Object.values(DECISIONS)) {
      for (const dec of d.decisions) {
        expect(dec.title).toBeTruthy();
        expect(dec.context).toBeTruthy();
        expect(dec.decision).toBeTruthy();
        expect(dec.consequences).toBeTruthy();
      }
    }
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd projects/static-hosting && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add projects/static-hosting/src/data/*.test.ts
git commit -m "test(static-hosting): add data layer tests"
```

---

## Task 21: Component Tests — ProjectCard, TabPanel, CostTable

**Files:**
- Create: `projects/static-hosting/src/components/ProjectCard.test.tsx`
- Create: `projects/static-hosting/src/components/TabPanel.test.tsx`
- Create: `projects/static-hosting/src/components/CostTable.test.tsx`

- [ ] **Step 1: Write ProjectCard tests**

`src/components/ProjectCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectCard } from "./ProjectCard";
import { PROJECTS } from "@/data/projects";

function renderCard(projectId: string) {
  const project = PROJECTS.find((p) => p.id === projectId)!;
  return render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>,
  );
}

describe("ProjectCard", () => {
  it("renders project name and description", () => {
    renderCard("data-lake");
    expect(screen.getByText("Data Lake")).toBeInTheDocument();
    expect(screen.getByText(/S3 → Glue → Athena/)).toBeInTheDocument();
  });

  it("renders service tags", () => {
    renderCard("ha-web-service");
    expect(screen.getByText("VPC")).toBeInTheDocument();
    expect(screen.getByText("Fargate")).toBeInTheDocument();
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
  });

  it("shows DEPLOYED badge for deployed projects", () => {
    renderCard("data-lake");
    expect(screen.getByText("DEPLOYED")).toBeInTheDocument();
  });

  it("shows THIS SITE badge for static-hosting", () => {
    renderCard("static-hosting");
    expect(screen.getByText("THIS SITE")).toBeInTheDocument();
  });

  it("links to the project route", () => {
    renderCard("rag-bedrock");
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/rag-bedrock");
  });
});
```

- [ ] **Step 2: Write TabPanel tests**

`src/components/TabPanel.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabPanel } from "./TabPanel";

const TABS = [
  { id: "a", label: "Tab A", content: <div>Content A</div> },
  { id: "b", label: "Tab B", content: <div>Content B</div> },
  { id: "c", label: "Tab C", content: <div>Content C</div> },
];

describe("TabPanel", () => {
  it("renders all tab labels", () => {
    render(<TabPanel tabs={TABS} />);
    expect(screen.getByText("Tab A")).toBeInTheDocument();
    expect(screen.getByText("Tab B")).toBeInTheDocument();
    expect(screen.getByText("Tab C")).toBeInTheDocument();
  });

  it("shows first tab content by default", () => {
    render(<TabPanel tabs={TABS} />);
    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.queryByText("Content B")).not.toBeInTheDocument();
  });

  it("switches content when clicking a tab", async () => {
    const user = userEvent.setup();
    render(<TabPanel tabs={TABS} />);

    await user.click(screen.getByText("Tab B"));
    expect(screen.getByText("Content B")).toBeInTheDocument();
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Write CostTable tests**

`src/components/CostTable.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CostTable } from "./CostTable";
import type { CostItem } from "@/data/projects";

const ITEMS: CostItem[] = [
  { resource: "S3 Storage", unit: "GB/month", monthlyCost: "<$0.01" },
  {
    resource: "CloudFront",
    unit: "per request",
    monthlyCost: "<$1",
    note: "Free tier covers demo traffic",
  },
];

describe("CostTable", () => {
  it("renders all cost items", () => {
    render(<CostTable items={ITEMS} dailyCost="<$0.01" />);
    expect(screen.getByText("S3 Storage")).toBeInTheDocument();
    expect(screen.getByText("CloudFront")).toBeInTheDocument();
  });

  it("renders monthly costs", () => {
    render(<CostTable items={ITEMS} dailyCost="<$0.01" />);
    expect(screen.getByText("<$0.01")).toBeInTheDocument();
    expect(screen.getByText("<$1")).toBeInTheDocument();
  });

  it("renders notes when present", () => {
    render(<CostTable items={ITEMS} dailyCost="<$0.01" />);
    expect(screen.getByText("Free tier covers demo traffic")).toBeInTheDocument();
  });

  it("renders daily cost estimate", () => {
    render(<CostTable items={ITEMS} dailyCost="~$1.50" />);
    expect(screen.getByText("~$1.50")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd projects/static-hosting && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add projects/static-hosting/src/components/*.test.tsx
git commit -m "test(static-hosting): add ProjectCard, TabPanel, CostTable component tests"
```

---

## Task 22: Component Tests — ArchDiagram, QueryViewer, DecisionCards

**Files:**
- Create: `projects/static-hosting/src/components/ArchDiagram.test.tsx`
- Create: `projects/static-hosting/src/components/QueryViewer.test.tsx`
- Create: `projects/static-hosting/src/components/DecisionCard.test.tsx`

- [ ] **Step 1: Write ArchDiagram tests**

`src/components/ArchDiagram.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArchDiagram } from "./ArchDiagram";

describe("ArchDiagram", () => {
  it("renders diagram nodes for data-lake", () => {
    render(<ArchDiagram projectId="data-lake" />);
    expect(screen.getByText("Helsinki API")).toBeInTheDocument();
    expect(screen.getByText("Glue Crawler")).toBeInTheDocument();
    expect(screen.getByText("Athena")).toBeInTheDocument();
  });

  it("renders diagram nodes for ha-web-service", () => {
    render(<ArchDiagram projectId="ha-web-service" />);
    expect(screen.getByText("ALB")).toBeInTheDocument();
    expect(screen.getByText("Fargate ×2")).toBeInTheDocument();
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
  });

  it("renders sublabels", () => {
    render(<ArchDiagram projectId="rag-bedrock" />);
    expect(screen.getByText("API Key + Throttle")).toBeInTheDocument();
    expect(screen.getByText("Claude Haiku")).toBeInTheDocument();
  });

  it("returns null for unknown projectId", () => {
    const { container } = render(<ArchDiagram projectId="nonexistent" />);
    expect(container.innerHTML).toBe("");
  });
});
```

- [ ] **Step 2: Write QueryViewer tests**

`src/components/QueryViewer.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryViewer } from "./QueryViewer";

describe("QueryViewer", () => {
  it("renders query tabs", () => {
    render(<QueryViewer />);
    expect(screen.getByText("Explore Raw")).toBeInTheDocument();
    expect(screen.getByText("CSV → Parquet")).toBeInTheDocument();
    expect(screen.getByText("Time Travel")).toBeInTheDocument();
  });

  it("shows first query SQL by default", () => {
    render(<QueryViewer />);
    expect(screen.getByText(/SELECT municipality, COUNT/)).toBeInTheDocument();
  });

  it("switches query on tab click", async () => {
    const user = userEvent.setup();
    render(<QueryViewer />);

    await user.click(screen.getByText("Iceberg UPDATE"));
    expect(screen.getByText(/UPDATE helsinki_open_data/)).toBeInTheDocument();
  });

  it("shows bytes scanned comparison when available", () => {
    render(<QueryViewer />);
    expect(screen.getByText("2.1 MB (CSV)")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Write DecisionCards tests**

`src/components/DecisionCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DecisionCards } from "./DecisionCard";
import { DECISIONS } from "@/data/decisions";

describe("DecisionCards", () => {
  it("renders key points for ha-web-service", () => {
    render(<DecisionCards data={DECISIONS["ha-web-service"]} />);
    expect(screen.getByText("No NAT Gateways")).toBeInTheDocument();
    expect(screen.getByText("Multi-AZ")).toBeInTheDocument();
    expect(screen.getByText("Least-Privilege IAM")).toBeInTheDocument();
  });

  it("renders decision records", () => {
    render(<DecisionCards data={DECISIONS["ha-web-service"]} />);
    expect(screen.getByText("VPC endpoints over NAT Gateways")).toBeInTheDocument();
    expect(screen.getByText("Fargate over EC2")).toBeInTheDocument();
  });

  it("renders context, decision, and consequences for each ADR", () => {
    render(<DecisionCards data={DECISIONS["rag-bedrock"]} />);
    expect(screen.getByText("Context")).toBeInTheDocument();
    expect(screen.getByText("Decision")).toBeInTheDocument();
    expect(screen.getByText("Consequences")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd projects/static-hosting && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add projects/static-hosting/src/components/ArchDiagram.test.tsx projects/static-hosting/src/components/QueryViewer.test.tsx projects/static-hosting/src/components/DecisionCard.test.tsx
git commit -m "test(static-hosting): add ArchDiagram, QueryViewer, DecisionCard tests"
```

---

## Task 23: Route Tests — Landing + App Router

**Files:**
- Create: `projects/static-hosting/src/routes/Landing.test.tsx`
- Create: `projects/static-hosting/src/App.test.tsx`

- [ ] **Step 1: Write Landing page tests**

`src/routes/Landing.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Landing } from "./Landing";

describe("Landing", () => {
  it("renders hero title", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(screen.getByText("AWS Architecture Demos")).toBeInTheDocument();
  });

  it("renders all 4 project cards", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(screen.getByText("Data Lake")).toBeInTheDocument();
    expect(screen.getByText("HA Web Service")).toBeInTheDocument();
    expect(screen.getByText("RAG on Bedrock")).toBeInTheDocument();
    expect(screen.getByText("Static Hosting")).toBeInTheDocument();
  });

  it("renders stats bar", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(screen.getByText("eu-north-1")).toBeInTheDocument();
    expect(screen.getByText("12+")).toBeInTheDocument();
  });

  it("renders tech badges", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(screen.getByText("CDK Python")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Write App router tests**

`src/App.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Landing } from "@/routes/Landing";

function renderWithRouter(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [{ index: true, element: <Landing /> }],
      },
    ],
    { initialEntries: [initialPath] },
  );
  return render(<RouterProvider router={router} />);
}

describe("App Router", () => {
  it("renders nav with logo", () => {
    renderWithRouter("/");
    expect(screen.getByText("☁ AWS Portfolio")).toBeInTheDocument();
  });

  it("renders landing page at /", () => {
    renderWithRouter("/");
    expect(screen.getByText("AWS Architecture Demos")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run all tests**

```bash
cd projects/static-hosting && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add projects/static-hosting/src/routes/Landing.test.tsx projects/static-hosting/src/App.test.tsx
git commit -m "test(static-hosting): add Landing page and App router tests"
```

---

## Task 24: Interactive Demo Tests — CrudDemo, ChatDemo

**Files:**
- Create: `projects/static-hosting/src/components/CrudDemo.test.tsx`
- Create: `projects/static-hosting/src/components/ChatDemo.test.tsx`

- [ ] **Step 1: Write CrudDemo tests**

`src/components/CrudDemo.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrudDemo } from "./CrudDemo";

describe("CrudDemo", () => {
  it("renders form with default values", () => {
    render(<CrudDemo />);
    expect(screen.getByDisplayValue("Helsinki Central Library")).toBeInTheDocument();
    expect(screen.getByDisplayValue("library")).toBeInTheDocument();
  });

  it("renders POST and GET buttons", () => {
    render(<CrudDemo />);
    expect(screen.getByText("POST /items")).toBeInTheDocument();
    expect(screen.getByText("GET /items")).toBeInTheDocument();
  });

  it("shows placeholder when no response", () => {
    render(<CrudDemo />);
    expect(screen.getByText("Send a request to see the response")).toBeInTheDocument();
  });

  it("shows error when API URL not configured", async () => {
    const user = userEvent.setup();
    render(<CrudDemo />);

    await user.click(screen.getByText("POST /items"));
    expect(
      screen.getByText("API URL not configured (set VITE_HA_WEB_API_URL)"),
    ).toBeInTheDocument();
  });

  it("allows editing form fields", async () => {
    const user = userEvent.setup();
    render(<CrudDemo />);

    const nameInput = screen.getByDisplayValue("Helsinki Central Library");
    await user.clear(nameInput);
    await user.type(nameInput, "Test Item");
    expect(screen.getByDisplayValue("Test Item")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Write ChatDemo tests**

`src/components/ChatDemo.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatDemo } from "./ChatDemo";

describe("ChatDemo", () => {
  it("renders empty state", () => {
    render(<ChatDemo />);
    expect(
      screen.getByText("Ask a question about Helsinki services"),
    ).toBeInTheDocument();
  });

  it("renders input and send button", () => {
    render(<ChatDemo />);
    expect(
      screen.getByPlaceholderText("Ask about Helsinki services..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Ask →")).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<ChatDemo />);
    expect(screen.getByText("Ask →")).toBeDisabled();
  });

  it("send button enables when input has text", async () => {
    const user = userEvent.setup();
    render(<ChatDemo />);

    await user.type(
      screen.getByPlaceholderText("Ask about Helsinki services..."),
      "What libraries?",
    );
    expect(screen.getByText("Ask →")).not.toBeDisabled();
  });

  it("shows rate limit note", () => {
    render(<ChatDemo />);
    expect(
      screen.getByText("Rate limited: 10 req/sec, 100 req/day"),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run all tests**

```bash
cd projects/static-hosting && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add projects/static-hosting/src/components/CrudDemo.test.tsx projects/static-hosting/src/components/ChatDemo.test.tsx
git commit -m "test(static-hosting): add CrudDemo and ChatDemo component tests"
```
