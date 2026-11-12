# AGENTS.md — WannaMath (`wanna math`) Agent Handoff & Engineering Guide

Welcome! If you are a new AI agent or developer taking over this repository, **read this file first**. It is designed so you can understand the entire project architecture, design constraints, git workflow, and current development phase within 60 seconds.

---

## 1. Quick Orientation & Archive Links

All project plans, design tokens, and phase-by-phase progress logs are stored in the [`/archive`](./archive) directory:

1. **[`archive/00_MASTER_PLAN.md`](./archive/00_MASTER_PLAN.md)** — Complete architectural plan, multi-page route structure, pedagogical goals for each topic, and the 6-phase roadmap.
2. **[`archive/01_CURRENT_STATUS.md`](./archive/01_CURRENT_STATUS.md)** — **READ THIS FIRST** to see which phase is currently completed, what is in progress, and what the immediate next task is.
3. **[`archive/02_DESIGN_SYSTEM_TOKENS.md`](./archive/02_DESIGN_SYSTEM_TOKENS.md)** — Strict color palette hex codes (from the user's butterfly reference sheet), semantic mathematical color roles, traditional math typography rules, and the **strict no-gradient policy**.
4. **[`archive/03_ADDING_NEW_TOPICS_GUIDE.md`](./archive/03_ADDING_NEW_TOPICS_GUIDE.md)** — Step-by-step guide for adding new math domains (e.g., Linear Algebra, Fluid Dynamics, Vector Calculus) and new topic pages.
5. **[`archive/phase_logs/`](./archive/phase_logs/)** — Detailed completion logs for each completed development phase.

---

## 2. Git & Repository Rules

- **Remote Repository:** `https://github.com/swapnonil2007/WannaMath.git`
- **Branch:** `main`
- **Commit Author & Push Identity (Mandatory):**
  - `user.name`: `swapnonil2007`
  - `user.email`: `swapnonil2007@gmail.com`
  - `credential.https://github.com.username`: `swapnonil2007` (configured so Git Credential Manager selects `swapnonil2007` when pushing to `origin/main`)
- **Workflow:** At the end of every phase (or significant milestone), update `archive/01_CURRENT_STATUS.md`, add a phase log in `archive/phase_logs/`, verify `npm run build` passes with zero errors, and commit & push to `origin/main`.

---

## 3. Non-Negotiable Visual & Pedagogical Rules

1. **No Unnecessary Gradients:**
   - Do **not** use decorative multi-stop color gradients on backgrounds, cards, buttons, or headers.
   - Use flat, solid surfaces (`#1E1F22` dark drafting canvas, `#26282C` elevated panels, `#35383F` crisp `1px` borders in Dark Mode; `#FFFBE4` warm textbook ivory canvas, `#F6F0D0` panels in Light Mode).
2. **Restrained Semantic Color Palette:**
   - Use only the approved hex codes from the user's butterfly palette (documented in `archive/02_DESIGN_SYSTEM_TOKENS.md`).
   - Colors in visualizations must carry **consistent mathematical meaning** (e.g., `#8D9FCE` Periwinkle for $x$ / first variable / outer bound; `#96B898` Sage Green for $y$ / second variable / middle bound; `#029091` Deep Teal for $z$ / third variable / volume interior; `#B95869` Crimson & `#D5658B` Dusty Rose for upper/lower boundary curves; `#D35323` Persimmon for active sweep handles and Jacobian vectors).
   - Never use color alone to convey UI state—always pair color highlights with explicit mathematical symbols ($x, y, z, u, v, J$), labels, or icons.
3. **Traditional & Eye-Comfortable Math Typography:**
   - **Prose / Explanations:** Academic serif (`Newsreader` / `Georgia` fallback).
   - **Equations & Symbols:** `KaTeX` (`KaTeX_Main` Computer Modern serif).
   - **UI Controls & Labels:** `IBM Plex Sans`.
   - **Numerical Readouts:** `JetBrains Mono` with `tabular-nums` so slider changes never cause layout shift.
4. **Multi-Page Modular Architecture:**
   - This is **not** a single landing page. Every mathematical topic lives on its own dedicated route (`/calculus/double-integrals`, `/calculus/triple-integrals`, `/calculus/coordinate-systems`, `/calculus/jacobians`, etc.) registered in `src/registry/curriculum.ts`.
