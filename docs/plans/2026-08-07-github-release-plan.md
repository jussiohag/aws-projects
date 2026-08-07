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

### Phase 2 — decisions (user)

- [ ] **License**: pick one (MIT typical for portfolio demos) and replace placeholder; update README badge
- [ ] **Visibility**: private repo = recruiters see 404. Options:
  - a) Make public: first run `pre-publish-check.sh` (untrack CLAUDE.md/AGENTS.md/hooks), decide whether account ID in history warrants `git filter-repo` or fresh-history republish
  - b) Stay private: ensure applications link the live portfolio site instead of the repo
- [ ] Merge chain: PR #5 (feat/frontend-portfolio) → feat/data-lake-and-ha-web-service → main, or collapse and PR straight to main. Main must hold the finished work before anyone looks at it
- [ ] Triage 8 dependabot PRs (merge green, close stale majors with reason)

### Phase 3 — release polish

- [ ] Merge #14 (README covers all four projects)
- [ ] README: add screenshots of the portfolio frontend; verify badges render for visitors
- [ ] Set homepage URL to live demo (if kept deployed — mind Fargate/ALB cost)
- [ ] Tag `v1.0.0` + GitHub Release notes (what works, demo-only parts, cost notes)
- [ ] Pin repo on GitHub profile
- [ ] Re-run `release-check.sh` — target 0 FAIL
