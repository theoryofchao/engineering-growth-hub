# Architecture and infrastructure

## Proposed repository layout
```text
apps/
  web/                      # Next.js App Router + TypeScript
  api/                      # Flask app factory, REST routes, services, schemas, models
packages/
  api-client/               # optional generated TS client from OpenAPI
content/
  curriculum/               # Markdown/YAML seed data
docs/
  decisions/                # ADRs
infra/
  docker/
  terraform/                # later, not first milestone
compose.yaml
CLAUDE.md
```

## Stack
- Next.js + React + TypeScript; Tailwind CSS + shadcn/ui; TanStack Query for interactive API mutations when useful.
- Flask app factory + SQLAlchemy + migrations + Pydantic request/response contracts; OpenAPI documentation and typed client as the API grows.
- PostgreSQL. Local Docker Compose. pytest, Vitest/React Testing Library, Playwright as milestones warrant.
- React Flow for leadership trees and prerequisites later; Markdown/MDX rendering subject to secure content ingestion.

## Core modeling candidates

Naming: `topic` is the top-level grouping (e.g. "Computer Science Foundations"), `section` is the thing a learner actually opens under a topic (e.g. "AI-Assisted Software Development" -- CURRICULUM.md's own "module" granularity), and `module` is a separate, currently route-unexposed grouping layer between the two -- see `docs/decisions/0027-topic-section-module-rename-and-routing.md`.

- `topics(id, name, slug, description)`
- `modules(id, topic_id, title)`
- `sections(id, module_id, parent_section_id?, title, slug, description, proficiency_tier)`
- `section_prerequisites(section_id, prerequisite_section_id)`
- `learning_sessions(id, section_id, title, duration_minutes, objective, content, sequence, access_tier)`
- `exercises(id, learning_session_id, type, prompt, definition_json, estimated_minutes)`
- `exercise_submissions(id, user_id, exercise_id, result_json, score, submitted_at)`
- `user_progress(id, user_id, section_id, status, mastery_level, updated_at)`
- `study_sessions(id, user_id, learning_session_id, started_at, elapsed_seconds, status)`
- `leadership_stories(id, user_id, competency, situation, task, action, result, reflection)`
Future: `projects`, `project_milestones`, `assessment_attempts`, `content_access_policies`, `flowcharts`.

Simplify as needed while preserving migration paths. Consider foreign keys, unique constraints, status enums, and indexes. For initial single-user implementation use safe stub/local identity only in local development; proper auth before public launch.

## API starter routes
```text
GET    /api/v1/health
GET    /api/v1/topics
GET    /api/v1/sections/{slug}
GET    /api/v1/learning-sessions/{id}
PATCH  /api/v1/sections/{slug}/progress
POST   /api/v1/study-sessions
PATCH  /api/v1/study-sessions/{id}
POST   /api/v1/exercises/{id}/submissions
GET    /api/v1/dashboard/summary
```
Add validation and consistent JSON errors. Do not implement endpoints without tests for primary success/error paths.

## Security
- Backend enforces access controls and premium entitlements when introduced.
- CORS restricted; keep secrets in environment/secrets storage, not repository. No secrets in client bundles.
- Never run arbitrary submitted code in API process. Add a security review and isolated runner architecture before enabling public coding submissions.
- Harden authentication, backups, rate limiting, input validation, dependency updates before deploying personal data publicly.

## Deployment learning sequence
1. Local reproducible Docker Compose environment.
2. Single Linux VM on AWS Lightsail, reverse proxy/HTTPS, container volumes, backup and recovery practice, observability, CI/CD; explicit cost budgets and no cloud provisioning without approval.
3. AWS ECR/ECS Fargate + RDS Postgres + ALB + S3 + CloudWatch + Terraform as distinct learning stage. Avoid Kubernetes initially.

## Design principles
Modular monolith; independent frontend/backend deployability; thin routes, explicit services; avoid premature scaling abstractions. Introduce ADRs for decisions and record trade-offs.
