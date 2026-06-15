# aws-projects

## Project
AWS architecture demos: data lake (S3/Glue/Athena/Iceberg) and HA web service (VPC/ALB/Fargate/DynamoDB). CDK Python, deployed to eu-north-1.

## Commands
- Synth all: `make synth`
- Deploy: `make deploy-datalake` / `make deploy-haweb`
- Destroy: `make destroy-datalake` / `make destroy-haweb`
- Lint: `make lint`
- CI: `make ci`

## Conventions
- Task stamping: [ ] → [-] 🏗️ YYYY-MM-DD HH:MM → [x] ✅ YYYY-MM-DD HH:MM
- Branch workflow: feature branches, no direct commits to main
- PII: never in tracked files, use private/ (gitignored)
- Commits: conventional format (feat:, fix:, docs:, chore:), no Co-Authored-By
- No comments unless the WHY is non-obvious
- Coverage targets: 80% Rust domain, 60% GDScript, 80% TypeScript libraries

### TypeScript
- Strict mode always (`"strict": true`)
- Biome for linting/formatting (not ESLint/Prettier)
- Naming: camelCase functions/vars, PascalCase types, UPPER_SNAKE_CASE constants, snake_case files
- Errors: Result<T, E> pattern for library APIs (errors as values, not exceptions)
- Exports: explicit named exports, no `export *`
- Testing: Vitest, co-located (`foo.test.ts` next to `foo.ts`)
- ESM-first, `"type": "module"`

### Rust
- Module style: `mod.rs`, `pub use` re-exports
- Errors: `thiserror` for domain, `anyhow` only at app boundary
- Lints: `clippy::correctness = "deny"`, `clippy::all = "warn"`
- Domain purity: no framework deps (Bevy/Godot) in domain layer
- Testing: inline `#[cfg(test)]` for unit, `tests/` for integration

### GDScript
- Official style guide (docs.godotengine.org)
- Type hints always (`var health: int = 100`, `func foo() -> void:`)
- Signals: past tense (`health_changed`, `player_died`)
- Scene refs: `%UniqueNames` not `$Full/Path`
- Script order: signals → enums → constants → @export → @onready → vars → _ready → _process → public → private

## Hooks
- Pre-commit: PII + secrets + QA (auto-detect)
- Pre-push: build + tests + gitleaks
- Config: .hooks-config, .hooks-allowlist

## Documentation
- `docs/decisions/` — ADRs (MADR format, template: ~/Desktop/coding/pm/templates/adr-template.md)
- `docs/plans/` — implementation plans (save here, not project root)
- `docs/postmortems/` — sprint and feature retrospectives

## System reference
- Full PM system docs: ~/Desktop/coding/pm/docs/PM-SYSTEM.md
- Decisions: ~/Desktop/coding/pm/decisions/
- Templates: ~/Desktop/coding/pm/templates/
