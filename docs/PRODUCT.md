# Product requirements — Engineering Growth Hub

## Goals
1. Improve real software engineering proficiency and interview readiness, with tracked knowledge and evidence of mastery.
2. Grow technical leadership competencies: communication, mentoring, design reviews, stakeholder management, product thinking, strategy, planning, behavioral interviews.
3. Learn frontend, backend, CI/CD, testing, observability, Linux, AWS administration by operating the platform itself.
4. Keep lessons realistic, focused and sustainable through Pomodoro-sized sessions.
5. Preserve optional future commercialization without implementing it now.

## Users and scope
Initially one personal user. Keep user IDs in core models where sensible; do not build teams, organizations, billing, or complex RBAC for MVP. Secure personal data before any public deployment.

## Curriculum
Earlier 80-topic modern software engineering knowledge map, grouped by proficiency tier. The *complete original 80-topic list is not included here*; import the exact list from the original conversation when available. Do not fabricate claims that the entire original curriculum was imported.

- **Deep mastery**: algorithms, programming, frontend, backend, databases, API design, testing, system design, observability, security fundamentals, AI-assisted coding.
- **Strong working proficiency**: distributed systems, cloud, containers, CI/CD, SRE, performance engineering, AI applications, engineering architecture.
- **Broad architectural literacy**: Kubernetes internals, advanced data engineering, specialized databases, MLOps, compliance, formal methods, advanced infrastructure.
- **Leadership development**: design reviews, mentoring, technical communication, product thinking, engineering strategy, planning, stakeholder management.

Topic data: hierarchy, learning objectives, prerequisites, references, sessions, exercises, proficiency assessments, user notes, mastery evidence.

## Pomodoro model
- Focus options: 25 minutes + 5-minute break; 50 minutes + 10-minute break.
- Each session has one specific objective, explanatory material, worked example, exercise and short reflection/recall; a topic can span multiple sessions.
- Expose start/pause/resume/reset, break prompt, completion checkpoint and progress persistence. Handle reloads honestly using stored timestamps and paused elapsed time, not volatile in-memory interval alone.
- Users may stop at session boundary. Do not make prolonged study mandatory. Timer completion is *not* the same as topic mastery.
- Time allocations can adapt; do not force rushed learning.

## Exercises
- Types: multiple choice, short answer, coding, debugging, code review, architecture/system design, short multi-session project, leadership scenario.
- Content-driven definitions with starter material, expected learning outcomes, rubric, optional hints, visible/hidden tests where applicable, submissions, attempts and feedback.
- Short projects are divided into Pomodoro-sized checkpoints with acceptance criteria.
- First version: MCQ and/or rubric-based self-assessment; browser JS coding runner later. Monaco editor can be considered. Untrusted execution needs a real isolation and threat model; browser worker alone is not a secure server-grade sandbox.
- Mastery statuses: not started, learning, practiced, mastered; exercise performance/assessment evidence, not just reading time, determines mastery.

## Leadership
- Dedicated competency area.
- STAR story bank (situation, task, action, result, reflection, quantified outcomes).
- Behavioral-question mapping and decision trees: identify competency → select authentic story → structure answer → evaluate against rubric → prepare follow-up.
- Later interactive flow editor (React Flow), mock questions, evidence linking, feedback.

## Monetization (future only)
- Content may have free/premium/access policy metadata; true enforcement in Flask/backend for protected API/content.
- No Stripe, subscriptions, checkout, usage meter, or paid-tier UI in MVP.
- Avoid exposing future protected materials in client bundles or public file endpoints.

## MVP experience
Browse a seeded domain/topic; open one 25-minute lesson; view content; start/pause timer; complete one small exercise; save progress and see it on a dashboard. Include a minimal leadership story form after the core loop works.

## Product quality
Responsive, keyboard-accessible interface; clear loading/error/empty states; no dark patterns or punitive streaks. Separate study time, completion, practice and mastery metrics.
