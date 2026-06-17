# PushDash

Internal control dashboard for the Push Agency automation stack (n8n + ClickUp + Fibery → Telegram).

PM/team view: how much the n8n automation actually ran, the ClickUp production pipeline, team workload, revenue, and a live activity feed.

## Data sources

| Source | What it powers | Env |
|--------|----------------|-----|
| **n8n REST API** | "what & how much the automation did" — runs, success rate, per-workflow, errors | `N8N_BASE_URL`, `N8N_API_KEY` |
| **ClickUp API** | live pipeline: statuses, workload, revenue (Client Price) | `CLICKUP_TOKEN`, `CLICKUP_LIST_ID` |
| **Central Log (Google Sheet)** | business event feed | `SHEET_CSV_URL` |

Without env keys the app runs on **mock data** so you can see the UI immediately.

## Run

```bash
npm install
cp .env.example .env.local   # fill keys (optional — mock works without)
npm run dev                  # http://localhost:3000
```

## Getting the keys

- **n8n API key** — n8n Cloud → Settings → n8n API → Create. Paste into `N8N_API_KEY`.
- **ClickUp token** — already used by the workflows (`pk_...`). Paste into `CLICKUP_TOKEN`.
- **Sheet CSV** — open the Central Log sheet → File → Share → Publish to web → CSV of the log tab → paste link into `SHEET_CSV_URL`.

## Notes

- All keys live server-side (API routes / `lib`), never shipped to the browser.
- Each connector falls back to mock on error, so a broken key degrades gracefully instead of crashing.
- Deploy: Vercel (set the env vars in project settings).
