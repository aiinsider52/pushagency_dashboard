# Remap spec — Test pipeline → REAL Push Agency ClickUp

Read-only audit done on the real account. **Nothing in ClickUp was changed.** This document is the exact mapping to apply to the n8n workflows when going live. No edits are applied yet (n8n MCP was disconnected at authoring time).

## Target (real account)

| What | Value |
|------|-------|
| Workspace / team | `90152356156` (PUSH AGENCY) |
| Space | `901510128258` (Creative Production) |
| Working list | `901521307798` ("List", in folder Creative Production) |
| Members | Anzgela (PM, `170629994`), Daria Patiaka ×2 (designers), Tech Support |

> The old workflows hardcoded team `90152356156` already — they were originally built for THIS account, then retargeted to the test workspace. Going back is partly a revert.

## Status mapping

Real statuses: `backlog, to do, in progress, internal review, client review, on hold, approved, uploading, cancelled, done, Closed`

| Test pipeline status | Real status | Note |
|----------------------|-------------|------|
| backlog | backlog | ✅ |
| to do | to do | ✅ |
| in progress | in progress | ✅ |
| **design done** | **internal review** | ❌ no "design done" — QA gate fires on entering `internal review` |
| internal review | internal review | ✅ |
| client review | client review | ✅ |
| approved | approved | ✅ |
| on hold | on hold | ✅ |
| **delivered** | **done** | ❌ no "delivered" — financial closure fires on `done` (or `uploading`→`done`) |
| Closed | Closed | ✅ |
| — | uploading | ➕ new (publishing stage) — optional notify |
| — | cancelled | ➕ new — optional: stop SLA/alerts |

## Custom field mapping (our name → real field ID)

| Test field | Real field | Real ID |
|------------|-----------|---------|
| Creative Link | 5. Creative Link | `b01cb8dc-ed8c-4999-8ef2-b185b153f37b` |
| Project Link | 6. Project Link | `a27f3397-fda3-4682-aef9-e978c26bb53b` |
| Hold Reason | Hold Reason | `4e85e98a-88c0-43d5-96f4-f99fbf704265` |
| Revision Count | 8. Кількість правок | `5e62a5a1-9984-4493-a5a7-8f3874a35929` |
| Change Type | 7. ПРАВКИ (None/Minor/Major) | `45dcc0d3-42da-4046-80af-86f21f0670bd` |
| Versions Count | Варіації | `fc7e7580-9220-4bc4-84c1-d4d3fbffa0f7` |
| Montage Level | МОНТАЖ: Складний/Середній/Простий/Кастомний (4 number fields) | Складний `3bc3435b…`, Середній `dd6682f8…`, Простий `f716cf78…`, Кастомний `7942c310…`, Середній+ `ae704bf4…`, Простий+ `47792b74…` |
| AI Usage | ВІДЕО: AI Generation | `0e61afef-442b-4646-89ac-c1d6da1a5bc4` |
| (routing) | Project Manager (users) | `351164bf-cc3b-44b3-a236-70f72d825c98` |
| **Client Price** | — none — | ❌ see WF-09 |
| **Delivery Channel** | — none — | ❌ default Telegram, drop field |
| **Client Chat ID** | — none — | ❌ store outside ClickUp |
| **Fibery ID** | — none — (has `Asana Task ID` `e974df96…`) | ❌ see Fibery section |

Extra real fields with no test equivalent (available to use): `Розмір` (9×16/4×5/1×1/16×9), `Вид` (Static/Video/Animation), `1.Resize`+`2.Resize Count`, `3.ASAP`, `4.Translation`, `СТАТИКА: Тип`, `ВІДЕО: Анімація`, `ВІДЕО: Lip Sync`, `9. ПРИЧИНА ПРАВОК`, `Hold Start Date`.

## Per-workflow changes

- **WF-00 Central Log** — no change (writes to Google Sheet).
- **WF-01 Fibery→ClickUp** — retarget list `901521307798`, team `90152356156`. **Fibery ID field missing** → blocked until Fibery section resolved (option: add a `Fibery ID` text field, or reuse `Asana Task ID`).
- **WF-02 Daily Sync** — point ClickUp query at real list. Blocked on Fibery side too.
- **WF-03 Brief Validation** — trigger team `90152356156`; status check `to do`; read real fields. Brief-required fields → redefine against real schema (Розмір, Вид, Варіації, Creative Link…).
- **WF-04 SLA** — list `901521307798`; statuses `backlog`/`to do` exist ✅. Just retarget.
- **WF-05 Self-QA Gate** — trigger status → **`internal review`** (was `design done`). Field presence check → `5. Creative Link`, `6. Project Link`, a МОНТАЖ field, `Варіації`. On pass → keep in `internal review` (no separate move needed) or → `client review`.
- **WF-06 Client Delivery** — statuses `client review`/`approved` exist ✅. Links → `5/6. Creative/Project Link`. No Delivery Channel/Client Chat ID fields → send to fixed PM/client chat.
- **WF-07 Revision Tracking** — Revision Count → `8. Кількість правок`; Change Type read from `7. ПРАВКИ`.
- **WF-08 On Hold** — `on hold` exists ✅; Hold Reason → `4e85e98a…`; bonus `Hold Start Date` available for age calc.
- **WF-09 Financial Closure** — trigger `delivered`→ **`done`**. **No Client Price field** → either (a) drop the price line from the Sheet/AI report, or (b) add a `Client Price` number field to the list (this WOULD change ClickUp — needs your OK). Recommend (a) for now: report without price.
- **WF-10 Minor/Major** — unchanged (kept disabled).
- **WF-11 Task Summary** — `taskAssigneeUpdated`, team `90152356156`; brief from real fields; route to assignee/PM (`Project Manager` field).
- **WF-12 Workload** — list query retarget; real members (Anzgela/Daria) will populate naturally.
- **WF-13 Telegram Approval** — moves `client review`→`approved` (both exist ✅); just retarget list/team.

## Credentials needed in n8n

- New ClickUp credential for real account: token `pk_106678510_…` (the test `pk_216…` won't access this workspace).
- All ClickUp HTTP nodes + clickUp nodes → switch to this credential / token.

## Fibery — connected (read-only audit done)

Workspace: `runwayer.fibery.io` (token `ee7f24dc.…`). Space in URL: `Creative_Production_External`.

Two data systems coexist:

**A. `Asana/*`** — migrated from Asana. This is what ClickUp's `Asana Task ID` links to.
- `Asana/Task` status enum: `Backlog, Request, To Do, In progress, Shooting, Ready to Launch, Launched, Done`
- fields: Name, Status, Assignee, Priority, Size, Creo Link, Asana Link, Variations, Project, Due, Completed…

**B. `Clients beta/*`** — newer CRM: Client (Tier, Growth managers, Meta Accounts), Creative pack, Deliverable, Report, Test, Funnel, Roadmap, Task.

### Implications for sync (WF-01 / WF-02)
- The real link key is **`Asana Task ID`** (ClickUp field `e974df96-0bca-42b9-9078-4c79257a57c4`), NOT a "Fibery ID". WF-01 match-by-Fibery-ID must become match-by-Asana-Task-ID.
- **Three different status models** in the chain: Fibery-Asana (`Ready to Launch`…) → ClickUp Creative Production (`uploading`/`done`…) → our test pipeline. A status crosswalk is required, not a 1:1 map.
- **Open decision — source of truth:** Asana/Task (legacy, bulk) vs Clients beta (active CRM). WF-01 must pull from whichever the team actually creates work in. To confirm with the team before wiring.

### Fibery status → ClickUp status (proposed crosswalk, to confirm)
| Fibery-Asana | ClickUp (Creative Production) |
|--------------|------------------------------|
| Backlog / Request | backlog |
| To Do | to do |
| In progress / Shooting | in progress |
| Ready to Launch | internal review / client review |
| Launched | uploading |
| Done | done / Closed |

> Until source-of-truth + crosswalk confirmed, keep WF-01/WF-02 inactive.

## Safety / rollout

- Apply all edits with workflows **inactive** (deploy disabled). Nothing fires on real ClickUp until explicitly activated.
- No test executions against the real list.
- Go live one workflow at a time, starting read/notify-only (WF-04 SLA, WF-12 Workload), then write-WFs after a dry check.
