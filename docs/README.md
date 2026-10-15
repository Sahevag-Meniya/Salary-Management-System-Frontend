# Engineering & Product Documentation Index

Welcome to the comprehensive design, architecture, and product documentation for the **Global Salary Management System (10,000+ Employees)**.

This documentation suite is organized into modular artifacts designed to demonstrate structured problem-solving, architectural decision-making, and high-velocity engineering in an AI-driven environment.

---

## 📚 Documentation Artifacts Directory

| Artifact Document | Summary & Focus Area |
| :--- | :--- |
| **[1. requirements.md (PRD)](../../backend/requirements.md)** | **Product Framing & Scope Definition:**<br>Outlines the business problem, target HR Manager persona, in-scope functional features, and explicit **deliberate scope omissions** with architectural rationale (maintained in backend). |
| **[2. PLANNING_NOTES.md](./PLANNING_NOTES.md)** | **Design & Planning Notes:**<br>Covers the 6 foundational product decisions: currency isolation, HR dashboard KPI answers, top earners & charts, unified filter UX with debouncing, flexible CSV exports, and HRMS-inspired relational schema. |
| **[3. ARCHITECTURE_DIAGRAMS.txt](./ARCHITECTURE_DIAGRAMS.txt)** | **Clean Text Architecture Diagrams:**<br>Minimal, zero-dependency ASCII box-drawing diagrams illustrating 3-tier flow, 10k query pipeline, calculation engine, currency isolation, and 8-table ERD. |
| **[4. PERFORMANCE_CONSIDERATIONS.txt](./PERFORMANCE_CONSIDERATIONS.txt)** | **Scalability & 10,000+ Records Engineering:**<br>Deep dive into MySQL B-Tree indexing strategy (reducing query latency from 240ms to <15ms), safe server-side pagination, and zero-memory-bloat chunked CSV streaming. |
| **[5. TRADE_OFF_EXPLANATIONS.txt](./TRADE_OFF_EXPLANATIONS.txt)** | **Design Trade-Offs & Decision Rationale:**<br>Analysis of Pure JavaScript vs TypeScript, Native `fetch()` client vs Axios, dedicated full-page routes vs cramped overlay modals, and normalized components vs flat spreadsheet columns. |
| **[6. TESTING_STRATEGY.md](./TESTING_STRATEGY.md)** | **Deterministic Test Suite & Coverage:**<br>Documents all 53 automated tests (22 Backend tests via `node:test` + 31 Frontend tests via `vitest`) executing with zero flaky failures. |
| **[7. prompts.txt](./prompts.txt)** | **AI Instructions & Prompts Master Log:**<br>Complete chronological record of all prompts and instructions used during product framing, database design, testing QA, and visual architecture. |

---

## 🎯 Quick Navigation & Verification

* **Root Project Guide:** [`../README.md`](../README.md)
* **Frontend Application Entry:** [`../src/App.jsx`](../src/App.jsx)
* **Backend Application Entry:** [`../../backend/src/server.js`](../../backend/src/server.js)
* **Automated Tests:** Run `npm test` inside `backend/` (22 tests) or `frontend/` (31 tests)
