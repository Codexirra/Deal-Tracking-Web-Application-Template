 Deal Tracking Web Application

A complete sales deal tracking web application built with **Codexirra**, using a React, Vite, TypeScript frontend, a FastAPI backend, and Postgres-ready persistence.

This template was generated with [Codexirra](https://codexirra.com), an AI development workspace for building real web applications. Codexirra helps you generate, edit, preview, debug, and refine full-stack web apps from simple prompts.

> Want to build your own CRM, dashboard, portal, or SaaS app?  
> Try Codexirra: [https://codexirra.com](https://codexirra.com)

---

## Built with Codexirra

This project is an example of what can be created using Codexirra.

Codexirra can help generate complete web applications with:

- Frontend pages and components
- Backend API routes
- Database-aware app logic
- Clean SaaS-style UI layouts
- Forms, tables, dashboards, filters, and detail pages
- Full project structure
- Editable code and live preview

This deal tracking web application is designed as a practical CRM-style template for managing sales deals, pipeline stages, revenue forecasts, sales notes, and follow-up tasks.

---

## What this app does

This is a complete sales deal tracking web application for managing deals, companies, contacts, deal values, probabilities, close dates, notes, tasks, and pipeline activity.

It uses a modern SaaS sidebar dashboard layout with revenue KPI cards, a weighted forecast summary, a pipeline board, searchable deal tables, editing forms, and deal detail pages.

---

## Tech stack

- React
- Vite
- TypeScript
- Python
- FastAPI
- Postgres

---

## Features

- Modern SaaS sidebar dashboard layout
- Revenue KPI cards and weighted forecast summary
- Pipeline board grouped by sales stage
- Deal table with search, stage filters, owner filters, and edit actions
- Deal creation and editing forms with validation
- Deal detail pages with company, contact, value, probability, and close-date context
- Notes timeline for sales activity
- Tasks with due dates, priority, and completion workflow
- FastAPI backend under `/api/...`
- Postgres schema initialization
- Realistic seeded sample CRM data


## Frontend

Install and run:

```bash
npm install
npm run dev
```

The frontend API helper uses:

- `VITE_API_URL`
- `VITE_API_BASE_URL`
- or same-origin `/api` fallback

The final base is always normalized to end in `/api`.

## Backend

See `/backend/README.md` for Python setup. The backend requires `DATABASE_URL` to point to a Postgres database. On startup, it creates tables and seeds sample CRM records if the database is empty.

## API overview

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/metadata`
- `GET /api/deals`
- `POST /api/deals`
- `GET /api/deals/{deal_id}`
- `PATCH /api/deals/{deal_id}`
- `POST /api/deals/{deal_id}/notes`
- `POST /api/deals/{deal_id}/tasks`
- `PATCH /api/tasks/{task_id}/complete`
