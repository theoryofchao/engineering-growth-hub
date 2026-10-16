# Implementation roadmap

## Milestone 0 — bootstrap and plan
- Inspect environment and available tooling.
- Confirm worktree structure; define scoped phased plan.
- Scaffold Next.js, Flask, Postgres, Docker Compose and environment template. Add clear README commands.
- Health endpoint and a frontend page that can reach the backend; verify startup and tests.
- Do not provision AWS or install billing infrastructure.

## Milestone 1 — first vertical slice (highest priority)
- Migration/seed: one domain `Frontend Engineering`, topic `Browser Rendering`, 25-minute lesson `Critical Rendering Path`.
- One learning page fetching actual Flask JSON backed by PostgreSQL.
- Pomodoro 25/5 and 50/10 mode, pause/resume, break prompt, reload-safe persisted timing.
- One quiz or small interactive exercise, result submission and saving progress to PostgreSQL.
- Dashboard: progress and distinction between time spent, practiced and mastered.
- Automated tests for main API paths and relevant UI behaviors; manual walkthrough documented.

## Milestone 2 — curriculum and knowledge management
- Nested curriculum browsing, notes, reference links, exercise authoring and seed pipeline.
- Import exact 80-topic map from original source when obtained; label partial seed honestly.
- Prerequisites and progress filters.

## Milestone 3 — leadership
- Competency catalog and STAR story CRUD; scenario selection and decision-tree visualization.
- Rubrics, self-reflection, links from stories to competencies.

## Milestone 4 — coding and projects
- Monaco editing; isolated JS exercise evaluation, tests, timeouts, failure UX.
- Design a threat model before enabling arbitrary public code execution; separate secured runner for Python later.
- Multi-session projects with checkpoint acceptance tests.

## Milestone 5 — operational learning
- Linux VM deployment, TLS, DNS, backups/restore, CI/CD, logs, metrics, security hardening.
- Later ECS, RDS, Terraform infrastructure experiment with explicit budget and cleanup plan.

## Milestone 6 — optional future enhancements
Adaptive review, AI-generated exercises, spaced repetition, secure multi-user publication, true backend-enforced entitlements, then payments only when requested.

## Delivery protocol
Implement ONE milestone or bounded vertical slice at a time. Report changes, how to run, actual test results, open issues and sensible next step. Favor reviewable commits.
