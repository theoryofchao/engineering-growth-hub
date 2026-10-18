# Modern Software Engineering — Living Curriculum

> **Canonical file:** `CURRICULUM.md`  
> **Version:** 1.1.0  
> **Last reviewed:** 2026-10-17  
> **Status:** Active / evolving  
> **Audience:** Experienced full-stack software engineer progressing toward senior technical leadership  
> **Scope:** 16 domains, 80 stable numbered modules, extensible subtopics and assessments

## Purpose

This document is the **source of truth for WHAT to learn**, not a textbook. Keep the curriculum taxonomy, prerequisite graph, objectives, and evidence standards here. Store growing lesson content, code, quizzes, solutions and project assets in separate files linked from this document. This prevents one enormous Markdown file from becoming impossible to maintain.

A module is not considered mastered because it has been read; progress must be supported by evidence such as implementations, tests, measurements, design documents, or review outcomes.

## Editing rules and conventions

1. **Keep IDs stable.** Existing module IDs `01`–`80` are permanent. Add subtopics as `53.1`, `53.2`, etc., and learning units as `53.1.1`. Never silently recycle an ID.
2. **Preserve historical links.** When renaming or merging content, leave an alias/deprecation note. Record material changes in the changelog.
3. **Write measurable objectives.** Prefer verbs such as *implement, diagnose, compare, measure, defend*, rather than simply *understand*.
4. **Use prerequisites, not a forced linear order.** Link known module IDs. `None` means an entry point. Circular prerequisite chains are disallowed.
5. **Separate curriculum and learning content.** Recommended layout: `curriculum/modules/53-observability-fundamentals/`, with `README.md`, `lessons/`, `exercises/`, `assessments/`, and `resources.md`. Modules can be created incrementally.
6. **Every leaf learning unit must fit a study session.** Prefer 25 minutes of focus + 5 minutes break; use 50 + 10 for labs or longer exercises. Split overlong topics into consecutive units.
7. **Keep proofs of progress.** An assessment needs a tangible artifact or reproducible result. Do not confuse reading completion with proficiency.
8. **Review periodically.** Review fast-changing tooling and frameworks quarterly; revisit more stable concepts when needed. Record review dates at module or lesson level.
9. **Use technologies as examples, not identity.** TypeScript/React/Next.js, Python/Flask, PostgreSQL, AWS, Docker and OpenTelemetry are recommended hands-on choices, while transferable engineering principles are the learning targets.
10. **External contributions and AI additions must be reviewed.** Verify dependencies, code, links, technical accuracy, and assessment quality before merging generated material.

## Proficiency and evidence rubric

| Code | Tier | Meaning | Minimum evidence |
|---|---|---|---|
| **D** | Deep mastery | Implement, diagnose, optimize, and defend independently | Working code, tests, edge/failure analysis, trade-off rationale |
| **W** | Strong working proficiency | Deploy, integrate, operate, and diagnose realistic systems | Running demo or environment, operational test, failure/recovery notes |
| **L** | Broad architectural literacy | Explain, compare, and review specialist systems | Comparative design memo or architecture review with risks and constraints |
| **G** | Leadership development | Influence execution and improve engineering outcomes | Review packet, written decision, facilitation or coaching evidence |

These tiers describe intended depth, not seniority labels. Some modules in the same domain have different target tiers.

## Seniority signal

| Label | Meaning |
|---|---|
| **Core** | Expected competence at any level; necessary but not what gets someone promoted on its own |
| **Senior** | Typical senior-IC differentiator — depth, ownership, and judgment under ambiguity |
| **Staff+** | Staff/principal-IC differentiator — cross-system breadth, architectural review, or org-wide reliability/scale ownership |
| **Staff+/EM** | Leadership-track signal — relevant to a staff+ IC with cross-team influence or to an engineering-management track |

This is directional guidance for prioritizing study toward the next level, not a gate — a junior engineer can and should start Senior-labeled modules early, and a staff engineer still needs Core modules solid. Each module below carries one of these as **Seniority signal**, separate from its depth **Target** tier.

| Domain | IDs | Typical seniority signal |
|---|---|---|
| 01. Computer Science Foundations | 01–07 | Core |
| 02. Programming & Code Quality | 08–13 | Core |
| 03. Web & Frontend | 14–19 | Core, Senior at the edges (17, 19) |
| 04. Backend & APIs | 20–24 | Core → Senior (22–24) |
| 05. Data & Storage | 25–29 | Core → Staff+ (26, 29) |
| 06. Software Architecture | 30–34 | Senior → Staff+ (34) |
| 07. Distributed Systems | 35–39 | Senior → Staff+ (39) |
| 08. Testing & Quality | 40–43 | Core → Senior (41–43) |
| 09. Infrastructure & Cloud | 44–48 | Senior, Staff+ at Kubernetes (46) |
| 10. DevOps & Delivery | 49–52 | Senior → Staff+/EM (51–52) |
| 11. Observability & Reliability | 53–57 | Senior → Staff+ (55, 57) |
| 12. Security & Privacy | 58–61 | Senior → Staff+ (61) |
| 13. Performance Engineering | 62–65 | Senior |
| 14. AI & ML Engineering | 66–70 | Staff+ (66), Senior (67–70, with 70 the fastest-rising signal right now) |
| 15. Product & Collaboration | 71–75 | Staff+/EM |
| 16. Leadership & Strategy | 76–80 | Staff+/EM |

### Completion statuses

`not-started` → `learning` → `practising` → `assessed` → `verified`. Use `needs-review` when evidence becomes outdated. For assessments, record both a pass/fail outcome and remaining gaps. Completion is a property of **evidence**, not elapsed study time.

## Curriculum index

The topic number is the stable module identifier. Module headings below provide prerequisites, objectives, detailed subtopics, and assessments.

| Domain | IDs | Key outcomes |
|---|---|---|
| 01. Computer Science Foundations | 01–07 | Algorithms, memory, operating systems, networking, theory |
| 02. Programming & Code Quality | 08–13 | Idiomatic programming, maintainability, collaborative practice |
| 03. Web & Frontend | 14–19 | Browser, React, accessibility, frontend performance |
| 04. Backend & APIs | 20–24 | Service architecture, API contracts, identity, job processing |
| 05. Data & Storage | 25–29 | SQL, persistence design, caching, data architecture |
| 06. Software Architecture | 30–34 | System design, quality attributes, evolutionary architecture |
| 07. Distributed Systems | 35–39 | Failure modes, consistency, messaging, resilience |
| 08. Testing & Quality | 40–43 | Verification, debugging, testing infrastructure |
| 09. Infrastructure & Cloud | 44–48 | Linux, containers, orchestration, cloud, IaC |
| 10. DevOps & Delivery | 49–52 | CI/CD, releases, platforms, delivery metrics |
| 11. Observability & Reliability | 53–57 | Instrumentation, monitoring, SRE, incident response |
| 12. Security & Privacy | 58–61 | Application security, secure delivery, privacy |
| 13. Performance Engineering | 62–65 | Profiling, optimization, load and capacity |
| 14. AI & ML Engineering | 66–70 | AI applications, evaluations, AI-assisted development |
| 15. Product & Collaboration | 71–75 | Product thinking, execution, communication |
| 16. Leadership & Strategy | 76–80 | Leadership, mentorship, economics, roadmaps |

## Detailed module catalog

Each item below is deliberately a module-level specification. Add individual lesson links under each numbered subtopic as you build content.

### Computer Science Foundations

#### 01 — Data Structures

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `08`
- **Learning objective:** Implement a structure from first principles and select it using measured access patterns.
- **Proficiency assessment:** Build a hash map heap and LRU cache; benchmark and explain complexity.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/01-.../README.md` when created._
- **Subtopics:**
  - **01.1** Arrays and strings
  - **01.2** Linked lists stacks queues and deques
  - **01.3** Hash maps sets and collision resolution
  - **01.4** Trees BSTs balanced trees and heaps
  - **01.5** Graph representations and traversal
  - **01.6** Tries union-find and probabilistic structures

#### 02 — Algorithms & Problem Solving

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `01`, `06`, `08`
- **Learning objective:** Design correct solutions and justify time space and invariants.
- **Proficiency assessment:** Solve unseen problems with complexity proofs and property-based edge tests.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/02-.../README.md` when created._
- **Subtopics:**
  - **02.1** Asymptotic analysis and amortized complexity
  - **02.2** Sorting searching and binary search
  - **02.3** Two pointers sliding windows and prefix sums
  - **02.4** Recursion divide-and-conquer and backtracking
  - **02.5** Greedy methods and correctness proofs
  - **02.6** Dynamic programming
  - **02.7** Graph search shortest paths topological sorting and MST

#### 03 — Computer Architecture

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Core
- **Prerequisites:** `08`
- **Learning objective:** Connect hardware behavior to software runtime costs.
- **Proficiency assessment:** Profile cache- and allocation-heavy code and explain results.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/03-.../README.md` when created._
- **Subtopics:**
  - **03.1** CPU pipelines and instruction execution
  - **03.2** Memory hierarchy and cache locality
  - **03.3** Stack heap allocation and garbage collection
  - **03.4** Atomics and memory ordering
  - **03.5** SIMD parallelism and performance counters

#### 04 — Operating Systems

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Core
- **Prerequisites:** `03`, `08`
- **Learning objective:** Diagnose resource concurrency and process failures.
- **Proficiency assessment:** Investigate a deadlock memory leak and exhausted file descriptors.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/04-.../README.md` when created._
- **Subtopics:**
  - **04.1** Processes threads and scheduling
  - **04.2** Virtual memory paging and memory mapping
  - **04.3** Filesystems and file descriptors
  - **04.4** Synchronization and deadlocks
  - **04.5** Syscalls signals and IPC
  - **04.6** Linux process diagnosis

#### 05 — Computer Networking

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `04`, `08`
- **Learning objective:** Trace a request end to end and isolate network faults.
- **Proficiency assessment:** Use packet capture and system tools to diagnose DNS TLS and timeouts.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/05-.../README.md` when created._
- **Subtopics:**
  - **05.1** OSI and TCP/IP
  - **05.2** DNS resolution and caching
  - **05.3** TCP UDP QUIC and connection lifecycles
  - **05.4** HTTP/1.1 HTTP/2 HTTP/3
  - **05.5** TLS certificates and handshake
  - **05.6** Routing NAT proxies load balancers
  - **05.7** Packet capture and debugging

#### 06 — Mathematics for Computing

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Core
- **Prerequisites:** `08`
- **Learning objective:** Apply mathematics to algorithms systems and experimental conclusions.
- **Proficiency assessment:** Prove an algorithm invariant and interpret an experiment with uncertainty.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/06-.../README.md` when created._
- **Subtopics:**
  - **06.1** Discrete math sets and logic
  - **06.2** Proofs and invariants
  - **06.3** Combinatorics and probability
  - **06.4** Statistics and experiment design
  - **06.5** Graph theory
  - **06.6** Linear algebra and numerical computing

#### 07 — Programming Language Theory

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Core
- **Prerequisites:** `03`, `08`
- **Learning objective:** Explain how code becomes runtime behavior and where guarantees apply.
- **Proficiency assessment:** Implement a small parser interpreter or type checker.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/07-.../README.md` when created._
- **Subtopics:**
  - **07.1** Parsing lexing and ASTs
  - **07.2** Compilers interpreters and runtimes
  - **07.3** Static dynamic and gradual type systems
  - **07.4** Language semantics and closures
  - **07.5** Memory models and garbage collection
  - **07.6** Concurrency models

### Programming & Code Quality

#### 08 — Programming Fundamentals

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** None
- **Learning objective:** Implement robust programs without relying on framework conventions.
- **Proficiency assessment:** Implement and test equivalent nontrivial logic in two languages.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/08-.../README.md` when created._
- **Subtopics:**
  - **08.1** Variables types control flow and functions
  - **08.2** Scope closures and modules
  - **08.3** Error modeling and exception handling
  - **08.4** Async await promises and scheduling
  - **08.5** Memory and object identity
  - **08.6** Idiomatic TypeScript Python and backend language techniques

#### 09 — Programming Paradigms

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `08`
- **Learning objective:** Choose paradigms based on constraints and failure modes.
- **Proficiency assessment:** Compare functional and object-oriented implementations and their tradeoffs.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/09-.../README.md` when created._
- **Subtopics:**
  - **09.1** Object orientation and encapsulation
  - **09.2** Functional programming immutability and pure functions
  - **09.3** Declarative vs imperative models
  - **09.4** Reactive and event-driven design
  - **09.5** Generics and metaprogramming
  - **09.6** Concurrency paradigms

#### 10 — Design Principles & Patterns

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `08`, `09`
- **Learning objective:** Introduce abstractions that reduce change cost without unnecessary complexity.
- **Proficiency assessment:** Refactor a tightly coupled component and defend each abstraction.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/10-.../README.md` when created._
- **Subtopics:**
  - **10.1** SOLID DRY KISS YAGNI
  - **10.2** Cohesion coupling and modularity
  - **10.3** Composition inheritance and dependency injection
  - **10.4** Factory strategy adapter observer
  - **10.5** State machines and domain patterns
  - **10.6** Recognizing overengineering

#### 11 — Code Quality & Maintainability

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `08`, `10`
- **Learning objective:** Improve internal quality while preserving externally observable behavior.
- **Proficiency assessment:** Modernize legacy code with before-and-after test and complexity evidence.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/11-.../README.md` when created._
- **Subtopics:**
  - **11.1** Code readability and naming
  - **11.2** Refactoring and characterization tests
  - **11.3** Cyclomatic and cognitive complexity
  - **11.4** Error contracts and defensive code
  - **11.5** Static analysis linters and formatters
  - **11.6** Technical debt measurement and prioritization

#### 12 — Developer Tools & Workflows

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `08`
- **Learning objective:** Work efficiently and reproducibly in unfamiliar repositories.
- **Proficiency assessment:** Bisect a regression resolve a complex merge and reproduce a build.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/12-.../README.md` when created._
- **Subtopics:**
  - **12.1** Git internals branching rebasing bisect
  - **12.2** Shell scripting and CLI fluency
  - **12.3** Debuggers and profilers
  - **12.4** Build tools and package managers
  - **12.5** Reproducible environments
  - **12.6** Monorepos tooling and task automation

#### 13 — Collaborative Coding

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `10`, `11`, `12`
- **Learning objective:** Raise quality and shared understanding through collaboration.
- **Proficiency assessment:** Review a seeded flawed PR and deliver actionable feedback.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/13-.../README.md` when created._
- **Subtopics:**
  - **13.1** Pull requests and code review
  - **13.2** Constructive review feedback
  - **13.3** Pair programming and mobbing
  - **13.4** Repository standards and documentation
  - **13.5** Dependency upgrades
  - **13.6** Engineering handoffs

### Web & Frontend

#### 14 — Web Fundamentals

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `05`, `08`
- **Learning objective:** Build robust interfaces using web platform primitives.
- **Proficiency assessment:** Deliver a small accessible interactive app without a UI framework.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/14-.../README.md` when created._
- **Subtopics:**
  - **14.1** Semantic HTML and forms
  - **14.2** CSS layout typography and responsive styling
  - **14.3** JavaScript and TypeScript in browsers
  - **14.4** DOM events and Fetch
  - **14.5** HTTP browser caching and cookies
  - **14.6** Cross-browser compatibility

#### 15 — Browser Internals

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `03`, `14`
- **Learning objective:** Explain browser scheduling and rendering and diagnose jank.
- **Proficiency assessment:** Reproduce and fix long tasks layout thrashing and paint costs.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/15-.../README.md` when created._
- **Subtopics:**
  - **15.1** HTML parsing DOM and CSSOM
  - **15.2** Render tree layout paint compositing
  - **15.3** JavaScript event loop tasks microtasks
  - **15.4** Browser processes workers and memory
  - **15.5** Rendering and layout thrashing
  - **15.6** Network-to-pixel critical path

#### 16 — Frontend Architecture

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `10`, `14`, `15`
- **Learning objective:** Choose frontend boundaries and rendering strategies deliberately.
- **Proficiency assessment:** Build a multi-route app and document alternative rendering designs.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/16-.../README.md` when created._
- **Subtopics:**
  - **16.1** Component boundaries and design
  - **16.2** React rendering hooks and state
  - **16.3** Routing and data fetching
  - **16.4** CSR SSR SSG streaming and hydration
  - **16.5** State management and cache consistency
  - **16.6** Micro-frontends and integration contracts

#### 17 — Frontend Performance

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `15`, `16`, `65`
- **Learning objective:** Improve real user experience through measured intervention.
- **Proficiency assessment:** Establish baseline and measure improved metrics under controlled tests.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/17-.../README.md` when created._
- **Subtopics:**
  - **17.1** Core Web Vitals LCP INP CLS
  - **17.2** Profiling Chrome DevTools and field data
  - **17.3** Code splitting lazy loading and bundles
  - **17.4** Images fonts and resource priorities
  - **17.5** Hydration and client rendering costs
  - **17.6** Caching and CDN behavior

#### 18 — UI UX & Accessibility

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `14`, `16`
- **Learning objective:** Implement inclusive interfaces across device and input contexts.
- **Proficiency assessment:** Build and audit a keyboard-usable localized responsive feature.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/18-.../README.md` when created._
- **Subtopics:**
  - **18.1** Accessible names roles and semantics
  - **18.2** Keyboard focus and screen readers
  - **18.3** WCAG and testing
  - **18.4** Responsive and adaptive design
  - **18.5** Design systems and tokens
  - **18.6** Form validation localization and internationalization

#### 19 — Advanced Client Applications

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `14`, `16`, `21`
- **Learning objective:** Build clients resilient to connectivity and synchronization failures.
- **Proficiency assessment:** Demonstrate offline mutation reconciliation and reconnect recovery.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/19-.../README.md` when created._
- **Subtopics:**
  - **19.1** PWAs and service workers
  - **19.2** Offline storage IndexedDB and synchronization
  - **19.3** WebSocket and SSE clients
  - **19.4** Optimistic updates and conflict resolution
  - **19.5** Browser security and permissions
  - **19.6** Mobile desktop and embedded client patterns

### Backend & APIs

#### 20 — Backend Fundamentals

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `05`, `08`
- **Learning objective:** Build robust maintainable request processing services.
- **Proficiency assessment:** Implement a service with graceful shutdown and negative-path tests.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/20-.../README.md` when created._
- **Subtopics:**
  - **20.1** HTTP server lifecycle and middleware
  - **20.2** Input validation and response contracts
  - **20.3** Service layers and error taxonomy
  - **20.4** Resource pools and graceful shutdown
  - **20.5** Async processing and concurrency
  - **20.6** Structured configuration and environments

#### 21 — API Design

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `20`, `25`
- **Learning objective:** Define APIs that are easy to consume and safe to evolve.
- **Proficiency assessment:** Design version and contract-test a public-facing API.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/21-.../README.md` when created._
- **Subtopics:**
  - **21.1** REST resources and status semantics
  - **21.2** GraphQL schemas and resolvers
  - **21.3** gRPC protobuf and RPC contracts
  - **21.4** Pagination filtering and rate limits
  - **21.5** Versioning compatibility and error models
  - **21.6** Idempotency webhooks WebSockets and SSE
  - **21.7** OpenAPI and contract testing

#### 22 — Authentication & Authorization

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `21`, `58`
- **Learning objective:** Enforce identity and permissions across trust boundaries.
- **Proficiency assessment:** Implement authentication roles and negative authorization tests.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/22-.../README.md` when created._
- **Subtopics:**
  - **22.1** Sessions cookies CSRF and tokens
  - **22.2** OAuth 2.0 and OpenID Connect
  - **22.3** Password passkey and MFA concepts
  - **22.4** RBAC ABAC and policy enforcement
  - **22.5** Tenant isolation and authorization testing
  - **22.6** Token rotation revocation and identity providers

#### 23 — Backend Architecture

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `10`, `20`, `21`, `25`
- **Learning objective:** Separate business rules from infrastructure and isolate change.
- **Proficiency assessment:** Replace storage adapter while preserving tested domain behavior.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/23-.../README.md` when created._
- **Subtopics:**
  - **23.1** Layered hexagonal and clean architecture
  - **23.2** Domain modeling and invariants
  - **23.3** Dependency injection and ports
  - **23.4** Transactions and consistency boundaries
  - **23.5** Service decomposition
  - **23.6** Configuration and feature flags

#### 24 — Background Processing

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `20`, `21`, `35`
- **Learning objective:** Implement recoverable asynchronous execution.
- **Proficiency assessment:** Demonstrate crash recovery retry exhaustion and duplicate prevention.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/24-.../README.md` when created._
- **Subtopics:**
  - **24.1** Job queues workers and schedulers
  - **24.2** Retry policies backoff and dead-letter queues
  - **24.3** Deduplication and idempotency
  - **24.4** Long-running workflows and cancellation
  - **24.5** Outbox patterns
  - **24.6** Job visibility and reconciliation

### Data & Storage

#### 25 — Relational Databases

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `01`, `20`
- **Learning objective:** Build correct and efficient relational persistence.
- **Proficiency assessment:** Optimize slow queries and reproduce transaction anomalies.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/25-.../README.md` when created._
- **Subtopics:**
  - **25.1** Schema modeling and normalization
  - **25.2** SQL joins CTEs and window functions
  - **25.3** Indexes query plans and performance
  - **25.4** Transactions isolation and locking
  - **25.5** Migrations and rollback
  - **25.6** Connection pooling and operational maintenance

#### 26 — Specialized Databases

- **Target:** Broad architectural literacy (`L`)
- **Seniority signal:** Staff+
- **Prerequisites:** `25`, `27`
- **Learning objective:** Choose a storage engine for workloads with explicit constraints.
- **Proficiency assessment:** Produce selection ADRs comparing specialized and relational solutions.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/26-.../README.md` when created._
- **Subtopics:**
  - **26.1** Document and key-value stores
  - **26.2** Graph and traversal databases
  - **26.3** Search and inverted indexes
  - **26.4** Time-series storage and retention
  - **26.5** Wide-column and vector databases
  - **26.6** Fit-for-purpose selection and operational tradeoffs

#### 27 — Data Architecture

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `25`
- **Learning objective:** Design data systems resilient to change and concurrency.
- **Proficiency assessment:** Model consistency and migration scenarios including failure injection.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/27-.../README.md` when created._
- **Subtopics:**
  - **27.1** Entity modeling and invariants
  - **27.2** ACID BASE and consistency
  - **27.3** Partitioning sharding replication
  - **27.4** Schema and event evolution
  - **27.5** Retention lineage and data lifecycle
  - **27.6** Distributed data ownership

#### 28 — Caching

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `20`, `25`
- **Learning objective:** Improve latency while controlling staleness and correctness.
- **Proficiency assessment:** Implement cache and measure hit rates invalidation and failure cases.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/28-.../README.md` when created._
- **Subtopics:**
  - **28.1** Browser CDN and application caches
  - **28.2** Cache-aside write-through and write-behind
  - **28.3** TTL eviction and invalidation
  - **28.4** Cache stampedes and request collapsing
  - **28.5** Consistency and stale data
  - **28.6** Redis design and observability

#### 29 — Data Engineering

- **Target:** Broad architectural literacy (`L`)
- **Seniority signal:** Staff+
- **Prerequisites:** `25`, `37`
- **Learning objective:** Review pipelines for correctness freshness and maintainability.
- **Proficiency assessment:** Design recoverable streaming and batch ingestion with data quality gates.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/29-.../README.md` when created._
- **Subtopics:**
  - **29.1** ETL ELT and orchestration
  - **29.2** CDC and log-based replication
  - **29.3** Batch streaming windows and watermarks
  - **29.4** Warehouses lakehouses and schemas
  - **29.5** Data quality lineage and governance
  - **29.6** Backfill and recovery

### Software Architecture

#### 30 — Architecture Fundamentals

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `10`, `20`, `25`
- **Learning objective:** Translate constraints into defensible design decisions.
- **Proficiency assessment:** Write and defend an architecture proposal with alternatives.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/30-.../README.md` when created._
- **Subtopics:**
  - **30.1** Quality attributes and constraints
  - **30.2** Coupling cohesion and boundaries
  - **30.3** Architectural tradeoffs
  - **30.4** ADRs and decision rationale
  - **30.5** Reliability security and cost attributes
  - **30.6** Evolutionary architecture

#### 31 — Architectural Styles

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `30`, `35`
- **Learning objective:** Evaluate styles by organizational and runtime tradeoffs.
- **Proficiency assessment:** Compare three architecture approaches and cost of operations.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/31-.../README.md` when created._
- **Subtopics:**
  - **31.1** Layered and modular monolith
  - **31.2** Microservices and SOA
  - **31.3** Event-driven architecture
  - **31.4** CQRS and event sourcing
  - **31.5** Serverless and function design
  - **31.6** Choosing complexity deliberately

#### 32 — System Design Building Blocks

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `05`, `20`, `25`, `28`
- **Learning objective:** Compose scalable architecture using well understood primitives.
- **Proficiency assessment:** Design a scalable service and justify each component.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/32-.../README.md` when created._
- **Subtopics:**
  - **32.1** Load balancers proxies and gateways
  - **32.2** CDN and object storage
  - **32.3** Messaging queues and streaming
  - **32.4** Caching and search
  - **32.5** Rate limiting and throttling
  - **32.6** Identity and multitenancy infrastructure

#### 33 — System Design Methodology

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `30`, `31`, `32`
- **Learning objective:** Lead a system design discussion from ambiguity to decision.
- **Proficiency assessment:** Complete a timed design review with evolving constraints.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/33-.../README.md` when created._
- **Subtopics:**
  - **33.1** Functional and nonfunctional requirements
  - **33.2** Capacity sizing and rough estimates
  - **33.3** API and data model design
  - **33.4** Diagrams and communication
  - **33.5** Bottleneck and failure analysis
  - **33.6** Tradeoffs alternatives and follow-up questions

#### 34 — Architecture Evolution

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Staff+
- **Prerequisites:** `30`, `31`, `33`
- **Learning objective:** Plan safe change to existing production architecture.
- **Proficiency assessment:** Write staged migration plan with verification and rollback.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/34-.../README.md` when created._
- **Subtopics:**
  - **34.1** Strangler pattern and incremental migration
  - **34.2** Service extraction
  - **34.3** Schema and API compatibility
  - **34.4** Expand-contract deployments
  - **34.5** Technical debt governance
  - **34.6** Rollback and migration safety

### Distributed Systems

#### 35 — Distributed Fundamentals

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `05`, `25`, `30`
- **Learning objective:** Reason about distributed behavior under failure.
- **Proficiency assessment:** Explain and experimentally demonstrate partition behavior.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/35-.../README.md` when created._
- **Subtopics:**
  - **35.1** Partial failure and network partitions
  - **35.2** CAP and PACELC tradeoffs
  - **35.3** Consistency and availability
  - **35.4** Logical clocks and causality
  - **35.5** Consensus and failure detection
  - **35.6** Timeouts and unreliable clocks

#### 36 — Distributed Data

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `27`, `35`
- **Learning objective:** Select distributed correctness and recovery guarantees.
- **Proficiency assessment:** Implement saga compensation and analyze concurrent updates.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/36-.../README.md` when created._
- **Subtopics:**
  - **36.1** Leader follower and quorum replication
  - **36.2** Consistency models
  - **36.3** Distributed transactions and sagas
  - **36.4** Conflict resolution and CRDT basics
  - **36.5** Distributed locks fencing tokens
  - **36.6** Global data and migration

#### 37 — Messaging & Streaming

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `24`, `35`
- **Learning objective:** Operate reliable event driven workloads.
- **Proficiency assessment:** Build consumer with dedupe replay and dead-letter recovery.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/37-.../README.md` when created._
- **Subtopics:**
  - **37.1** Queues pub sub and streams
  - **37.2** Consumer groups and partitions
  - **37.3** Ordering delivery and replay
  - **37.4** At-least-once processing and deduplication
  - **37.5** Backpressure and consumer lag
  - **37.6** Outbox inbox and event versioning

#### 38 — Resilience Patterns

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `20`, `35`, `53`
- **Learning objective:** Prevent cascading failures and recover predictably.
- **Proficiency assessment:** Compare behavior before and after resilience controls in fault tests.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/38-.../README.md` when created._
- **Subtopics:**
  - **38.1** Timeout budgets and deadlines
  - **38.2** Exponential backoff jitter retries
  - **38.3** Circuit breakers and bulkheads
  - **38.4** Rate limiting and load shedding
  - **38.5** Isolation and degradation
  - **38.6** Failure injection and dependency budgets

#### 39 — Distributed Scalability

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Staff+
- **Prerequisites:** `35`, `36`, `37`
- **Learning objective:** Design practical scaling and fault tolerance approaches.
- **Proficiency assessment:** Validate a capacity and failure model with load and failover tests.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/39-.../README.md` when created._
- **Subtopics:**
  - **39.1** Horizontal scaling and statelessness
  - **39.2** Partitioning and sharding
  - **39.3** Service discovery
  - **39.4** Leader election and distributed scheduling
  - **39.5** Multi-region design
  - **39.6** Consistent hashing and hotspot avoidance

### Testing & Quality

#### 40 — Testing Fundamentals

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Core
- **Prerequisites:** `08`, `11`
- **Learning objective:** Create fast trustworthy feedback on behavior.
- **Proficiency assessment:** Deliver layered test suite including negative cases.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/40-.../README.md` when created._
- **Subtopics:**
  - **40.1** Unit tests and boundaries
  - **40.2** Integration and E2E tests
  - **40.3** Test doubles and fixtures
  - **40.4** Deterministic test design
  - **40.5** Test pyramid and coverage strategy
  - **40.6** Behavioral and failure case assertions

#### 41 — Advanced Testing

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `21`, `38`, `40`
- **Learning objective:** Find defects missed by example driven tests.
- **Proficiency assessment:** Demonstrate a new defect detected by property or mutation tests.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/41-.../README.md` when created._
- **Subtopics:**
  - **41.1** Contract and consumer driven tests
  - **41.2** Property-based testing
  - **41.3** Fuzz and mutation testing
  - **41.4** Performance and chaos testing
  - **41.5** Accessibility and compatibility
  - **41.6** Security testing fundamentals

#### 42 — Test Infrastructure

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `40`, `45`, `49`
- **Learning objective:** Make tests repeatable across developer and CI environments.
- **Proficiency assessment:** Build isolated CI suite and diagnose a seeded flaky test.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/42-.../README.md` when created._
- **Subtopics:**
  - **42.1** CI test pipelines
  - **42.2** Isolated databases and ephemeral services
  - **42.3** Test data and fixtures
  - **42.4** Parallel execution
  - **42.5** Flake detection and triage
  - **42.6** Coverage reporting and test governance

#### 43 — Debugging & Root Cause Analysis

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `04`, `12`, `40`
- **Learning objective:** Diagnose unknown failures systematically and verify remediation.
- **Proficiency assessment:** Find seeded defect and produce root cause evidence.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/43-.../README.md` when created._
- **Subtopics:**
  - **43.1** Reproduction and hypothesis framing
  - **43.2** Debuggers stack traces and profilers
  - **43.3** Memory leaks and race conditions
  - **43.4** Logs traces and metrics for diagnosis
  - **43.5** Fault isolation and regression tests
  - **43.6** Root cause reports and corrective actions

### Infrastructure & Cloud

#### 44 — Linux & Infrastructure

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `04`, `05`, `12`
- **Learning objective:** Operate Linux services and diagnose host level failures.
- **Proficiency assessment:** Fix service networking and resource exhaustion scenarios.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/44-.../README.md` when created._
- **Subtopics:**
  - **44.1** Shell process and service management
  - **44.2** Permissions users and groups
  - **44.3** Storage and mounts
  - **44.4** DNS routes firewalls and SSH
  - **44.5** Resource usage and system logs
  - **44.6** Backups and maintenance

#### 45 — Containers & Virtualization

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `20`, `44`
- **Learning objective:** Build reproducible and secure containerized services.
- **Proficiency assessment:** Package and harden a multi-container application.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/45-.../README.md` when created._
- **Subtopics:**
  - **45.1** Images Dockerfiles and layer caching
  - **45.2** Namespaces and cgroups
  - **45.3** Container networking and volumes
  - **45.4** Compose and local orchestration
  - **45.5** Registries security and scanning
  - **45.6** VMs vs containers tradeoffs

#### 46 — Kubernetes

- **Target:** Broad architectural literacy (`L`)
- **Seniority signal:** Staff+
- **Prerequisites:** `44`, `45`, `47`
- **Learning objective:** Explain orchestration mechanics and review deployments.
- **Proficiency assessment:** Diagnose failing pod or service in a test cluster.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/46-.../README.md` when created._
- **Subtopics:**
  - **46.1** Control plane API server etcd scheduler
  - **46.2** Controllers and reconciliation
  - **46.3** Pods deployments services and ingress
  - **46.4** CNI CSI and storage
  - **46.5** Probes autoscaling disruption budgets
  - **46.6** RBAC and admission controls

#### 47 — Cloud Platforms

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `32`, `44`, `45`
- **Learning objective:** Deploy secure small production-like cloud systems.
- **Proficiency assessment:** Provision workload with private components budget and logging.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/47-.../README.md` when created._
- **Subtopics:**
  - **47.1** AWS core compute and storage
  - **47.2** VPC subnets routing and IAM
  - **47.3** Managed DB and queues
  - **47.4** Serverless and event services
  - **47.5** Cloud security and cost
  - **47.6** High availability and account organization

#### 48 — Infrastructure as Code

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `12`, `47`
- **Learning objective:** Provision auditable reproducible environments.
- **Proficiency assessment:** Deploy update and detect drift through reviewed IaC changes.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/48-.../README.md` when created._
- **Subtopics:**
  - **48.1** Terraform OpenTofu principles
  - **48.2** State plans modules and providers
  - **48.3** Secrets and sensitive outputs
  - **48.4** Environment promotion
  - **48.5** Drift detection and policy
  - **48.6** Immutable and repeatable provisioning

### DevOps & Delivery

#### 49 — CI/CD

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `12`, `40`, `45`
- **Learning objective:** Ship verified changes through automated delivery.
- **Proficiency assessment:** Build commit-to-deployment pipeline with testing and scanning.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/49-.../README.md` when created._
- **Subtopics:**
  - **49.1** Build and test pipeline design
  - **49.2** Dependency and artifact caching
  - **49.3** Container registry and provenance
  - **49.4** Quality security and policy gates
  - **49.5** Deploy pipelines and environment promotion
  - **49.6** Pipeline secrets and permissions

#### 50 — Deployment Strategies

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `49`, `53`
- **Learning objective:** Release software with limited disruption and safe recovery.
- **Proficiency assessment:** Inject bad release and demonstrate controlled rollback.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/50-.../README.md` when created._
- **Subtopics:**
  - **50.1** Rolling blue green and canary
  - **50.2** Feature flags and dark launch
  - **50.3** Progressive release metrics
  - **50.4** Backward compatible schema changes
  - **50.5** Automated/manual rollback
  - **50.6** Blast radius control

#### 51 — Platform Engineering

- **Target:** Broad architectural literacy (`L`)
- **Seniority signal:** Staff+
- **Prerequisites:** `45`, `48`, `49`
- **Learning objective:** Evaluate platform investments for team productivity.
- **Proficiency assessment:** Design golden path and score developer experience.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/51-.../README.md` when created._
- **Subtopics:**
  - **51.1** Internal developer platforms
  - **51.2** Golden paths templates and scaffolding
  - **51.3** Self service provisioning
  - **51.4** Developer portals and service catalogs
  - **51.5** Platform API and governance
  - **51.6** Adoption and developer experience metrics

#### 52 — Delivery Management

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `49`, `50`, `72`
- **Learning objective:** Improve flow and outcomes without vanity metrics.
- **Proficiency assessment:** Analyze sample delivery data and propose experiment.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/52-.../README.md` when created._
- **Subtopics:**
  - **52.1** DORA outcomes and caveats
  - **52.2** Release flow and value stream mapping
  - **52.3** Cycle time bottleneck analysis
  - **52.4** Dependency management
  - **52.5** Quality and throughput tradeoffs
  - **52.6** Continuous improvement experiments

### Observability & Reliability

#### 53 — Observability Fundamentals

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `20`, `35`, `43`
- **Learning objective:** Instrument services so distributed failures can be diagnosed.
- **Proficiency assessment:** Correlate a cross-service failure using logs metrics traces.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/53-.../README.md` when created._
- **Subtopics:**
  - **53.1** Structured logs and correlation
  - **53.2** Counters gauges histograms
  - **53.3** Distributed traces and spans
  - **53.4** OpenTelemetry SDK Collector and propagation
  - **53.5** Sampling and cardinality
  - **53.6** Cross-signal investigation

#### 54 — Monitoring & Alerting

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `53`, `65`
- **Learning objective:** Detect important customer impact with low-noise alerts.
- **Proficiency assessment:** Build alerts detecting seeded latency errors and saturation.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/54-.../README.md` when created._
- **Subtopics:**
  - **54.1** Golden signals RED and USE
  - **54.2** Application and infrastructure dashboards
  - **54.3** SLI instrumentation
  - **54.4** Alert tuning and actionable paging
  - **54.5** Synthetics and real user monitoring
  - **54.6** Alert noise and ownership

#### 55 — Site Reliability Engineering

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Staff+
- **Prerequisites:** `53`, `54`, `64`
- **Learning objective:** Manage reliability with measurable customer outcomes.
- **Proficiency assessment:** Write SLO spec and compute burn under sample incidents.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/55-.../README.md` when created._
- **Subtopics:**
  - **55.1** SLIs SLOs and SLAs
  - **55.2** Error budgets and burn rates
  - **55.3** Toil and automation
  - **55.4** Capacity management
  - **55.5** Reliability governance and tradeoffs
  - **55.6** SRE team interaction models

#### 56 — Incident Management

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `53`, `54`, `55`, `74`
- **Learning objective:** Respond to incidents and learn from them effectively.
- **Proficiency assessment:** Conduct tabletop incident and produce postmortem.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/56-.../README.md` when created._
- **Subtopics:**
  - **56.1** Incident severity and command
  - **56.2** On call and escalation
  - **56.3** Runbooks and mitigation
  - **56.4** Stakeholder updates
  - **56.5** Timelines and postmortems
  - **56.6** Corrective action tracking

#### 57 — Production Resilience

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Staff+
- **Prerequisites:** `35`, `55`
- **Learning objective:** Build and verify business recovery capabilities.
- **Proficiency assessment:** Execute and time data restore and failover tests.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/57-.../README.md` when created._
- **Subtopics:**
  - **57.1** Availability design
  - **57.2** Backups and restoration
  - **57.3** RTO RPO and recovery validation
  - **57.4** Regional and dependency failover
  - **57.5** Disaster recovery exercises
  - **57.6** Capacity and continuity

### Security & Privacy

#### 58 — Application Security

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `14`, `20`, `21`
- **Learning objective:** Find and remediate common application vulnerabilities.
- **Proficiency assessment:** Exploit intentionally vulnerable lab and regression test fixes.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/58-.../README.md` when created._
- **Subtopics:**
  - **58.1** OWASP risk classes
  - **58.2** Injection and output encoding
  - **58.3** XSS CSRF and SSRF
  - **58.4** Authentication and authorization attacks
  - **58.5** Input validation and dangerous deserialization
  - **58.6** Secure design and abuse cases

#### 59 — Infrastructure Security

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `44`, `45`, `47`, `58`
- **Learning objective:** Design operational defense in depth.
- **Proficiency assessment:** Harden cloud test environment and demonstrate access restrictions.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/59-.../README.md` when created._
- **Subtopics:**
  - **59.1** Cloud IAM and least privilege
  - **59.2** Secret and key management
  - **59.3** TLS at rest and in transit
  - **59.4** Network security and segmentation
  - **59.5** Container and image security
  - **59.6** Workload identity and zero trust

#### 60 — Secure Software Development

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior
- **Prerequisites:** `40`, `49`, `58`
- **Learning objective:** Integrate security into engineering lifecycle.
- **Proficiency assessment:** Threat-model service and add meaningful security CI controls.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/60-.../README.md` when created._
- **Subtopics:**
  - **60.1** Threat modeling and attack trees
  - **60.2** SAST DAST and SCA
  - **60.3** SBOM and supply chain provenance
  - **60.4** Dependency vulnerabilities and patching
  - **60.5** Secure code review
  - **60.6** Security gates and response workflow

#### 61 — Privacy Compliance & Governance

- **Target:** Broad architectural literacy (`L`)
- **Seniority signal:** Staff+
- **Prerequisites:** `27`, `58`, `59`
- **Learning objective:** Recognize data governance constraints and review risks.
- **Proficiency assessment:** Evaluate personal-data design and document control gaps.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/61-.../README.md` when created._
- **Subtopics:**
  - **61.1** Data inventory and classification
  - **61.2** Minimization consent retention and deletion
  - **61.3** GDPR PIPEDA and jurisdictional obligations
  - **61.4** Auditability and evidence
  - **61.5** Third-party risk
  - **61.6** Privacy by design and residency

### Performance Engineering

#### 62 — Application Performance

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `02`, `03`, `43`
- **Learning objective:** Measure identify and improve expensive code paths.
- **Proficiency assessment:** Report before/after optimization with reproducible workload.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/62-.../README.md` when created._
- **Subtopics:**
  - **62.1** CPU and heap profiling
  - **62.2** Allocation and garbage collection
  - **62.3** Async blocking and contention
  - **62.4** Algorithm and cache efficiency
  - **62.5** Network overhead
  - **62.6** Controlled optimization

#### 63 — Database Performance

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `25`, `62`
- **Learning objective:** Remove data-layer bottlenecks without introducing regressions.
- **Proficiency assessment:** Fix slow queries and demonstrate plan changes.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/63-.../README.md` when created._
- **Subtopics:**
  - **63.1** EXPLAIN and query plans
  - **63.2** Index selection
  - **63.3** N+1 query detection
  - **63.4** Pooling and connection limits
  - **63.5** Lock contention
  - **63.6** Read replicas and scale tradeoffs

#### 64 — Scalability & Capacity

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `39`, `62`, `63`
- **Learning objective:** Predict and validate scaling thresholds.
- **Proficiency assessment:** Build capacity model and check under load.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/64-.../README.md` when created._
- **Subtopics:**
  - **64.1** Throughput latency and concurrency
  - **64.2** Little law and queueing intuition
  - **64.3** Capacity planning
  - **64.4** Workload and traffic distributions
  - **64.5** Saturation and hotspots
  - **64.6** Autoscaling and limits

#### 65 — Performance Measurement

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `40`, `62`, `64`
- **Learning objective:** Produce trustworthy performance evidence.
- **Proficiency assessment:** Run load tests and publish reproducible bottleneck analysis.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/65-.../README.md` when created._
- **Subtopics:**
  - **65.1** Benchmark design and baselines
  - **65.2** Load stress and soak tests
  - **65.3** p50 p95 p99 interpretation
  - **65.4** Experiment controls and noise
  - **65.5** Regression gates
  - **65.6** Performance budgets

### AI & ML Engineering

#### 66 — Machine Learning Foundations

- **Target:** Broad architectural literacy (`L`)
- **Seniority signal:** Staff+
- **Prerequisites:** `06`, `08`, `29`
- **Learning objective:** Understand model training evaluation and failure modes.
- **Proficiency assessment:** Train baseline model and analyze generalization and errors.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/66-.../README.md` when created._
- **Subtopics:**
  - **66.1** Supervised and unsupervised learning
  - **66.2** Feature engineering and splits
  - **66.3** Model training metrics and loss
  - **66.4** Overfitting and leakage
  - **66.5** Neural networks and embeddings
  - **66.6** ML evaluation and uncertainty

#### 67 — LLM Fundamentals

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `66`
- **Learning objective:** Explain model constraints and select suitable inference options.
- **Proficiency assessment:** Benchmark models on task quality latency and cost.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/67-.../README.md` when created._
- **Subtopics:**
  - **67.1** Tokens and tokenization
  - **67.2** Transformers and attention
  - **67.3** Context windows and inference
  - **67.4** Decoding sampling and determinism
  - **67.5** Embeddings and representations
  - **67.6** Model comparison capability limits
  - **67.7** Local and self-hosted inference (Ollama, llama.cpp, vLLM; quantization; when self-hosting beats an API for cost, latency, or data residency — and when it doesn't)

#### 68 — AI Application Engineering

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `21`, `27`, `67`
- **Learning objective:** Build AI features with measurable behavior and bounded tool use.
- **Proficiency assessment:** Create RAG and tool use app with labeled evaluation set.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/68-.../README.md` when created._
- **Subtopics:**
  - **68.1** Prompt design and structured outputs
  - **68.2** Function calling and tool schemas
  - **68.3** RAG chunking retrieval and reranking
  - **68.4** Vector search and embeddings
  - **68.5** Agent planning workflow and MCP
  - **68.6** Context memory and grounding

#### 69 — AI Production Systems

- **Target:** Strong working proficiency (`W`)
- **Seniority signal:** Senior
- **Prerequisites:** `53`, `59`, `67`, `68`
- **Learning objective:** Operate AI features safely and cost effectively.
- **Proficiency assessment:** Build eval and fallback workflow with failure injection.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/69-.../README.md` when created._
- **Subtopics:**
  - **69.1** LLM evaluations and regression tests
  - **69.2** Prompt injection and tool permissions
  - **69.3** Observability token cost and latency
  - **69.4** Model gateways fallbacks and caching
  - **69.5** Versioning and rollout
  - **69.6** MLOps registries serving and drift

#### 70 — AI-Assisted Software Development

- **Target:** Deep mastery (`D`)
- **Seniority signal:** Senior — the fastest-rising hiring signal of 2026; see 70.9 for tool selection
- **Prerequisites:** `10`, `12`, `13`, `40`, `43`, `49`
- **Learning objective:** Use agents effectively while retaining accountability for correctness.
- **Proficiency assessment:** Deliver complex feature with traceable spec tests review and measured outcomes.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/70-.../README.md` when created._
- **Subtopics:**
  - **70.1** Agentic coding workflows
  - **70.2** Repository context and instruction files
  - **70.3** Specification driven implementation
  - **70.4** Delegation and multi-agent coordination
  - **70.5** Test generation and independent verification
  - **70.6** AI-assisted debugging
  - **70.7** Sandboxing permissions and prompt injection defenses
  - **70.8** Productivity quality and rework measurement
  - **70.9** Choosing a coding-agent toolchain (Claude Code, Codex/Copilot, Cursor; agentic CLI vs IDE-embedded assistants; self-hosted models for sensitive codebases) and articulating the tradeoff in an interview
  - **70.10** Claude Code's native tooling (MCP servers, Skills, Hooks, LSP) and single-purpose-chat context hygiene
  - **70.11** Claude Code fundamentals (installation, the Master Loop mental model, memory/settings precedence, permission modes and Plan Mode)
  - **70.12** Advanced Claude Code: composition patterns (Trinity, multi-agent delegation, iterative critique), sandbox/security defaults, and CI/CD hardening

### Product & Collaboration

#### 71 — Requirements & Product Thinking

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `30`
- **Learning objective:** Translate ambiguous customer problems into actionable outcomes.
- **Proficiency assessment:** Write product brief MVP spec and success criteria.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/71-.../README.md` when created._
- **Subtopics:**
  - **71.1** Discovery and problem statements
  - **71.2** User journeys and jobs to be done
  - **71.3** User stories acceptance criteria
  - **71.4** MVP and scope cuts
  - **71.5** Value hypotheses
  - **71.6** Feasibility and prioritization

#### 72 — Software Project Execution

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `13`, `71`
- **Learning objective:** Plan and guide deliverable increments with explicit risks.
- **Proficiency assessment:** Create roadmap backlog milestone and risk plan.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/72-.../README.md` when created._
- **Subtopics:**
  - **72.1** Agile and Kanban principles
  - **72.2** Estimation and uncertainty
  - **72.3** Dependency mapping
  - **72.4** Milestone and incremental delivery
  - **72.5** Risk registers and mitigation
  - **72.6** Retrospectives and course corrections

#### 73 — Product Analytics & Experimentation

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `06`, `29`, `71`
- **Learning objective:** Measure product outcomes and avoid misleading conclusions.
- **Proficiency assessment:** Design an event schema and controlled experiment plan.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/73-.../README.md` when created._
- **Subtopics:**
  - **73.1** Event taxonomy and instrumentation
  - **73.2** Funnels activation and retention
  - **73.3** A/B test setup
  - **73.4** Randomization sample size and bias
  - **73.5** Guardrail metrics
  - **73.6** Measurement-driven iteration

#### 74 — Technical Communication

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `30`, `33`
- **Learning objective:** Explain constraints decisions and tradeoffs to varied audiences.
- **Proficiency assessment:** Present same proposal to engineers and stakeholders.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/74-.../README.md` when created._
- **Subtopics:**
  - **74.1** RFCs ADRs and design documents
  - **74.2** Diagrams and technical writing
  - **74.3** Audience-aware summaries
  - **74.4** Design presentations
  - **74.5** Incident communication
  - **74.6** Decision logs and async alignment

#### 75 — Cross-Functional Engineering

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `71`, `72`, `74`
- **Learning objective:** Build alignment across functions without hiding engineering constraints.
- **Proficiency assessment:** Facilitate prioritization meeting and document decisions.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/75-.../README.md` when created._
- **Subtopics:**
  - **75.1** Product engineering design collaboration
  - **75.2** Requirement negotiation
  - **75.3** Stakeholder mapping
  - **75.4** Conflict handling
  - **75.5** Tradeoff communication
  - **75.6** Customer feedback loops

### Leadership & Strategy

#### 76 — Technical Leadership

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `30`, `33`, `74`, `75`
- **Learning objective:** Lead complex engineering decisions and implementation alignment.
- **Proficiency assessment:** Facilitate design review and publish decision package.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/76-.../README.md` when created._
- **Subtopics:**
  - **76.1** Architecture ownership
  - **76.2** Influencing without authority
  - **76.3** Standards and design reviews
  - **76.4** Cross-team initiatives
  - **76.5** Technical vision and alignment
  - **76.6** Decision making under uncertainty

#### 77 — Mentorship & Team Development

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `13`, `74`
- **Learning objective:** Develop others through actionable feedback and support.
- **Proficiency assessment:** Perform mentoring simulation and follow-up plan.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/77-.../README.md` when created._
- **Subtopics:**
  - **77.1** Coaching and structured feedback
  - **77.2** Pairing teaching and code review
  - **77.3** Delegation and autonomy
  - **77.4** Growth plans
  - **77.5** Interviewing calibration
  - **77.6** Knowledge sharing

#### 78 — Engineering Management Fundamentals

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `72`, `75`, `77`
- **Learning objective:** Understand people management constraints and team effectiveness.
- **Proficiency assessment:** Draft quarterly team plan and hiring onboarding scenario.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/78-.../README.md` when created._
- **Subtopics:**
  - **78.1** Team planning and resource constraints
  - **78.2** Hiring and onboarding
  - **78.3** Performance conversations
  - **78.4** Team health and psychological safety
  - **78.5** Organizational design basics
  - **78.6** Operational cadence and reporting

#### 79 — Engineering Economics

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `30`, `47`, `64`, `71`
- **Learning objective:** Evaluate technical choices against business value and risk.
- **Proficiency assessment:** Build three-year alternative cost and sensitivity model.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/79-.../README.md` when created._
- **Subtopics:**
  - **79.1** Build vs buy
  - **79.2** Total cost of ownership
  - **79.3** Opportunity cost and ROI
  - **79.4** Cloud FinOps
  - **79.5** Cost performance reliability tradeoffs
  - **79.6** Technical investment prioritization

#### 80 — Engineering Strategy

- **Target:** Leadership development (`G`)
- **Seniority signal:** Staff+/EM
- **Prerequisites:** `34`, `71`, `76`, `79`
- **Learning objective:** Align technical direction with long range business outcomes.
- **Proficiency assessment:** Present 12-month roadmap with tradeoffs milestones and metrics.
- **Status:** `not-started`
- **Evidence:** _Add link when available._
- **Content:** _Add link to `curriculum/modules/80-.../README.md` when created._
- **Subtopics:**
  - **80.1** Technical roadmaps
  - **80.2** Platform and infrastructure investments
  - **80.3** Technology selection and governance
  - **80.4** Technical debt portfolio
  - **80.5** Migration and organization strategy
  - **80.6** Outcome metrics and executive narrative

## Prerequisite-aware learning roadmap

The following is a recommended first-pass sequence rather than a promise of complete mastery. Work on leadership and AI-assisted coding across phases, not just at the end.

| Phase | Priority modules | Integrative outcome |
|---|---|---|
| 1. Foundation refresh | `01`, `02`, `04`, `05`, `08`, `09`, `10`, `11`, `12` | Practice problem solving and developer tools |
| 2. Application engineering | `14`, `15`, `16`, `17`, `18`, `20`, `21`, `22`, `23`, `25` | Deliver a functional full-stack MVP |
| 3. Quality and architecture | `13`, `28`, `30`, `31`, `32`, `33`, `34`, `40`, `41`, `42`, `43` | Harden design, tests and debugging |
| 4. Distributed and cloud | `24`, `35`, `36`, `37`, `38`, `39`, `44`, `45`, `46`, `47`, `48`, `49`, `50` | Deploy and exercise resilience |
| 5. Production engineering | `53`, `54`, `55`, `56`, `57`, `58`, `59`, `60`, `62`, `63`, `64`, `65` | Measure performance, incidents, and security |
| 6. AI applications and workflow | `66`, `67`, `68`, `69`, `70` | Add grounded AI functionality and verified agent workflows |
| 7. Architectural breadth | `03`, `06`, `07`, `19`, `26`, `27`, `29`, `51`, `61` | Review specialist designs and missing fundamentals |
| 8. Leadership capstone | `52`, `71`, `72`, `73`, `74`, `75`, `76`, `77`, `78`, `79`, `80` | Produce an RFC, roadmap, mentorship and delivery package |

### Integrative capstone: production-grade SaaS system

Build and continuously evolve one full-stack project. Recommended default: **Next.js + React + TypeScript frontend, Flask/Python API, PostgreSQL, Redis/queue, Docker, AWS or equivalent**, OpenTelemetry, and optional RAG/agent features. Avoid introducing infrastructure components solely to demonstrate complexity; document justified choices.

| Milestone | Deliverable | Evidence |
|---|---|---|
| MVP | Accessible UI, API, auth, transactional persistence | Live demonstration, API contract, tests |
| Quality | Unit/integration/E2E tests and clear module boundaries | CI results, review and design notes |
| Async | Jobs, retries, deduplication, recovery | Fault test and idempotency assertions |
| Cloud delivery | Containers, IaC, CI/CD, release strategy | Reproducible deployment and rollback |
| Operations | Logs, metrics, traces, SLO and alarms | Dashboards, incident exercise, postmortem |
| Security | Threat model, least privilege, input/authorization controls | Security test suite and remediation record |
| AI | Grounded retrieval, tool calls, eval datasets | Quality/latency/cost measurements |
| Leadership | RFCs, ADRs, design review, roadmap and cost model | Decision and stakeholder communication packet |

## Learning-unit specification template

Create a new file per leaf learning unit, for example `curriculum/modules/53-observability-fundamentals/lessons/53.3.1-trace-spans.md`:

```yaml
---
id: '53.3.1'
title: 'Trace and span fundamentals'
module_id: '53'
parent_id: '53.3'
tier: D
status: not-started
prerequisites: ['20', '53.1']
focus_minutes: 25
break_minutes: 5
last_reviewed: null
content_version: '0.1.0'
assessment_ids: ['53.3.1-Q1', '53.3.1-LAB1']
---
```

Below the frontmatter, use these sections:

1. **Why this matters** — production scenario and motivation.
2. **Learning objectives** — observable capability, not passive familiarity.
3. **Core explanation** — concepts, diagrams, worked examples, trade-offs.
4. **Practice** — either conceptual questions, a coding task, debugging lab, or design exercise.
5. **Assessment** — hidden/testable criteria where feasible; include edge and failure cases.
6. **Evidence** — repository commit, code link, logs, chart, solution memo or recording.
7. **Common misconceptions** — typical wrong models and counterexamples.
8. **Follow-up and spaced review** — references and suggested review triggers.

**Pomodoro rule:** Theory/explanation units default to 25/5. Implementation labs may use 50/10. If a lesson requires longer, create separate leaf units rather than increasing focus duration indefinitely. Each session should end with a concrete deliverable or checkpoint.

### Assessment patterns by tier

- **D:** Implement + test + diagnose + measure + defend alternative choices.
- **W:** Configure/run + observe + inject common failure + recover + document.
- **L:** Compare alternatives + identify limitations + recommend under constraints.
- **G:** Prepare briefing + facilitate decision or feedback + define follow-up and success metrics.

### Progress record template

```yaml
module_id: '53'
status: practising
started_on: null
verified_on: null
last_reviewed: null
confidence_1_to_5: null
assessment_results: []
evidence_links: []
knowledge_gaps: []
next_actions: []
```

For a website-backed curriculum, progress should eventually be user-specific application data; do not continually rewrite this canonical document when a learner changes status. The module-level `Status` fields are initial editorial placeholders and can be superseded by the application's database.

## Expansion backlog

- [ ] Create a module directory and README for each of the 80 modules.
- [ ] Decompose each module subtopic into precise, dependency-aware leaf units.
- [ ] Assign every unit a 25/5 or 50/10 session scope.
- [ ] Add curated source references, examples, and anti-patterns.
- [ ] Add conceptual and practical assessment banks with answer rubrics.
- [ ] Build assessment harnesses for coding exercises and browser-based tasks.
- [ ] Connect module and lesson IDs to portfolio evidence and capstone milestones.
- [ ] Validate prerequisites as a directed acyclic graph.
- [ ] Establish a regular content review process for changing technologies.
- [ ] Separate editorial curriculum versioning from individual learner progress.

## Reference starting points

- MDN Web Docs: https://developer.mozilla.org/
- OpenTelemetry: https://opentelemetry.io/docs/
- Google SRE books: https://sre.google/books/
- OWASP: https://owasp.org/
- Kubernetes: https://kubernetes.io/docs/
- AWS Well-Architected: https://docs.aws.amazon.com/wellarchitected/
- DORA: https://dora.dev/
- Python documentation: https://docs.python.org/3/
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html

## Changelog

| Date | Version | Change |
|---|---|---|
| 2026-10-15 | 1.0.0 | Established 16 domains, 80 stable module IDs, detailed subtopics, prerequisites, objectives, assessments, roadmap, and living-document conventions. |
| 2026-10-17 | 1.1.0 | Added a **Seniority signal** per module (Core/Senior/Staff+/Staff+/EM), distinct from the proficiency tier, plus a domain-level summary table. Added subtopic 67.7 (local/self-hosted LLM inference) and 70.9 (choosing a coding-agent toolchain: Claude Code, Codex, self-hosted models). Observability & Reliability (domain 11, modules 53–57) reviewed and confirmed already comprehensive — no gap found. |
