# AWS Portfolio Frontend — Implementation Plan

## Context

The aws-projects repo has 3 deployed AWS demos (Data Lake, HA Web Service, RAG on Bedrock) with no frontend. This plan builds a React SPA that showcases all projects with architecture docs and live interactive demos, hosted on S3 + CloudFront as a fourth project. Design spec: `docs/superpowers/specs/2026-06-16-frontend-portfolio-design.md`. Detailed task-level plan: `docs/superpowers/plans/2026-06-16-frontend-portfolio.md`.

## Decisions Made (from brainstorming)

- **Purpose:** Portfolio showcase + interactive live demos (both audiences: recruiters and technical peers)
- **Hosting:** S3 + CloudFront via CDK (becomes the 4th AWS project)
- **Framework:** React 19 + Vite + TypeScript
- **Style:** AWS-inspired dark theme (#1a1a2e bg, #ff9900 orange accents), CSS modules
- **Architecture:** SPA with React Router — landing page + 4 project detail routes
- **Tests:** Vitest + React Testing Library (added to gates.yaml)

## Implementation (24 tasks)

### Phase 1: Foundation (Tasks 1-3)

1. **Scaffold Vite project** — `npm create vite` in `projects/static-hosting/`, install `react-router-dom`, configure `@/` path alias, strict TypeScript
2. **AWS dark theme** — CSS custom properties in `src/styles/theme.css` (colors, fonts, radii), import in `main.tsx`
3. **Router + Layout** — `BrowserRouter` with 5 routes, `Layout` component (sticky nav, `☁ AWS Portfolio` logo, GitHub link), `<Outlet/>` for pages

### Phase 2: Data Layer (Task 4)

4. **Project data files** — `src/data/projects.ts` (4 project metadata objects with cost items), `src/data/queries.ts` (8 pre-computed Athena queries from the existing SQL files), `src/data/decisions.ts` (ADR content per project)

### Phase 3: Shared Components (Tasks 5-8)

5. **ProjectCard** — clickable card with icon, name, description, service tags, deploy status badge. Orange border for "THIS SITE"
6. **Landing page** — hero section, 2x2 card grid, stats bar (4 projects, 12+ services, ~$2/day, eu-north-1)
7. **Shared detail components** — `ProjectHeader` (name, description, tags, badge), `TabPanel` (stateful tabs), `CostTable` (resource/unit/monthly breakdown), `DecisionCards` (key points grid + ADR records)
8. **ArchDiagram** — HTML/CSS flow diagrams per project (nodes + arrows), data-driven from a `DIAGRAMS` record

### Phase 4: Interactive Demos (Tasks 9-11)

9. **QueryViewer** — Data Lake demo: tab bar for 8 queries, SQL display, pre-computed results table, bytes-scanned cost comparison (CSV vs Parquet)
10. **CrudDemo** — HA Web Service demo: create-item form + JSON response viewer with status/latency, GET/DELETE action buttons. Calls live ALB via `VITE_HA_WEB_API_URL`
11. **ChatDemo** — RAG demo: chat interface with user/assistant bubbles, metadata line (sources, model, latency), rate limit note. Calls live API Gateway via `VITE_RAG_API_URL` + `VITE_RAG_API_KEY`

### Phase 5: Detail Pages (Task 12)

12. **Wire up 4 detail pages** — `DataLake.tsx`, `HaWebService.tsx`, `RagBedrock.tsx`, `StaticHosting.tsx`. Each uses shared components + project-specific demo. `StaticHosting` has a "You are here" inline explanation instead of an API demo. Replace router placeholders with real components.

### Phase 6: Backend Changes (Tasks 13-14)

13. **CORS — HA Web Service** — Add `CORSMiddleware` to FastAPI in `projects/ha-web-service/app/main.py` (`allow_origins=["*"]` for demo)
14. **CORS — RAG API Gateway** — Add `default_cors_preflight_options` to `RestApi` in `projects/rag-bedrock/cdk/cdk/rag_stack.py` (allow `Content-Type` + `x-api-key` headers)

### Phase 7: Infrastructure (Tasks 15-17)

15. **CDK stack** — New stack at `projects/static-hosting/cdk/`: S3 bucket (private, versioned, encrypted), CloudFront distribution (HTTPS, OAC, SPA error routing 403/404 → `/index.html`), `BucketDeployment` from `../dist`
16. **Makefile** — Add `build-static`, `deploy-static`, `destroy-static` targets. Update `lint` (add tsc + py_compile for static-hosting) and `synth` targets
17. **Environment config** — `.env.example` with 3 Vite env vars, `.gitignore` for node_modules/dist/.env/cdk.out

### Phase 8: Tests (Tasks 19-24)

19. **Test setup** — Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@vitest/coverage-v8`. Create `vitest.config.ts` with jsdom environment and CSS module support
20. **Data layer tests** — Verify PROJECTS has 4 entries with unique ids/routes, QUERIES has 8 entries with required fields, DECISIONS covers all projects
21. **Component tests: ProjectCard, TabPanel, CostTable** — Render with required props, verify text content, test tab switching with userEvent, check cost rendering
22. **Component tests: ArchDiagram, QueryViewer, DecisionCards** — Verify diagram nodes per project, query tab switching, ADR rendering, null return for unknown projectId
23. **Route tests: Landing + App** — Verify hero, 4 cards, stats bar, nav logo rendering via MemoryRouter
24. **Demo tests: CrudDemo, ChatDemo** — Verify form defaults, button states, error on missing API URL, input editing, rate limit note, send button enable/disable

### Phase 9: Final Verification (Task 18)

18. **Full build + type check + make lint + manual browser walkthrough** — All 5 routes, tab switching, responsive layout, form interactions

## Key Files

**New project (`projects/static-hosting/`):**
- `src/main.tsx`, `src/App.tsx` — entry point and router
- `src/styles/theme.css` — AWS dark theme custom properties
- `src/data/projects.ts`, `queries.ts`, `decisions.ts` — static data
- `src/components/Layout.tsx`, `ProjectCard.tsx`, `ProjectHeader.tsx`, `TabPanel.tsx`, `ArchDiagram.tsx`, `CostTable.tsx`, `DecisionCard.tsx` — shared components
- `src/components/CrudDemo.tsx`, `ChatDemo.tsx`, `QueryViewer.tsx` — interactive demos
- `src/routes/Landing.tsx`, `DataLake.tsx`, `HaWebService.tsx`, `RagBedrock.tsx`, `StaticHosting.tsx` — pages
- `cdk/cdk/static_hosting_stack.py` — S3 + CloudFront CDK stack
- `vitest.config.ts` + `src/test/setup.ts` — test configuration

**Modified existing files:**
- `projects/ha-web-service/app/main.py` — add CORS middleware
- `projects/rag-bedrock/cdk/cdk/rag_stack.py` — add CORS to API Gateway
- `Makefile` — add static-hosting targets

## Execution

Dispatch via subagent-driven development (recommended) or orchestrator. The detailed plan at `docs/superpowers/plans/2026-06-16-frontend-portfolio.md` has complete code for every task — subagents read it and execute task by task.

## Verification

1. `npm run build` in `projects/static-hosting/` — clean build, no errors
2. `npx tsc --noEmit` — no type errors
3. `npm test` — all Vitest tests pass
4. `make lint` — passes (includes Python compile + TS typecheck)
5. `npm run dev -- --port 3000` — manual walkthrough: landing page (4 cards, stats), all 4 detail pages (4 tabs each), responsive at <768px
6. CrudDemo + ChatDemo show config error when env vars missing (correct behavior)
