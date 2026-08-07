# aws-projects — Backlog
<!-- Task stamping: [ ] → [-] 🏗️ YYYY-MM-DD HH:MM → [x] ✅ YYYY-MM-DD HH:MM -->

## Up Next

### GitHub release polish (plan: docs/plans/2026-08-07-github-release-plan.md)
_Tool: `~/coding/github-release-preparator` — checklist + `release-check.sh`. Hygiene phase done ✅ 2026-08-07 03:32._

- [x] Pick a license, replace TODO placeholder in LICENSE, fix README badge ✅ 2026-08-07 13:45 (MIT, PR #20)
- [x] Decide repo visibility: public. pre-publish-check.sh run, agent files + account ID scrubbed from history via git filter-repo, force-pushed, stale branches deleted ✅ 2026-08-07 14:04
- [x] Merge PR chain to main (#5 → #18) + #14 README ✅ 2026-08-07 13:30
- [x] Triage dependabot PRs — all merged (#4, #8–#12, #15–#17); vulns fixed: react-router 8.3.0 + pytest 9.0.3 (PR #21) ✅ 2026-08-07 14:04
- [x] Flip repo public (dependabot alerts 0 open) ✅ 2026-08-07 14:06
- [ ] Tag v1.0.0 + GitHub Release notes; pin repo on profile
- [ ] Re-run release-check.sh — target 0 FAIL

### AWS Credits — Exercises ($80 remaining of $100)
_Complete 4 remaining exercises to earn $80 in AWS credits._

- [x] Create a web app using AWS Lambda — $20 ✅ (already completed)
- [ ] Launch an instance using EC2 — $20
- [ ] Use a foundation model in the Amazon Bedrock playground — $20
- [ ] Set up a cost budget using AWS Budgets — $20
- [ ] Create an Aurora or RDS database — $20

## Ideas

- [ ] Create a frontend for the AWS demos (showcase data lake, HA web service, RAG projects in a single UI)
