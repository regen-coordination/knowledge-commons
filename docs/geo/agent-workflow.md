# Agent workflow — Geo operating contract

// Provenance: adapted from geo-explorers/content-management
// Source: agents/AGENT-WORKFLOW.md
// Pinned SHA: 6191c3dd8233e59b85093cef3d1982f728154bc1
// Date: 2026-09-23

**Read this before doing anything.** It is the operating contract for every
agent working on Geo in this repo. It tells you where to work, how to log what
you do, and the rules that keep the graph and the mirrors trustworthy.

If a rule here conflicts with an ad-hoc instruction in a prompt, **ask** — do
not silently pick one.

## 1. Where you work

All work happens inside this repository. Never write outside it.

## 2. The task lifecycle — mandatory

Every piece of work is tracked. **No silent work.**

### Step 1 — Log the task BEFORE you start
Describe what you are about to do, then set status to **In progress**.

### Step 2 — Do the work
Only inside this repo. Follow the hard rules in §5.

### Step 3 — Close the task
When finished, write **what was done** and **where the result can be seen**.

### Step 4 — If you hit a problem
Log it as an issue. Do not bury a problem in a task note.

## 3. Hard rules

1. **Never write to Geo by hand.** Every create/update/delete goes through
   **geo-write** or **geo-mirror**.
2. **Deletion is a red line.** No hand-written delete and no delete loop, ever.
3. **Never submit.** Dry-run, then report. No `--publish`, no `publish` reply on
   the editor's behalf.
4. **Secrets.** You may confirm `.env` exists and which variable names it holds.
   You may never read, print, echo or copy a value.
5. **Freshness beats the pack.** When docs disagree with the live graph or a
   current `SKILL.md`, the live source wins.
6. **Counts carry scope and date.** A number without its population and snapshot
   time is meaningless.

## 4. Upstream references

The Notion teamspace page IDs below are upstream references from
`geo-explorers/content-management` (commit `dec51bd7`, 2026-09-16). They are
recorded as upstream references, not as local operating config:

| Page | ID |
|---|---|
| Agents hub for Geo (access root) | `3d6273e214eb80dfbf64e9b33ad15f2b` |
| Geo work — master project documentation | `3da273e214eb8186891df24275668b5d` |
| QA issue tracker | `02a05f93eb50484a91fa43e19129f28f` |

Mirror databases — claims / topics / tags (upstream references):

| Space | Claims | Topics | Tags | Geo space ID |
|---|---|---|---|---|
| AI | `68b2ab8fce964653b949792c3fea3f63` | `dd2db6e76e29447cb2b204476f62f234` | `9c39b3c1d7884b1584b05761d6ea8c07` | `41e851610e13a19441c4d980f2f2ce6b` |
| World affairs | `c65bcb821a9b4e699d28a6993272f1ef` | `10140cb6e7f0457fb88588c4cbaadb13` | `1d853bcf446d48f6b773a8b23017d6f8` | `89bd89bf28ff8a0963faf92a8c905e20` |
| Relationships | `72b8735409a84f079f066a67df10e9b4` | `689bd03f06a2478497c956b89e2cf4a1` | `33ba9cb12c8f415fa3d939a83ec7f35d` | `224406e0de3c48d78ef12774111b8b2f` |
| US Politics | `ace776e22aa94ca2980042073213fae4` | `23b8b5b1d7b14146bbde5d35ab14e925` | `9062e88c42b8484eaa9ff033d4725c6a` | `4582fbbee28a16589154f7e36f1ee3c5` |
