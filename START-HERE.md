# Getting started in Claude Code

1. Extract this ZIP into your chosen project folder.
2. Open a terminal (e.g., PowerShell) in that folder.
3. Run `git init` if it is not already a Git repository.
4. Run `claude` (requires Claude Code installed and logged in).
5. Paste this prompt:

> Read `CLAUDE.md` and every file in `docs/`. This is a fresh repository. First summarize the requirements and propose a concise implementation plan for **Milestone 0 and the first Milestone 1 vertical slice only**, stating architecture decisions and open assumptions. Then implement Milestone 0: initialize the monorepo with Next.js/TypeScript and Flask/Python, PostgreSQL with Docker Compose, an `/api/v1/health` endpoint, a frontend page consuming the endpoint, README run instructions, `.env.example`, and basic automated tests. Do not provision AWS, implement a coding sandbox, or add payments. Run relevant checks and report observed results. Use small, reviewable changes.

6. Review the plan, approve only desired file modifications, and test locally.
7. When the scaffold is stable, ask: `Implement Milestone 1 in docs/ROADMAP.md, starting with the seeded lesson and database-backed progress. Propose a small plan before editing.`

Notes:
- `CLAUDE.md` is automatically read as project guidance, per Claude Code documentation.
- `docs/*.md` are longer specifications, read on request and referenced from CLAUDE.md.
- `/init` is optional here; this pack already contains `CLAUDE.md`. Avoid overwriting it.
