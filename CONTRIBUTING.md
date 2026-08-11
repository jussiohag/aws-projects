# Contributing to aws-projects

## Environment

Prerequisites and per-project deploy steps are in the [README](README.md#quick-start).
For repo-wide checks:

```bash
npm install          # biome, commitlint
make lint
make test
```

## Workflow

1. Branch from `main`: `git checkout -b feat/<short-slug>`
2. Make changes. Write tests first when practical.
3. Run the fast feedback loop:
   ```bash
   make lint
   make test
   ```
4. Commit using conventional format (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`).
5. Push. Pre-push hook runs tests + gitleaks.
6. Open a PR. Fill in the template — describe what changed and why.

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)
- **Branches:** `feat/`, `fix/`, `chore/`, `docs/` prefixes
- **PII:** never in tracked files — use `private/` (gitignored)
- **Tests:** ship tests with features when the project has a test suite

## Project Documentation

- `docs/architecture.md` — diagrams, design decisions, cost analysis
- `docs/decisions/` — Architecture Decision Records (MADR format)
- `docs/postmortems/` — Sprint and feature retrospectives
