# CyberTriage AI — Hackathon Product Requirements + Technical Design

> **Hackathon goal:** Build an impressive, technically credible, usable cybersecurity investigation application in approximately one day, with **Gemma as the central AI reasoning/orchestration component**.
>
> **Core principle:** Build a reliable vertical slice first. The demo should make the intelligence visible while keeping dangerous or failure-prone execution deterministic and sandboxed.

---

# 1. Executive Summary

## 1.1 Product

**CyberTriage AI** is an evidence-driven vulnerability investigation platform.

A user submits a CVE ID, security advisory, blog URL, or prepared demonstration scenario. CyberTriage:

1. Ingests and analyzes the vulnerability.
2. Extracts structured vulnerability information.
3. Retrieves relevant cybersecurity knowledge from local ATT&CK/ATLAS datasets.
4. Uses Gemma to construct an attack hypothesis and investigation plan.
5. Executes a **pre-approved, deterministic proof-of-concept experiment** inside an isolated sandbox.
6. Collects terminal, process, network, and artifact evidence.
7. Lets Gemma interpret that evidence.
8. Produces a professional security report.

The key distinction is:

> **The system does not merely ask an LLM whether a vulnerability is exploitable. It performs a controlled experiment and presents evidence supporting the conclusion.**

---

# 2. Hackathon Positioning

## 2.1 One-line pitch

> **CyberTriage AI turns vulnerability intelligence into an evidence-backed security investigation using local Gemma reasoning, cybersecurity RAG, and an isolated attack laboratory.**

## 2.2 Judge-facing story

The demo should communicate:

```text
CVE / Advisory
      |
      v
   Gemma
      |
      +----> Cybersecurity Knowledge
      |
      v
Attack Hypothesis
      |
      v
Controlled Sandbox
      |
      v
Evidence
      |
      v
Gemma Verification
      |
      v
Security Report
```

## 2.3 Why Gemma matters

Gemma is not merely used to generate text.

Gemma should visibly contribute to:

- vulnerability extraction
- knowledge retrieval decisions
- attack hypothesis generation
- tool selection
- experiment planning
- evidence interpretation
- report generation

The application should expose useful model metadata such as:

- model name
- inference runtime
- local/remote status
- number of tool calls
- retrieved knowledge items
- investigation duration

---

# 3. Product Vision

## 3.1 Problem

Security analysts often have to move manually between:

- vulnerability advisories
- CVE information
- ATT&CK
- ATLAS
- exploit documentation
- terminal tools
- sandbox environments
- notes
- reports

The result is fragmented investigation and significant time spent translating unstructured intelligence into reproducible findings.

## 3.2 Vision

Create a single investigation workspace where AI assists the analyst from:

**intelligence → hypothesis → controlled experiment → evidence → explanation**

## 3.3 Target users

Primary:

- security researchers
- penetration testers
- SOC analysts
- vulnerability analysts
- cybersecurity students

Secondary:

- AI security researchers
- developers learning offensive security
- hackathon judges

---

# 4. Product Principles

## Principle 1 — Evidence over assertion

Every major conclusion should be backed by an observable sandbox event or source.

## Principle 2 — Gemma is an agent, not a chatbot

The model should interact with tools and structured application state.

## Principle 3 — Deterministic demo path

The golden-path demonstration must not depend on an LLM successfully inventing a working exploit.

## Principle 4 — Safe by construction

Experiments run only against deliberately configured sandbox targets.

## Principle 5 — Visible technical depth

RAG, ATT&CK/ATLAS mapping, agent actions, sandbox state, evidence, and verification should be visible.

## Principle 6 — One-day simplicity

Prefer boring, reliable components over elaborate infrastructure.

---

# 5. MVP Scope

## 5.1 Must have

- Next.js frontend
- FastAPI backend
- Ollama + Gemma
- WebSocket or SSE streaming
- vulnerability input
- structured vulnerability analysis
- local cybersecurity RAG
- deterministic golden-path sandbox
- evidence collection
- attack graph
- live terminal
- generated report
- investigation timeline
- reset/replay demo

## 5.2 Should have

- multiple prepared scenarios
- ATT&CK + ATLAS mapping
- evidence viewer
- model/runtime status
- confidence score
- report export
- failure/retry state
- hybrid metadata + vector retrieval

## 5.3 Nice to have

- llama.cpp runtime adapter
- second Gemma model
- multiple sandbox environments
- interactive knowledge graph
- PDF generation
- investigation history
- model comparison

## 5.4 Explicitly defer

Do not spend hackathon time on:

- authentication
- Kubernetes
- microservices
- distributed queues
- production deployment
- multi-user collaboration
- arbitrary exploit generation
- unrestricted internet access from the sandbox
- elaborate databases
- complex LangChain/LangGraph abstractions

---

# 6. UX Design

## 6.1 Main application layout

```text
+----------------------------------------------------------------+
| CYBERTRIAGE AI                       GEMMA ● LOCAL              |
+-------------------+--------------------------------------------+
|                   |                                            |
| INVESTIGATION     | VULNERABILITY OVERVIEW                     |
|                   |                                            |
| ● Intake          | CVE-XXXX-XXXX                              |
| ● Analysis        | Critical                                   |
| ● Knowledge      | Product / Version                         |
| ● Attack Plan     |                                            |
| ● Sandbox         | [RCE] [Initial Access] [High Risk]        |
| ● Evidence        |                                            |
| ● Report          |                                            |
|                   |                                            |
+-------------------+--------------------------------------------+
| INVESTIGATION LOG                                              |
| 22:41:04 INGEST    Advisory retrieved                         |
| 22:41:05 ANALYZE   Vulnerability classified                   |
| 22:41:06 RETRIEVE  3 techniques matched                       |
| 22:41:07 PLAN      Attack hypothesis created                  |
| 22:41:08 SANDBOX   Target initialized                         |
| 22:41:11 VERIFY    Expected evidence observed                 |
+----------------------------------------------------------------+
```

## 6.2 Do not expose private chain-of-thought

The UI should not show hidden model reasoning.

Instead, show **action-oriented investigation events**:

```text
ANALYZING
Retrieved vulnerability metadata

RETRIEVING
Searching ATT&CK and ATLAS

PLANNING
Candidate attack path selected

EXECUTING
Sandbox experiment started

OBSERVING
Sandbox produced expected artifact

VERIFYING
Evidence matched expected condition

CONFIRMED
Scenario reproduced
```

---

# 7. Major UI Components

## 7.1 Mission Control

Shows:

- New Investigation
- recent investigations
- scenario status
- severity
- verification state

## 7.2 Investigation Timeline

States:

```text
INTAKE
ANALYZE
RETRIEVE
PLAN
SANDBOX
EXECUTE
VERIFY
REPORT
```

Each state should transition visually.

## 7.3 Vulnerability Card

Display:

- CVE
- product
- affected version
- CVSS
- vulnerability type
- severity
- attack complexity
- required privilege
- execution context

## 7.4 Knowledge Panel

Show retrieved techniques:

```text
ATT&CK
T1190
Exploit Public-Facing Application

ATLAS
<if applicable>

Why retrieved:
semantic relevance + metadata match
```

## 7.5 Attack Graph

Use a visual graph:

```text
[CVE]
  |
  v
[Initial Access]
  |
  v
[Exploit]
  |
  v
[Execution]
  |
  v
[Victim]
  |
  v
[Evidence]
```

Nodes should become active as the investigation progresses.

## 7.6 Terminal

Use xterm.js or a terminal-like component.

Show only sandbox output.

## 7.7 Evidence Panel

Show:

- event ID
- timestamp
- container
- command/action
- stdout/stderr
- exit code
- artifact
- expected/observed state

## 7.8 Report Panel

Sections:

1. Executive Summary
2. Vulnerability
3. Attack Path
4. MITRE Mapping
5. Evidence
6. Reproduction
7. Detection Opportunities
8. Remediation
9. AI Analysis

---

# 8. Technical Architecture

```text
                         Browser
                            |
                            | HTTPS
                            | WebSocket/SSE
                            v
                  +----------------------+
                  |      Next.js         |
                  |                      |
                  | Dashboard            |
                  | Attack Graph         |
                  | Terminal             |
                  | Evidence             |
                  | Report               |
                  +----------+-----------+
                             |
                             v
                  +----------------------+
                  |       FastAPI        |
                  |                      |
                  | Investigation API    |
                  | WebSocket/SSE         |
                  | State Machine        |
                  +----------+-----------+
                             |
             +---------------+----------------+
             |               |                |
             v               v                v
       +-----------+   +-----------+   +-------------+
       |   Gemma   |   |    RAG    |   |  Sandbox    |
       |           |   |           |   |             |
       |  Ollama   |   | FAISS/    |   | Docker      |
       |           |   | SQLite    |   |             |
       +-----------+   +-----------+   +------+------+
                                              |
                                      +-------+-------+
                                      |               |
                                      v               v
                                 Attacker         Victim
                                 Container       Container
                                      |               |
                                      +-------+-------+
                                              |
                                              v
                                      Evidence Collector
                                              |
                                              v
                                       Evidence Store
                                              |
                                              v
                                           Gemma
                                              |
                                              v
                                      Report Generator
```

---

# 9. Technology Choices

| Component | Technology | Reason |
|---|---|---|
| Frontend | Next.js | Fast UI development |
| Styling | TailwindCSS | Rapid visual iteration |
| Components | shadcn/ui | Good defaults |
| Graph | React Flow | Attack-path visualization |
| Terminal | xterm.js | Real terminal feel |
| Code | Monaco | Code viewing |
| Backend | FastAPI | Simple Python API |
| Streaming | WebSocket/SSE | Live investigation |
| LLM runtime | Ollama | Fastest development path |
| LLM | Gemma | Hackathon centerpiece |
| Optional runtime | llama.cpp | Performance/control |
| RAG | FAISS or Chroma | Minimal infrastructure |
| Metadata | SQLite | Simple structured lookup |
| Sandbox | Docker | Ephemeral isolation |
| Reports | Markdown + HTML | Simple and reliable |
| State | Pydantic | Strong contracts |

---

# 10. Ollama vs llama.cpp

## MVP choice

Use **Ollama first**.

Reasons:

- easy installation
- simple API
- model management
- streaming
- structured outputs
- quick iteration

## Architecture requirement

Do not couple application logic directly to Ollama.

Create:

```text
LLMProvider
    |
    +-- OllamaProvider
    |
    +-- LlamaCppProvider
```

The rest of the application should call:

```python
llm.generate(...)
llm.stream(...)
llm.tool_call(...)
```

rather than calling Ollama directly.

## Why this matters

You can begin with:

```text
OLLAMA
```

and later switch to:

```text
LLAMA_CPP
```

without changing the agent.

---

# 11. Agent Architecture

Do not begin with LangChain or LangGraph.

Use a small explicit state machine.

```text
InvestigationState
        |
        v
     Analyze
        |
        v
     Retrieve
        |
        v
       Plan
        |
        v
     Execute
        |
        v
     Observe
        |
        v
     Verify
        |
        v
     Report
```

Example state:

```python
class InvestigationState(BaseModel):
    task_id: str
    input_text: str

    vulnerability: Vulnerability | None
    retrieved_techniques: list[Technique]
    attack_plan: AttackPlan | None

    sandbox_id: str | None
    events: list[EvidenceEvent]

    verification: VerificationResult | None
    report: str | None

    status: InvestigationStatus
```

---

# 12. Tool Interface

Gemma should interact with controlled application tools.

Suggested tools:

```text
analyze_vulnerability()
search_knowledge_base()
get_technique()
inspect_target()
select_demo_scenario()
run_sandbox()
collect_evidence()
verify_finding()
generate_report()
```

For the hackathon, tool calls should be explicit and logged.

Example:

```text
GEMMA
  |
  +-- search_knowledge_base()
  |
  +-- select_demo_scenario()
  |
  +-- run_sandbox()
  |
  +-- collect_evidence()
  |
  +-- verify_finding()
```

---

# 13. RAG Architecture

## 13.1 Source data

Use the local ATT&CK/ATLAS JSON datasets.

Do not blindly flatten every record into a single text string.

Represent each technique structurally:

```python
class Technique(BaseModel):
    id: str | None
    tactic_id: str | None
    tactic_name: str
    name: str
    description: str
    attack_complexity: str | None
    privileges_required: str | None
    execution_context: list[str]
    defenses: list[str]
    detection_opportunities: list[str]
    exploit_primitives: list[str]
    code_patterns: list[str]
    related_tools: list[str]
    is_atlas: bool
```

## 13.2 Hybrid retrieval

Use:

```text
User/Vulnerability Summary
        |
        +---- semantic search
        |
        +---- metadata filters
        |
        +---- optional keyword search
        |
        v
     reranking
        |
        v
Top techniques
```

Useful filters:

- tactic
- execution context
- privilege
- platform
- ATT&CK vs ATLAS
- attack complexity

---

# 14. Evidence Architecture

Evidence is a first-class object.

```python
class EvidenceEvent(BaseModel):
    id: str
    timestamp: datetime
    source: str
    container: str | None

    action: str
    stdout: str
    stderr: str

    exit_code: int | None

    artifact: str | None
    expected: bool | None
```

Verification should compare:

```text
Expected condition
        vs
Observed evidence
        |
        v
VerificationResult
```

Example:

```json
{
  "status": "verified",
  "confidence": 0.97,
  "evidence_ids": ["evt-12", "evt-14"],
  "explanation": "Expected sandbox artifact observed."
}
```

---

# 15. Sandbox Architecture

The sandbox is strictly for deliberately configured demonstration targets.

Requirements:

- dedicated Docker network
- no external internet access
- no host networking
- no privileged containers
- no Docker socket mounted
- dropped Linux capabilities
- no-new-privileges
- CPU limits
- memory limits
- process limits
- disk limits
- execution timeout
- automatic cleanup
- ephemeral containers

Avoid `seccomp:unconfined` unless there is a demonstrated, necessary requirement and the sandbox is separately isolated.

The sandbox should contain:

```text
attacker container
victim container
```

The demo scenario should be deterministic.

---

# 16. Golden Path

The hackathon must have one guaranteed end-to-end path.

Example:

```text
User selects:
"Demo Vulnerability"

        |
        v

Gemma analyzes scenario

        |
        v

RAG returns techniques

        |
        v

Gemma creates investigation plan

        |
        v

Sandbox starts

        |
        v

Pre-approved PoC executes

        |
        v

Evidence captured

        |
        v

Verification succeeds

        |
        v

Attack graph becomes red/verified

        |
        v

Gemma generates report
```

The golden path must work without requiring the model to invent a novel exploit.

---

# 17. API Design

## POST /api/investigations

Create an investigation.

```json
{
  "input": "CVE-XXXX-XXXX"
}
```

Returns:

```json
{
  "task_id": "abc123"
}
```

## GET /api/investigations/{id}

Returns current state.

## WebSocket /ws/{id}

Streams:

```json
{
  "type": "STATUS",
  "stage": "RETRIEVE",
  "message": "Searching ATT&CK and ATLAS"
}
```

Other message types:

```text
STATUS
LOG
KNOWLEDGE
PLAN
CODE
TERMINAL
EVIDENCE
VERIFICATION
REPORT
ERROR
```

---

# 18. Repository Structure

```text
cybertriage/
|
+-- frontend/
|   +-- app/
|   |   +-- page.tsx
|   |   +-- investigations/[id]/page.tsx
|   |
|   +-- components/
|   |   +-- InvestigationTimeline.tsx
|   |   +-- AttackGraph.tsx
|   |   +-- Terminal.tsx
|   |   +-- EvidencePanel.tsx
|   |   +-- VulnerabilityCard.tsx
|   |   +-- KnowledgePanel.tsx
|   |   +-- ReportViewer.tsx
|   |
|   +-- lib/
|       +-- api.ts
|       +-- websocket.ts
|
+-- backend/
|   +-- main.py
|   +-- config.py
|   |
|   +-- api/
|   |   +-- investigations.py
|   |
|   +-- agent/
|   |   +-- state.py
|   |   +-- orchestrator.py
|   |   +-- prompts/
|   |
|   +-- llm/
|   |   +-- base.py
|   |   +-- ollama.py
|   |   +-- llama_cpp.py
|   |
|   +-- rag/
|   |   +-- loader.py
|   |   +-- retriever.py
|   |   +-- models.py
|   |
|   +-- sandbox/
|   |   +-- manager.py
|   |   +-- scenarios/
|   |
|   +-- evidence/
|   |   +-- collector.py
|   |   +-- models.py
|   |
|   +-- reports/
|       +-- generator.py
|
+-- data/
|   +-- atk/
|   +-- atlas/
|
+-- sandbox/
|   +-- docker-compose.yml
|
+-- scripts/
|   +-- seed_demo.py
|   +-- reset_demo.py
|
+-- tests/
|
+-- .env.example
+-- docker-compose.yml
+-- README.md
```

---

# 19. Development Strategy: Vertical Slices

Do not build all backend modules first.

Do not build the complete frontend first.

Build increasingly complete vertical slices.

## Slice 0 — Skeleton

Goal:

```text
Browser → FastAPI → Ollama → Browser
```

Success criterion:

> User enters text and sees Gemma respond.

Nothing else.

---

# 20. Slice 1 — Structured Analysis

Add a Pydantic schema:

```text
Input
 ↓
Gemma
 ↓
Vulnerability JSON
 ↓
Frontend
```

Success criterion:

> Gemma reliably returns valid structured vulnerability data.

Do not add RAG or Docker yet.

---

# 21. Slice 2 — Investigation Timeline

Add:

```text
INTAKE
ANALYZE
COMPLETE
```

Success criterion:

> The UI visibly reflects backend state.

This establishes your event architecture early.

---

# 22. Slice 3 — RAG

Add the local dataset.

Flow:

```text
Vulnerability
 ↓
Retriever
 ↓
Top techniques
 ↓
Frontend
```

Success criterion:

> The user can see why the system retrieved each technique.

---

# 23. Slice 4 — Attack Plan

Add Gemma planning.

```text
Vulnerability
+
Retrieved knowledge
 ↓
Gemma
 ↓
AttackPlan
```

The plan should be structured.

Example:

```json
{
  "objective": "...",
  "techniques": ["..."],
  "steps": [
    "...",
    "...",
    "..."
  ],
  "verification_condition": "..."
}
```

---

# 24. Slice 5 — Sandbox

Do not connect arbitrary generated code yet.

First implement:

```text
API
 ↓
select_demo_scenario()
 ↓
start_sandbox()
 ↓
execute_known_poc()
 ↓
collect_output()
```

Success criterion:

> Clicking "Run Experiment" produces deterministic terminal output.

---

# 25. Slice 6 — Live Terminal

Stream sandbox events.

```text
Docker stdout
      |
      v
FastAPI
      |
 WebSocket
      |
      v
xterm.js
```

Success criterion:

> Judges can watch the experiment happen live.

---

# 26. Slice 7 — Evidence

Turn terminal output into structured evidence.

```text
Terminal
   +
Sandbox metadata
   |
   v
EvidenceEvent
```

Success criterion:

> The application can distinguish raw output from verified evidence.

---

# 27. Slice 8 — Verification

Implement deterministic verification.

```text
Expected artifact
        |
        v
Observed evidence
        |
        v
PASS / FAIL
```

Only after this works should Gemma interpret the result.

---

# 28. Slice 9 — Gemma Evidence Interpretation

Give Gemma:

```text
Vulnerability
+
Attack plan
+
Retrieved knowledge
+
Evidence
```

Ask for structured:

```text
finding
confidence
evidence references
explanation
remediation
```

---

# 29. Slice 10 — Report

Generate the report from structured state.

Do not let Gemma invent application state.

The report generator should receive:

```text
Vulnerability
Knowledge
Plan
Evidence
Verification
```

and render it.

---

# 30. Slice 11 — Attack Graph

Connect the graph to the actual state machine.

Example:

```text
INTAKE       → grey
ANALYZE      → blue
RETRIEVE     → blue
PLAN         → blue
SANDBOX      → blue
VERIFY       → green
COMPROMISED  → red
```

The graph should be driven by backend events rather than independent frontend animation.

---

# 31. Slice 12 — Demo Polish

Only now add:

- animations
- transitions
- icons
- model status
- elapsed timer
- investigation replay
- report export
- error messages
- demo reset

---

# 32. Vibe Coding Workflow

## Rule 1 — Maintain a living specification

Keep these files:

```text
README.md
PRD.md
TECHNICAL_DESIGN.md
TASKS.md
DECISIONS.md
DEMO.md
```

The AI coding assistant should read them before making architectural changes.

---

# 33. TASKS.md

Maintain explicit checkboxes.

```markdown
## P0 — Golden Path

- [ ] Ollama reachable
- [ ] Gemma responds
- [ ] Structured analysis works
- [ ] RAG retrieval works
- [ ] Investigation state machine works
- [ ] Sandbox starts
- [ ] Demo PoC works
- [ ] Evidence captured
- [ ] Verification works
- [ ] Report generated
- [ ] Frontend displays complete investigation

## P1 — UX

- [ ] Attack graph
- [ ] Live terminal
- [ ] Evidence panel
- [ ] Timeline
- [ ] Model status

## P2 — Polish

- [ ] PDF
- [ ] Replay
- [ ] Multiple scenarios
- [ ] llama.cpp adapter
```

---

# 34. The AI Coding Loop

For every coding task:

```text
1. Read specification
2. Inspect current code
3. Identify smallest change
4. Implement
5. Run test
6. Run application
7. Inspect result
8. Update task status
9. Commit
10. Move to next slice
```

Never ask the coding agent:

> "Build the whole application."

Instead ask:

> "Implement Slice 2 only. Do not modify the architecture. First inspect the existing code, then make the smallest changes necessary to add the investigation timeline. Run the existing tests and verify the frontend still starts."

---

# 35. Prompting the Coding Agent

A strong implementation prompt should contain:

```text
CONTEXT
What the project is.

CURRENT STATE
What already works.

TASK
Exactly one feature.

CONSTRAINTS
What must not change.

ACCEPTANCE CRITERIA
Observable behavior.

VALIDATION
Commands/tests to run.

STOP CONDITION
Do not continue into future features.
```

Example:

```text
You are working on CyberTriage AI.

Read:
- PRD.md
- TECHNICAL_DESIGN.md
- TASKS.md

Current state:
- Next.js frontend works
- FastAPI backend works
- Ollama/Gemma works
- /api/health works

Task:
Implement structured vulnerability analysis.

Requirements:
1. Create a Pydantic Vulnerability model.
2. Add an LLM call returning structured JSON.
3. Add POST /api/analyze.
4. Display the result on the frontend.

Do not:
- add Docker
- add RAG
- add LangChain
- refactor unrelated code
- change the frontend architecture

Acceptance:
- valid request returns valid Vulnerability JSON
- invalid model output is handled
- frontend displays CVE, severity, product and vulnerability type

Validation:
- run backend tests
- manually curl the endpoint
- start frontend and verify the result

Stop after this task.
```

---

# 36. Never allow uncontrolled refactoring

A common vibe-coding failure mode:

```text
Task:
Add RAG

AI:
"I'll first refactor the architecture..."
```

Then:

```text
40 files changed
3 dependencies added
existing functionality broken
```

Use:

> **Minimal diff unless architectural change is explicitly requested.**

If a refactor becomes necessary:

1. stop
2. explain why
3. create a separate task
4. implement it independently
5. verify
6. continue

---

# 37. Commit after every working slice

Use commits like:

```text
feat: bootstrap ollama gemma integration
feat: add structured vulnerability analysis
feat: add investigation state machine
feat: add local technique retrieval
feat: add deterministic sandbox scenario
feat: stream sandbox events
feat: add evidence collection
feat: add verification engine
feat: add report generation
feat: add attack graph
style: polish investigation dashboard
```

Never wait until the entire project is finished.

---

# 38. Maintain a Known-Good State

At every stage:

```text
git status
git diff
pytest
npm test
npm run build
```

The rule is:

> **Never start the next major feature with a broken project.**

If something breaks:

```text
STOP
↓
diagnose
↓
fix
↓
test
↓
commit
↓
continue
```

Do not stack five unfinished changes.

---

# 39. Use Feature Flags for Risky Components

Example:

```env
ENABLE_RAG=true
ENABLE_SANDBOX=false
ENABLE_AGENT=false
DEMO_MODE=true
LLM_BACKEND=ollama
```

This gives you fallback modes.

If Docker breaks during the demo:

```env
DEMO_MODE=true
```

The UI can replay a deterministic recorded sandbox trace.

This is not cheating.

It is good demo engineering.

---

# 40. Build a Demo Mode

The application should have:

```text
[ LIVE INVESTIGATION ]
[ DEMO REPLAY ]
```

Demo replay should contain:

```text
recorded Gemma response
recorded RAG results
recorded terminal output
recorded evidence
recorded verification
recorded report
```

If the network, Docker, model or machine fails, the presentation still works.

---

# 41. Deterministic Seed Data

Create:

```text
scripts/seed_demo.py
```

It should create:

- demo vulnerability
- expected RAG results
- sandbox scenario metadata
- expected evidence
- report template

Then:

```bash
python scripts/seed_demo.py
```

should restore a known-good demo.

---

# 42. Testing Strategy

You do not need extensive coverage.

Focus on critical contracts.

## Unit tests

Test:

- Pydantic schemas
- RAG retrieval
- verification
- state transitions
- report generation

## Integration tests

Test:

```text
FastAPI
 ↓
Ollama
 ↓
structured result
```

and:

```text
FastAPI
 ↓
sandbox
 ↓
evidence
 ↓
verification
```

## Golden-path test

One test should validate:

```text
input
→ analysis
→ retrieval
→ plan
→ sandbox
→ evidence
→ verification
→ report
```

---

# 43. Failure Handling

Every stage needs explicit failure states.

```text
ANALYSIS_FAILED
RAG_FAILED
PLAN_FAILED
SANDBOX_FAILED
TIMEOUT
VERIFICATION_FAILED
REPORT_FAILED
```

The UI should never display:

```text
Loading...
```

forever.

Show:

```text
FAILED
Reason
Retry
Fallback
```

---

# 44. Fallback Hierarchy

Design for graceful degradation.

```text
Live Gemma
   |
   v
Gemma fallback model
   |
   v
Recorded demo response

Live sandbox
   |
   v
Recorded sandbox trace

Live RAG
   |
   v
Seeded demo knowledge
```

The judge should always see a coherent experience.

---

# 45. Observability

Log every major event.

```text
task_id
timestamp
stage
tool
duration
success/failure
error
```

Example:

```json
{
  "task_id": "abc",
  "stage": "RAG",
  "duration_ms": 184,
  "success": true
}
```

Display elapsed time:

```text
Investigation completed
1m 42s
```

This creates a strong demo metric.

---

# 46. Performance Priorities

Optimize only after the vertical slice works.

Priority:

```text
Reliability
    >
Latency
    >
Model sophistication
    >
Infrastructure optimization
```

For a hackathon:

> A 30-second reliable demo beats a 5-second system that fails 30% of the time.

---

# 47. Security Requirements

The sandbox must never have access to:

- host filesystem
- Docker socket
- host network
- credentials
- SSH keys
- cloud credentials
- arbitrary secrets

Do not pass environment variables blindly into containers.

Do not allow the user to specify arbitrary host paths.

Do not execute arbitrary generated code on the host.

---

# 48. Evaluation of the Design

## Strengths

### 1. Strong technical narrative

It combines:

- local LLM
- tool use
- RAG
- cybersecurity knowledge
- sandboxing
- evidence collection
- verification
- visualization

This gives judges many dimensions to evaluate.

### 2. Strong Gemma fit

Gemma is directly involved in multiple meaningful application stages.

### 3. Excellent visual demo potential

Attack graph + terminal + evidence + timeline provides a strong live demonstration.

### 4. Good engineering story

The architecture separates:

- model
- orchestration
- knowledge
- sandbox
- evidence
- presentation

### 5. Safer than arbitrary autonomous exploitation

The deterministic golden path limits unexpected behavior.

---

# 49. Design Weaknesses

## Weakness 1 — Too much scope

A complete autonomous pentesting platform is not realistic in one day.

**Mitigation:** build one vertical slice and make additional scenarios optional.

## Weakness 2 — Local model reliability

Gemma may produce inconsistent tool arguments or reasoning.

**Mitigation:** structured outputs, schemas, deterministic tools, retries, and fallback mode.

## Weakness 3 — Sandbox complexity

Docker networking and security can consume hours.

**Mitigation:** build one known scenario before integrating the model.

## Weakness 4 — RAG can become a time sink

Vector databases and embeddings are not the product.

**Mitigation:** start with in-memory structured search. Add embeddings only if necessary.

## Weakness 5 — "AI exploit generation" can dominate the implementation

Generated exploits are inherently unreliable.

**Mitigation:** separate planning intelligence from deterministic experiment execution.

---

# 50. Recommended Hackathon Scope

If time becomes tight, reduce the product to:

```text
               ONE GOLDEN PATH

Input
  ↓
Gemma
  ↓
Structured vulnerability
  ↓
ATT&CK/ATLAS retrieval
  ↓
Attack hypothesis
  ↓
Known sandbox experiment
  ↓
Live terminal
  ↓
Evidence
  ↓
Verification
  ↓
Attack graph
  ↓
Report
```

That is enough.

If that works beautifully, the project is already a strong submission.

---

# 51. Final Definition of Done

The project is considered complete when a judge can:

1. Open the application.
2. See that Gemma is running.
3. Enter/select a vulnerability.
4. Start an investigation.
5. Watch the investigation timeline.
6. See retrieved cybersecurity techniques.
7. See an attack hypothesis.
8. Watch the sandbox execute.
9. Watch terminal output live.
10. See the attack graph update.
11. Inspect structured evidence.
12. See verification succeed.
13. Read the generated report.
14. Understand exactly where Gemma contributed.

The ideal demo should take:

**60–180 seconds.**

---

# 52. Suggested Demo Script

```text
1. "This is CyberTriage AI."

2. "Instead of asking an LLM to tell us whether a vulnerability
   is exploitable, we make it investigate the vulnerability."

3. Submit the demonstration vulnerability.

4. Show Gemma analyzing it.

5. Show ATT&CK/ATLAS retrieval.

6. Show the attack hypothesis.

7. Click Run Experiment.

8. Show the sandbox terminal.

9. Show the attack graph transition.

10. Show evidence appearing.

11. Show verification.

12. Generate the report.

13. Point at the Gemma panel:

   "Gemma performed the analysis, selected knowledge,
    orchestrated the investigation, interpreted the evidence,
    and produced the final report."

14. Finish with:

   "The important part is that the final finding is not
    just generated by AI. It is supported by evidence
    collected from a controlled experiment."
```

---

# 53. Golden Rule for Vibe Coding This Project

The most important rule:

> **Never vibe-code the whole product. Vibe-code one verified vertical slice at a time.**

Your sequence should be:

```text
Skeleton
   ↓
Gemma
   ↓
Structured output
   ↓
UI state
   ↓
RAG
   ↓
Plan
   ↓
Sandbox
   ↓
Streaming
   ↓
Evidence
   ↓
Verification
   ↓
Report
   ↓
Graph
   ↓
Polish
```

At every arrow:

```text
BUILD
 ↓
RUN
 ↓
VERIFY
 ↓
COMMIT
 ↓
DOCUMENT
 ↓
NEXT
```

That process is more important than the choice between Ollama, llama.cpp, FAISS, Chroma, LangChain, or LangGraph.

The winning hackathon architecture is not the architecture with the most components.

It is the architecture where **every component contributes visibly to one reliable, compelling story.**
