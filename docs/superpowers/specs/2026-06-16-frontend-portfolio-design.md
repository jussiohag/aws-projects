# AWS Portfolio Frontend — Design Spec

## Overview

A React SPA that showcases four AWS architecture demos: Data Lake, HA Web Service, RAG on Bedrock, and its own S3 + CloudFront hosting infrastructure. Combines architecture documentation with live interactive demos against deployed APIs.

**Audience:** Recruiters/hiring managers (high-level overview) and technical peers/interviewers (architecture details, trade-offs, live demos).

## Tech Stack

- **Framework:** React 19 + Vite + TypeScript
- **Styling:** CSS modules — AWS-inspired dark theme (#1a1a2e background, #ff9900 orange accents, #232f3e card surfaces)
- **Routing:** React Router v7 (5 routes)
- **HTTP:** fetch for API calls (no axios needed)
- **Hosting:** S3 + CloudFront with Origin Access Control, deployed via CDK Python
- **Build output:** Static files (`vite build` → `dist/`)

## Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, project card grid, stats bar |
| `/data-lake` | Data Lake detail | Architecture + pre-computed query viewer |
| `/ha-web-service` | HA Web Service detail | Architecture + live CRUD demo |
| `/rag-bedrock` | RAG on Bedrock detail | Architecture + live chat demo |
| `/static-hosting` | Static Hosting detail | Architecture + meta "you are here" |

## Landing Page

### Navigation Bar
- Left: "AWS Portfolio" logo/text in orange
- Right: Projects, Architecture, About links + GitHub external link
- Sticky on scroll

### Hero Section
- Title: "AWS Architecture Demos"
- Subtitle: "Production-grade infrastructure patterns deployed to eu-north-1"
- Tech badges: CDK Python, eu-north-1, 4 Projects

### Project Card Grid (2x2)
Each card contains:
- Icon and deploy status badge (green "DEPLOYED")
- Project name and one-line description
- AWS service tags (S3, Glue, Fargate, etc.)
- Clickable — navigates to project detail route

The Static Hosting card has an orange border and "THIS SITE" badge instead of "DEPLOYED".

### Stats Bar
- 4 Projects | 12+ AWS Services | ~$2/day Total Cost | eu-north-1 Region

## Project Detail Pages

All four project pages share the same layout:

### Header
- Project icon, name, description
- Service tags
- Deploy status badge

### Tabbed Content

#### Architecture Tab
- Visual diagram of AWS components and their connections (HTML/CSS diagrams, not images)
- Key architecture decision cards (2x2 grid) — each card has a title and short explanation of the trade-off

#### Try It Tab (varies per project)

**HA Web Service:**
- Left panel: create item form (name, category, description) with "POST /items" button
- Right panel: JSON response viewer with status code and latency
- Bottom: quick-action buttons for GET /items and DELETE
- Calls the live ALB endpoint

**RAG on Bedrock:**
- Chat-style interface
- Input field with "Ask" button
- Response bubbles showing the answer
- Metadata line: source count, model name, latency
- Calls the live API Gateway POST /ask endpoint (requires API key — stored as env var at build time or fetched from a config endpoint)

**Data Lake:**
- Read-only query viewer (no live Athena)
- Tab bar for the 8 sample queries (Explore Raw, CSV vs Parquet, Create Iceberg, Time Travel, etc.)
- SQL code display with syntax highlighting
- Pre-computed results table
- Cost comparison line: bytes scanned CSV vs Parquet

**Static Hosting:**
- CDK stack diagram (S3 → CloudFront → OAC → Browser)
- Explanation of how this site is deployed
- Meta/self-referential — "the site you're viewing right now"

#### Cost Tab
- Table breakdown: resource name, unit cost, estimated monthly cost
- Total daily/monthly cost
- Comparison notes (e.g., "NAT Gateway savings: $50/month")

#### Decisions Tab
- Architecture Decision Records in readable format
- Each decision: context, decision, consequences
- Links to the full ADR in the repo

## Interactive Demo Constraints

### CORS
The HA Web Service ALB and RAG API Gateway need CORS headers to accept requests from the CloudFront domain. This requires CDK changes to existing stacks:
- **HA Web Service:** Add CORS middleware to FastAPI (`CORSMiddleware`)
- **RAG on Bedrock:** Enable CORS on API Gateway (CDK `default_cors_preflight_options`)

### API Key Handling (RAG)
The RAG API requires an API key. Options:
- Inject at build time via Vite env var (`VITE_RAG_API_KEY`) — simple but key is in JS bundle
- Create a lightweight proxy Lambda that adds the key server-side — more secure but more infrastructure

Recommended: build-time env var for now (demo project, not production). Add a rate limit note in the UI.

### Rate Limiting
- RAG endpoint already has 10 req/sec throttle on API Gateway
- HA Web Service: consider adding a simple client-side debounce to prevent accidental spam
- Display remaining rate limit info if available

## CDK Stack (Static Hosting)

New CDK stack at `projects/static-hosting/cdk/`:

- **S3 Bucket:** private, versioned, encrypted, public access blocked
- **CloudFront Distribution:** HTTPS, OAC for S3 access, SPA error routing (403/404 → `/index.html`)
- **OAC (Origin Access Control):** replaces legacy OAI, grants CloudFront read access to S3
- **BucketDeployment:** uploads `dist/` from Vite build to S3, invalidates CloudFront cache

Output: CloudFront distribution URL.

## Project Structure

```
projects/static-hosting/
├── cdk/
│   ├── app.py
│   ├── cdk/
│   │   └── static_hosting_stack.py
│   ├── cdk.json
│   └── requirements.txt
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── Landing.tsx
│   │   ├── DataLake.tsx
│   │   ├── HaWebService.tsx
│   │   ├── RagBedrock.tsx
│   │   └── StaticHosting.tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── ProjectHeader.tsx
│   │   ├── TabPanel.tsx
│   │   ├── ArchDiagram.tsx
│   │   ├── CrudDemo.tsx
│   │   ├── ChatDemo.tsx
│   │   ├── QueryViewer.tsx
│   │   ├── CostTable.tsx
│   │   └── DecisionCard.tsx
│   ├── data/
│   │   ├── projects.ts
│   │   ├── queries.ts
│   │   └── decisions.ts
│   └── styles/
│       └── theme.css           # AWS dark theme variables
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Visual Design

- **Background:** #1a1a2e (dark navy)
- **Card surfaces:** #232f3e (AWS dark gray)
- **Deep background:** #0f0f1a (code blocks, inputs)
- **Primary accent:** #ff9900 (AWS orange) — links, active tabs, buttons, badges
- **Text:** #ffffff (headings), #e0e0e0 (body), #999999 (secondary), #888888 (muted)
- **Success:** #4ade80 (deploy status, successful responses)
- **Warning:** #fbbf24 (partial status, string values in JSON)
- **Error:** #ef4444 (failed requests, high-cost indicators)
- **Border:** #333333 (dividers), #3a4553 (card borders)
- **Font:** system-ui for UI, monospace for code/JSON

## Responsive Behavior

- **Desktop (>1024px):** 2x2 card grid, side-by-side panels in Try It
- **Tablet (768-1024px):** 2x1 card grid, stacked panels
- **Mobile (<768px):** single column throughout, hamburger nav

## Out of Scope

- Authentication / user accounts
- Server-side rendering
- Analytics / tracking
- Custom domain (use CloudFront URL for now)
- Automated testing of live API endpoints
- CI/CD pipeline (manual `make deploy-static` for now)
