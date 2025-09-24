# Tasks Workspace

Purpose: Structured, implementation-ready breakdowns from the master plan and service plans.

Conventions
- One file per service: `<service>.task-master.md`
- Workflow levels: Epics → Capabilities → User Stories → Tasks/Subtasks
- Task units: 0.5–2 days; include AC (acceptance criteria) and DoD (definition of done)
- Dependency callouts: upstream/downstream services, schema, events
- Estimation: use Fibonacci (1,2,3,5,8) and role owner
- Link back to source doc lines and related issues when available

Sections per file
1) Context & Scope
2) Epics
3) Capabilities
4) User Stories
5) Tasks/Subtasks with AC/DoD
6) Cross-Service Dependencies
7) Milestones & Sequencing
8) Test Plan (unit, integration, e2e)

Importing to GitHub
- Map Epics → Milestones, Capabilities → Labels, Stories/Tasks → Issues.
- Use `labels: service/<name>, type/<kind>, area/<domain>`.
