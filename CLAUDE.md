# Engineering Growth Hub — Claude Code instructions

## Mission
Build an exercise-driven software engineering and technical leadership learning platform. It is initially single-user, potentially multi-user/commercial later. The platform is itself a production-engineering learning project.

## Read first
- `docs/PRODUCT.md` — product requirements, curriculum, exercises, Pomodoro, leadership, future monetization.
- `docs/ARCHITECTURE.md` — stack, boundaries, data model, security, deployment.
- `docs/ROADMAP.md` — prioritized vertical slices and acceptance criteria.
- `content/curriculum/README.md` — when authoring a learning session's content, follow its sizing rule (blocks per session, body length, exercises per block) rather than guessing; see ADR 0013.

## Technical direction
- Monorepo: `apps/web` (Next.js App Router, React, TypeScript, Tailwind, shadcn/ui) and `apps/api` (Python, Flask, SQLAlchemy, Alembic/Flask-Migrate, Pydantic). PostgreSQL; Docker Compose; pytest, Vitest, Playwright; OpenAPI client typing.
- Flask owns business logic, persistence, content access, and progress decisions. Next.js handles UI/rendering. Avoid duplicating business rules.
- Model course hierarchy as topic → module → section → learning session → exercise/assessment; allow section prerequisites. `topic` is the top-level grouping ("Computer Science Foundations"), `section` is what a learner actually opens ("AI-Assisted Software Development" — CURRICULUM.md's own "module" granularity), and `module` is a separate, currently route-unexposed grouping layer between them — see `docs/decisions/0027-topic-section-module-rename-and-routing.md`. Routes reflect this down to the section level: `/learn/<topic-slug>/<section-slug>` and below.
- Each learning session is a focused 25-minute or 50-minute unit with a subsequent 5- or 10-minute break. Persist learning progress separately from timer activity.
- Design exercise types for quiz, short answer, code, debugging, architecture, project milestone, and leadership scenarios. Implement only small MVP subset initially.
- Never execute untrusted learner code in Flask or with infrastructure secrets. Start with quizzes; browser coding runner is a separate security-reviewed milestone.
- Add `access_tier`/access-policy concept without implementing payment providers, billing, or entitlement complexity yet. Never rely on frontend-only paywall enforcement.
- Favor simple, testable, maintainable code over speculative microservices, complex orchestration, or premature AI integrations.

## Implementation behavior
- First inspect repository state. If docs and source disagree, ask about substantial architectural changes; otherwise follow docs.
- Work in small, executable vertical slices. For each change provide: files changed, commands to run, tests passed/failed, and remaining work.
- Create migrations for schema changes, API integration tests, and accessible UI states. Use meaningful TypeScript/Python types.
- Do not silently add cloud resources or incur AWS costs. Local-first; later Lightsail then ECS/RDS/Terraform when explicitly requested.
- Treat lessons and exercises as content that can be seeded/imported, not hard-coded into component logic.
- Capture important decisions in `docs/decisions/` with brief ADRs.
- Do not claim code runs or tests pass unless actually verified.
- Do not attempt to build all phases in one task; follow the user's requested milestone.
- After each meaningful change or vertical slice, append a short entry (what changed, why, files touched) to `.claude/CHANGES.local.md` — a gitignored local scratch log, not a committed changelog. It exists so the user can draft commit messages from uncommitted work spanning several turns or sessions. Clear its contents immediately after the user makes a commit that covers it, so it only ever reflects work not yet committed.
