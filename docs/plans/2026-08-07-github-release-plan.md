# GitHub Release Plan — aws-projects

Date: 2026-08-07. Repo is already on GitHub (private) and cited in job applications. Goal: make it presentable and decide visibility.

Checklist source: `~/coding/github-release-preparator/CHECKLIST.md` (run `release-check.sh` for the automated part).

## Current state (2026-08-07 audit)

- gitleaks: working tree and full history clean
- AWS account ID: not in tracked files; **is in git history** (added 7b70cef, scrubbed 7dccdb0) — matters only if repo goes public and history is kept
- LICENSE: TODO placeholder — blocker
- Repo: PRIVATE, no description, no topics, no homepage URL
- Default branch: `main` (correct), but main is 4 commits behind `feat/data-lake-and-ha-web-service`, which is 35 behind `feat/frontend-portfolio`
- Open PRs: #5 (portfolio, open since June), #14 (README), 8 dependabot PRs; some dependabot CI runs red
- CI on main: green

## Plan

### Phase 1 — hygiene (done 2026-08-07)

- [x] Revert uncommitted cdk.context.json change (contained account ID)
- [x] Archive `cdk init` boilerplate (README/source.bat/cdk_stack.py/tests stubs ×3 projects) to `private/archive/`
- [x] gitignore `.vite/`, `*.tsbuildinfo`; archive existing copies
- [x] Move plan files from repo root to `docs/plans/`
- [x] Wire `make test` to vitest (was a "no tests" stub)
- [x] Commit dependency-review workflow guard
- [x] Set repo description + topics

### Phase 2 — decisions (done 2026-08-07)

- [x] **License**: MIT (PR #20), README badge + section updated
- [x] **Visibility**: public. `pre-publish-check.sh` run; `git filter-repo` removed CLAUDE.md/AGENTS.md/.hooks-config/.hooks-allowlist/.githooks from all history and redacted account ID; main force-pushed; stale remote branches deleted; "Protect main" ruleset repointed from feat branch to main. Backup: `~/Desktop/coding/_backups/aws-projects-pre-filter-20260807.git`
- [x] Merge chain: #4, #8–#12 → data-lake branch, #5 → data-lake branch, #18 → main, then #14–#17
- [x] Dependabot triage: all merged; alerts fixed via react-router 8.3.0 (v8, -dom package dropped, imports rewritten) + pytest 9.0.3 (PR #21)

### Phase 3 — release polish

- [x] Merge #14 (README covers all four projects)
- [ ] README: add screenshots of the portfolio frontend; verify badges render for visitors
- [x] Set homepage URL to live demo — static-hosting stack deployed (S3+CloudFront, pennies/month), CloudFront URL set as repo homepage ✅ 2026-08-07 15:08
- [ ] Tag `v1.0.0` + GitHub Release notes (what works, demo-only parts, cost notes)
- [ ] Pin repo on GitHub profile
- [ ] Re-run `release-check.sh` — target 0 FAIL
