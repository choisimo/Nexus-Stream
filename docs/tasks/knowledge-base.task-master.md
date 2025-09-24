# Knowledge Base — Task Master (Parse-PRD)

## 1) Context & Scope
- Source docs: docs/00-master-development-plan.md, docs/01-knowledge-base-service.md
- Goal: Deliver a robust, searchable, and collaborative knowledge base service integrating CRUD, rich editing, tags/categories, versioning, search, and AI-driven recommendations.
- Non-goals: External public portal, CMS-grade theming, advanced workflow automation beyond approvals, multilingual content translation.
- Assumptions: Auth service provides RBAC and user identities; Search service exposes index + query APIs; File store available (S3/MinIO); Analytics event pipeline available; Infra provides CI/CD and observability.

## 2) Epics
- Epic: Core Article CRUD
  - Outcome: Users create, read, update, delete articles with categories and basic metadata.
  - Success Metrics: >70% tasks performed without errors; CRUD p95 < 300ms.
- Epic: Rich Editing & Media
  - Outcome: Markdown-based rich text with media uploads and templates.
  - Success Metrics: Editor error rate < 1%; attachment upload success > 99%.
- Epic: Taxonomy & Tagging
  - Outcome: Category hierarchy and tag system for organization and discovery.
  - Success Metrics: 90% of articles have ≥1 tag; browse filter usage increases session depth.
- Epic: Versioning & Feedback
  - Outcome: Article version history, diffs, restore; comments/feedback.
  - Success Metrics: Version restore works 100%; comment latency < 200ms.
- Epic: Search & Discovery
  - Outcome: Elasticsearch-backed search with facets and suggestions.
  - Success Metrics: Search p95 < 500ms; CTR on suggestions > 10%.
- Epic: AI Relevance & Insights
  - Outcome: Related articles and auto-tagging via AI Insights Engine.
  - Success Metrics: Related click-through > 12%; auto-tag acceptance > 60%.
- Epic: Performance & Reliability
  - Outcome: Caching, A11y, mobile, and resilience.
  - Success Metrics: Page load < 2s; uptime 99.9%.

## 3) Capabilities
- Capability: Article lifecycle
  - Enables: Draft → publish → archive with metadata.
  - KPIs: Time-to-publish, edit frequency.
- Capability: Markdown + embeds
  - Enables: Author rich content with code/diagrams/images.
  - KPIs: Editor engagement, upload success rate.
- Capability: Taxonomy governance
  - Enables: Consistent categories and tag curation.
  - KPIs: Tag coverage, facet breadth.
- Capability: Version control
  - Enables: Diff, rollback, audit trail.
  - KPIs: Restore success, audit completeness.
- Capability: Full-text & facets
  - Enables: Fast, relevant search and navigation.
  - KPIs: Search latency, zero-result rate.
- Capability: AI enrichment
  - Enables: Related content and auto tags.
  - KPIs: Acceptance rate, CTR.

## 4) User Stories
- Story: As an author, I can create and publish an article to share knowledge.
  - AC:
    - [ ] Title, content required; save draft and publish.
    - [ ] Assign category and tags; validate against schema.
    - [ ] Role-based permissions enforced (create/edit own; editors/admins broader).
- Story: As a reader, I can browse and filter articles to find relevant content.
  - AC:
    - [ ] Filter by category, tags, author, status, date.
    - [ ] Pagination and sort by date/popularity.
    - [ ] Mobile responsive layout and accessible navigation.
- Story: As an editor, I can view version history and restore a prior version.
  - AC:
    - [ ] Version entries with author, timestamp, diff summary.
    - [ ] Restore creates a new version; audit logged.
- Story: As a user, I can search with keywords and facets to narrow results.
  - AC:
    - [ ] Query against search index; facets for categories/tags/authors.
    - [ ] Suggestions shown for misspellings; sort by relevance/date/popularity.
- Story: As a team member, I can comment on articles to provide feedback.
  - AC:
    - [ ] Create/edit/delete own comments; mentions and notifications optional.
    - [ ] Moderation tools for editors/admins.

## 5) Tasks & Subtasks
- Task: Define DB schema and migrations (articles, categories, tags, versions, comments)
  - Est: 5
  - Owner: Backend
  - DoD:
    - [ ] SQL migration scripts checked into repo; rollback verified.
    - [ ] ERD documented; indexes for common queries.
  - Subtasks:
    - [ ] Articles table with status, metadata, counts.
    - [ ] Categories hierarchy with parent_id.
    - [ ] Tags and article_tags join.
    - [ ] Versions table capturing diffs or snapshots.
    - [ ] Comments table with moderation flags.

- Task: Implement Article CRUD API (list/detail/create/update/delete)
  - Est: 5
  - Owner: Backend
  - DoD:
    - [ ] OpenAPI spec; validation; pagination and filters.
    - [ ] Unit/integration tests; RBAC checks.
  - Subtasks:
    - [ ] GET /api/articles with filters and pagination.
    - [ ] POST /api/articles with validation and events.
    - [ ] GET /api/articles/:id with related and comments stub.
    - [ ] PUT/PATCH /api/articles/:id with version bump.
    - [ ] DELETE /api/articles/:id with soft-delete.

- Task: Frontend article list/detail pages (Phase 1)
  - Est: 3
  - Owner: Frontend
  - DoD:
    - [ ] React pages with list, filters, pagination.
    - [ ] Detail view with metadata; loading/skeleton; error states.

- Task: Minimal editor (Markdown) integration
  - Est: 3
  - Owner: Frontend
  - DoD:
    - [ ] Draft/publish flow; autosave.
    - [ ] Image placeholder support.

- Task: Category management UI + API
  - Est: 3
  - Owner: Fullstack
  - DoD:
    - [ ] CRUD for categories; color/icon selection.
    - [ ] RBAC enforced; tests.

- Task: Tag system backend + UI chips
  - Est: 3
  - Owner: Fullstack
  - DoD:
    - [ ] CRUD tags; attach/detach to articles.
    - [ ] Facet-ready aggregation.

- Task: Rich editor upgrade (Tiptap/Monaco) with media uploads
  - Est: 5
  - Owner: Frontend
  - DoD:
    - [ ] Toolbar: headings, lists, tables, code, callouts.
    - [ ] Paste/drag media; upload to S3/MinIO; signed URLs.

- Task: File service integration (S3/MinIO)
  - Est: 3
  - Owner: Backend
  - DoD:
    - [ ] Presigned upload/download endpoints; size/type validation.
    - [ ] Virus scan hook optional; lifecycle policy.

- Task: Versioning service (history, diff, restore)
  - Est: 5
  - Owner: Backend
  - DoD:
    - [ ] Store version snapshots; compute diffs.
    - [ ] Restore creates new version; audit logged.

- Task: Comments & feedback API + UI
  - Est: 3
  - Owner: Fullstack
  - DoD:
    - [ ] CRUD comments; mentions; moderation flags.
    - [ ] Real-time updates optional; optimistic UI.

- Task: Search indexing pipeline (CRUD hooks → Elasticsearch)
  - Est: 5
  - Owner: Backend
  - DoD:
    - [ ] Index mapping; analyzers; reindex script.
    - [ ] On create/update/delete, update index; retry + DLQ.

- Task: Search UI with facets and suggestions
  - Est: 5
  - Owner: Frontend
  - DoD:
    - [ ] Query UI with filters; debounce; empty/zero-result states.
    - [ ] Suggestions and sort controls; results highlighting.

- Task: AI related articles + auto-tagging integration
  - Est: 5
  - Owner: Backend
  - DoD:
    - [ ] API contract with AI Insights; batch job + on-demand.
    - [ ] Store relations and proposed tags; review/accept flow.

- Task: Performance and caching
  - Est: 3
  - Owner: Fullstack
  - DoD:
    - [ ] Redis caching for hot queries; CDN headers for assets.
    - [ ] p95 < 2s page load under nominal load.

- Task: Accessibility and mobile optimization
  - Est: 2
  - Owner: Frontend
  - DoD:
    - [ ] WCAG AA for components; keyboard nav; ARIA labels.
    - [ ] Responsive layouts for list/detail/editor.

- Task: Internationalization scaffolding (i18n)
  - Est: 2
  - Owner: Frontend
  - DoD:
    - [ ] i18n library set up; content keys; locale switch.

- Task: Analytics events and dashboards
  - Est: 3
  - Owner: Fullstack
  - DoD:
    - [ ] Emit events: article_view, article_publish, search_query, tag_apply.
    - [ ] Dashboard widgets for key KPIs.

- Task: CI/CD, monitoring, and logging for KB
  - Est: 3
  - Owner: DevOps
  - DoD:
    - [ ] GitHub Actions pipelines; unit/integration test gates.
    - [ ] Structured logs; metrics; alerts on error rates/latency.

## 6) Cross-Service Dependencies
- Depends on: User Management & Auth (RBAC, identities); Search & Discovery (Elasticsearch cluster & APIs); File Storage (S3/MinIO); Analytics & Reporting (event pipeline); AI Insights Engine (related/auto-tag APIs).
- Produces: Events (article_created, updated, deleted, viewed, published); Search index documents; AI enrichment requests.
- Consumes: Auth tokens and roles; Search query APIs; Presigned URLs; Analytics ingestion; AI recommendations.

## 7) Milestones & Sequencing
- M1: CRUD Foundations — DB schema, Article CRUD API, basic list/detail UI, minimal editor, categories. Criteria: Authors can draft/publish; readers browse.
- M2: Taxonomy & Versioning — Tags, version history/restore, comments. Criteria: Governance and collaboration functional.
- M3: Search Integration — Indexing pipeline, search UI with facets/suggestions. Criteria: p95 search < 500ms; zero-result < 10%.
- M4: Rich Media & Files — Tiptap/Monaco rich editor and media uploads with S3/MinIO integration.
- M5: AI Enrichment — Related articles and auto-tagging via AI Insights with review flow.
- M6: Reliability & UX — Performance, caching, a11y, mobile, i18n; analytics instrumentation; monitoring.

## 8) Test Plan
- Unit: API handlers, validators, RBAC guards, editor utilities, tag/category services, versioning utilities.
- Integration: DB migrations; Article CRUD; search indexing hooks; file upload presign; AI enrichment contract tests.
- E2E: Author create→publish flow; Reader browse→filter→search flow; Editor restore version; Comment lifecycle; Media upload; AI tag accept/reject.
