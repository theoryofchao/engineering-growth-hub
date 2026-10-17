# ADR 0011: Seniority-signal labeling, self-hosted LLM coverage, and a Claude Code/Codex toolchain lesson

## Status
Accepted

## Context
User request: label which curriculum topics are more relevant to senior+ levels, confirm observability is covered, and add content on Claude Code, Codex, and (optionally) self-hosted LLMs — explicitly framed around maximizing impact for the user's next job search.

Investigation before making changes:
- **Observability** already exists as its own domain (11. Observability & Reliability, modules 53–57: Observability Fundamentals, Monitoring & Alerting, SRE, Incident Management, Production Resilience), with OpenTelemetry, SLOs/error budgets, and incident response explicitly in scope. No gap found; no change made here beyond the seniority labels below.
- CURRICULUM.md's existing D/W/L/G codes are explicitly documented as depth-of-mastery tiers, not seniority ("These tiers describe intended depth, not seniority labels"), so seniority needed a genuinely new, separate field rather than reinterpreting `tier`.
- Module 70 (AI-Assisted Software Development) already had substantial real lesson content explicitly covering Claude Code and Codex workflows (4 sessions: habits of effective agent use, the METR productivity-measurement reality check, named engineers' real configs, scaling with loops/worktrees). Self-hosted LLMs (Ollama, llama.cpp, vLLM) had zero coverage anywhere in the curriculum.

## Decisions

1. **Seniority signal is a content-layer addition, not a schema change.** Added a `seniority` key (`Core` / `Senior` / `Staff+` / `Staff+/EM`) to every module in `content/curriculum/curriculum-map.json`, and a matching `- **Seniority signal:**` bullet to every module entry in `CURRICULUM.md`, plus a legend and domain-level summary table. `app/seed.py`'s `load_curriculum_map` reads specific named keys off each module dict, so the unused `seniority` key is silently ignored by the loader — no `Topic` column, no migration, no API/frontend change. Scoped this way deliberately: surfacing it as a filter/badge in the UI is a reasonable follow-up slice, but a bigger one (schema + API + frontend), and wasn't asked for explicitly.
2. **Labeling heuristic**: defaulted by domain/tier (`D`-tier foundational domains → Core; most `W`-tier and later `D`-tier systems/ops domains → Senior; `L`-tier architectural-literacy modules → Staff+; `G`-tier leadership modules → Staff+/EM), then hand-overrode ~19 modules where the domain default didn't fit the specific module (e.g., 26/29/46/51/61/66 are `L`-tier within otherwise-Senior domains, so they're individually Staff+). Documented as directional guidance, not a gate, in the new "Seniority signal" section.
3. **Two new subtopics**, additive (no renumbering, per CURRICULUM.md's own ID-stability rule): `67.7` Local and self-hosted inference (Ollama, llama.cpp, vLLM, quantization, when self-hosting beats an API) under LLM Fundamentals; `70.9` Choosing a coding-agent toolchain (Claude Code, Codex, Cursor, self-hosted models, and articulating the tradeoff in an interview) under AI-Assisted Software Development.
4. **Added a 5th real lesson session** to `content/curriculum/ai-assisted-software-development.json` ("Choosing a Toolchain: Claude Code, Codex, and Self-Hosted Models") rather than leaving `70.9` as an unauthored placeholder like most subtopics — this is the part of the request most directly tied to near-term job impact, so it got real content now instead of joining the backlog. 6 content blocks, 4 slide-pinned multiple-choice exercises. Followed ADR 0009's exercise-quality bar: checked option-length spread programmatically (no option is a dramatic outlier; longest-option-is-correct only on 1 of 4, consistent with the existing corpus's own ~20% baseline rate) rather than by feel. Per ADR 0009, display-order randomization already happens at runtime in `ExerciseQuiz`, so `correct_index` position in the source JSON doesn't need manual rotation.
5. **Did not** write lesson content for the 78 other still-unauthored modules, including the newly-added `67.7` subtopic — that's the same large pre-existing backlog (CURRICULUM.md's own "Expansion backlog" section), and out of scope for one request.
6. Bumped `CURRICULUM.md` to version 1.1.0 with a changelog entry.

## Consequences
- `pytest`: 29 tests pass. Had to update two hardcoded session-count assertions (`test_seed.py`'s `len(ai_topic.learning_sessions) == 4` → `5`, `test_learning_sessions.py`'s `len(body["topic_sessions"]) == 4` → `5`) after adding the 5th session — a reminder that any new learning session for an existing topic needs the same two-test sweep.
- No migration, no `schemas.py`/route/frontend change — `seniority` is inert extra data in the JSON until/unless a future slice decides to surface it in the app.
- Not verified against the live stack/UI this round (no frontend or API surface changed); verification was `pytest` plus direct JSON/Python validation of both edited content files.
