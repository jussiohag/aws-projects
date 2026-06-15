# AWS Build Projects — Implementation Plan

## Context

Interview with Jarkko Hirvonen (Head of Technology, AWS Finland & Baltics) is tomorrow Tue Jun 16 at 14:00 EEST. Three CDK projects were planned to demonstrate hands-on experience in cloud architecture, AI, and data strategy. The build window (Jun 12-15) has passed, so we're doing a compressed build tonight/tomorrow morning. Goal: have deployable, presentable projects — not polished production systems.

**Current state:** `~/Desktop/coding/aws-projects/` has prep docs only. No AWS CLI, no CDK, no credentials configured. Python 3.14, Node 22, Docker available.

## Priority Order

1. **Project 3 — Data Lake** (2-3h) — Jarkko posts about S3 Tables/Iceberg. Cheapest, fastest, strongest interview signal.
2. **Project 1 — HA Web Service on Fargate** (3-4h) — Classic enterprise pattern. Proves networking/VPC/container knowledge.
3. **Project 2 — RAG on Bedrock** (stretch) — Only if time allows. OpenSearch Serverless has a cost floor (~$0.24/h min OCUs). Skip if past midnight.

## Phase 0: Prerequisites (~20 min)

### 0.1 Install AWS CLI v2
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip /tmp/awscliv2.zip -d /tmp/
sudo /tmp/aws/install
```

### 0.2 Configure credentials
```bash
aws configure
# Region: eu-north-1 (Stockholm — closest, matches build-projects.md)
# Output: json
```
**Blocker:** User must have an AWS account with credentials ready. If not, create one (free tier).

### 0.3 Install CDK
```bash
sudo npm install -g aws-cdk
cdk --version
```

### 0.4 Set billing alarm
```bash
# Via CLI or console — $10 monthly cap as specified in build-projects.md
```

### 0.5 Bootstrap CDK in eu-north-1
```bash
cdk bootstrap aws://<ACCOUNT_ID>/eu-north-1
```

## Phase 1: Project Scaffolding (~15 min)

### 1.1 Run new-project.sh
```bash
~/Desktop/coding/pm/hooks/new-project.sh ~/Desktop/coding/aws-projects
```
This gives us: git repo, AGENTS.md/CLAUDE.md, PM files (ROADMAP/BACKLOG/SPRINT), hooks (pre-commit, pre-push), docs structure, CI workflow, Makefile.

### 1.2 Project structure — monorepo with CDK apps
```
aws-projects/
├── AGENTS.md (CLAUDE.md symlinked)
├── ROADMAP.md / BACKLOG.md / SPRINT.md
├── Makefile
├── gates.yaml                    # AI-harness style CI gates
├── docs/plans/                   # This plan lives here after bootstrap
├── projects/
│   ├── data-lake/                # Project 3 (priority 1)
│   │   ├── cdk/                  # CDK app
│   │   ├── scripts/              # Data download/upload scripts
│   │   └── queries/              # Athena SQL queries
│   ├── ha-web-service/           # Project 1 (priority 2)
│   │   ├── cdk/                  # CDK app
│   │   └── app/                  # FastAPI container
│   └── rag-bedrock/              # Project 2 (stretch)
│       ├── cdk/                  # CDK app
│       └── lambda/               # Lambda function code
├── shared/
│   └── tags.py                   # Common CDK tags (Project, Environment, Owner)
└── private/                      # .gitignored — credentials, scratch
```

### 1.3 Adapt AGENTS.md for CDK/Python/AWS
Add CDK-specific commands:
- `cdk synth` / `cdk diff` / `cdk deploy` / `cdk destroy`
- `pytest` for CDK snapshot tests
- `ruff check` for linting

### 1.4 Create gates.yaml (ai-harness pattern)
```yaml
gates:
  - name: lint
    layer: A
    command: "ruff check projects/ shared/"
    timeout: 30
  - name: secrets
    layer: A
    command: "gitleaks detect --source . --no-banner"
    timeout: 30
  - name: cdk-synth
    layer: B
    command: "cd projects/data-lake/cdk && cdk synth --quiet"
    timeout: 120
  - name: unit-tests
    layer: B
    command: "pytest -m unit -q"
    timeout: 120
```

### 1.5 Makefile targets
```makefile
synth:     # cdk synth all projects
deploy-%:  # cdk deploy specific project
destroy-%: # cdk destroy specific project
test:      # pytest
lint:      # ruff
```

## Phase 2: Project 3 — Data Lake (~2-3h)

### Architecture (best practices applied)

```
hri.fi CSV ──► S3 raw/         (lifecycle: IA after 30d)
  │            │
  │            ├──► Glue Crawler ──► Glue Data Catalog
  │            │                          │
  │            │    Athena CTAS           │
  │            ▼                          ▼
  │      S3 curated/              Athena workgroup
  │   (Parquet, partitioned)      (query result bucket,
  │                                 byte-scan limit)
  │
  └──► S3 iceberg/               Athena (Iceberg DDL)
     (stretch: CREATE TABLE       time-travel queries
      ... table_type='ICEBERG')
```

### Best practices for the data lake

1. **S3 bucket design:** Separate prefixes for raw/curated/iceberg. Server-side encryption (SSE-S3 default). Block public access. Versioning on raw bucket (data lineage).
2. **Glue Crawler:** Run on-demand (not scheduled) for this demo. Set classification = CSV. Single database in Data Catalog.
3. **Athena:** Use a dedicated workgroup with query result location and byte-scan limit ($5 per TB scanned — partition + columnar = 90%+ savings). Use partition projection where possible instead of MSCK REPAIR.
4. **Parquet conversion:** CTAS with `format = 'PARQUET'`, `partitioned_by` on a sensible column (e.g., year, district). Compare scanned bytes raw CSV vs Parquet — this is the cost story.
5. **Iceberg stretch:** `CREATE TABLE ... WITH (table_type = 'ICEBERG', location = 's3://...')`. Demo UPDATE + time-travel `SELECT * FROM table FOR TIMESTAMP AS OF ...` — this is Jarkko's topic.
6. **CDK constructs:** `aws_s3.Bucket`, `aws_glue.CfnCrawler`, `aws_athena.CfnWorkGroup`. Glue CDK L2 constructs are limited — L1 (Cfn) is fine.
7. **Cost:** Glue crawler ~free at this scale. Athena pay-per-query. S3 pennies. Total < $1.

### Build steps

1. CDK init: `cdk init app --language python` in `projects/data-lake/cdk/`
2. Define stacks: S3 buckets (raw + curated + results), Glue database + crawler, Athena workgroup
3. Download Helsinki open data CSV from hri.fi (city service points or transit data)
4. Upload to S3 raw prefix
5. Run Glue crawler → verify table in Data Catalog
6. Athena: query raw CSV, note bytes scanned
7. Athena: CTAS to Parquet with partitioning, note bytes scanned — compare
8. Stretch: Iceberg table, UPDATE, time-travel query
9. Screenshot results for interview reference
10. `cdk destroy` when done (or leave — cost is negligible)

### Interview pitch (2 min)
"I built a small data lake on Helsinki open data last week. Raw CSV lands in S3, Glue crawls it into the Data Catalog, Athena queries it. Converting to Parquet with partitioning cut scanned bytes by 95%. I also tested Iceberg tables — UPDATE and time-travel work natively in Athena now, which is what S3 Tables manages at scale."

## Phase 3: Project 1 — HA Web Service on Fargate (~3-4h)

### Architecture (best practices applied)

```
                    VPC 10.0.0.0/16 — eu-north-1
  ┌──────────────────────────────────────────────────┐
  │  Public subnet AZ-a       Public subnet AZ-b     │
  │  ┌────────────────┐       ┌────────────────┐     │
  │  │    ALB node     │       │    ALB node     │    │
  │  └───────┬────────┘       └────────────────┘     │
  │          │                                        │
  │  Private subnet AZ-a      Private subnet AZ-b    │
  │  ┌────────────────┐       ┌────────────────┐     │
  │  │ Fargate task    │       │ Fargate task    │    │
  │  │ (FastAPI)       │       │ (FastAPI)       │    │
  │  └───────┬────────┘       └───────┬────────┘     │
  │          └──────┬─────────────────┘               │
  │                 ▼                                  │
  │       DynamoDB Gateway VPC Endpoint               │
  └─────────────────┼────────────────────────────────┘
                    ▼
              ┌──────────┐     ┌────────────┐
              │ DynamoDB  │     │ CloudWatch │
              └──────────┘     └────────────┘
```

### Best practices for the HA web service

1. **VPC design:** 2 AZs, public + private subnets. **natGateways=0** — no NAT Gateway (saves ~$32/mo per AZ). DynamoDB access via Gateway VPC Endpoint (free, stays on AWS backbone). This is the architecture talking point: cheaper AND more secure.
2. **ALB:** Internet-facing in public subnets. Health check on `/health` endpoint. Stickiness off (stateless app). Security group: inbound 80/443 from 0.0.0.0/0 only.
3. **Fargate:** Private subnets only. Minimum 2 tasks (1 per AZ) for HA. Task CPU 256, memory 512 (free tier eligible). Security group: inbound only from ALB SG. No public IP assignment.
4. **DynamoDB:** On-demand billing (pay-per-request). Point-in-time recovery enabled. Table design: simple PK for this demo.
5. **IAM:** Task execution role (ECR pull, CloudWatch logs) separate from task role (DynamoDB read/write only, specific table ARN). Least privilege.
6. **Container:** Multi-stage Dockerfile. Non-root user. Health check in Dockerfile. FastAPI with uvicorn, `/health` and `/items` CRUD endpoints.
7. **CDK:** Use `ecs_patterns.ApplicationLoadBalancedFargateService` — L3 construct handles ALB + target group + service wiring. Add DynamoDB table + VPC endpoint manually.
8. **Self-healing demo:** Kill a task in console → ECS replaces it automatically. This IS the HA story.
9. **Cost:** Fargate ~$0.01/h for 256/512. DynamoDB on-demand pennies. ALB ~$0.02/h. Total ~$0.50/day. **Destroy same day.**

### Build steps

1. CDK init in `projects/ha-web-service/cdk/`
2. Write FastAPI app: `/health`, `/items` CRUD against DynamoDB
3. Dockerfile (multi-stage, non-root)
4. CDK stack: VPC (2 AZ, no NAT), ALB+Fargate service, DynamoDB table, Gateway endpoint, IAM roles
5. `cdk deploy` — note: first deploy builds + pushes Docker image to ECR
6. Test: curl ALB DNS → get response
7. Kill task in console → watch replacement
8. Screenshot for interview reference
9. `cdk destroy` — critical: ALB costs money

### Interview pitch (2 min)
"Two-AZ Fargate service behind an ALB, private subnets only, DynamoDB via Gateway VPC Endpoint — no NAT Gateway. That's a deliberate architecture choice: the VPC endpoint is free, keeps traffic on the AWS backbone, and eliminates an attack surface. I killed a task and ECS self-healed in under 30 seconds."

## Phase 4: Project 2 — RAG on Bedrock (stretch, ~3h)

Only attempt if Projects 3 and 1 are done and it's before midnight.

### Key considerations
- **Region:** us-east-1 (widest Bedrock model availability, eu-north-1 has limited Bedrock)
- **Cost trap:** OpenSearch Serverless minimum ~$0.24/h (~$5.76/day). Build, screenshot, destroy same session.
- **Alternative:** Use FAISS in-memory for the demo instead of OpenSearch Serverless to avoid cost. Bedrock Knowledge Bases support both.

### Build steps (abbreviated)
1. Enable Bedrock model access (Claude + Titan Embeddings) in us-east-1
2. S3 bucket with Well-Architected whitepaper PDFs
3. Knowledge Base via CDK (or console — KB CDK support is newer)
4. Lambda + API Gateway calling `RetrieveAndGenerate`
5. Test with pillar questions
6. Destroy OpenSearch Serverless collection immediately after demo

## Phase 5: Verification & CI

### Gates (run before each commit)
```yaml
gates:
  - name: lint
    layer: A
    command: "ruff check projects/ shared/"
  - name: secrets
    layer: A
    command: "gitleaks detect --source . --no-banner"
  - name: cdk-synth-datalake
    layer: B
    command: "cd projects/data-lake/cdk && cdk synth --quiet"
  - name: cdk-synth-ha-web
    layer: B
    command: "cd projects/ha-web-service/cdk && cdk synth --quiet"
  - name: unit-tests
    layer: B
    command: "pytest -q"
```

### End-of-session checklist
- [ ] All stacks destroyed (`cdk destroy` for each)
- [ ] Check AWS Cost Explorer — should be < $5 total
- [ ] Screenshots saved to `docs/` for interview reference
- [ ] Can redraw each diagram from memory on paper
- [ ] Can narrate each architecture in 2 minutes

## Time Budget

| Block | Duration | What |
|-------|----------|------|
| Phase 0: Prerequisites | 20 min | AWS CLI, CDK, credentials, billing alarm |
| Phase 1: Scaffolding | 15 min | new-project.sh, monorepo structure, gates |
| Phase 2: Data Lake | 2-3h | CDK + deploy + queries + Iceberg stretch |
| Phase 3: HA Web Service | 3-4h | CDK + FastAPI + deploy + self-healing demo |
| Phase 4: RAG (stretch) | 3h | Only if time allows |
| Destroy + screenshots | 15 min | Cost hygiene |

**Minimum viable outcome:** Phase 0-2 done (data lake deployed, queries run, Iceberg tested). That alone gives you "I built a data lake on Helsinki open data this week" for the interview.

## Questions to Resolve Before Starting

1. **AWS account:** Do you have an AWS account with programmatic access (access key + secret)? If not, we need to create one first.
2. **Region:** eu-north-1 (Stockholm) for Projects 1 & 3, us-east-1 for Project 2 (Bedrock). Confirm?
3. **Monorepo vs separate repos:** Plan assumes monorepo (`aws-projects/projects/`). Separate repos would mean 3x the scaffolding overhead — not worth it for interview demos.
