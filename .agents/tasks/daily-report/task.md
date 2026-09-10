---
kind: task
id: daily-report
name: Daily Report
intervalMinutes: 0
enabled: false
runOnStartup: false
profileId: geo-curate
---

# Daily Report — end-of-day editor update (manual)

Drafts and files the editor's **daily update** so they don't write it by hand.
One job: turn *today's Claude Code work (+ a quick top-up for anything done
elsewhere)* into a row in the team's Notion daily-update form, under the editor's
own identity. Manual — the editor runs it at end of day and confirms before it
files. No graph writes.

> Scheduled task settings (`enabled: false`, `intervalMinutes: 0`) are
> intentional: this task is invoked on request ("file my daily report"), not on
> a timer. When run, it executes under the geo-curate profile.

## When to use

End of day, when the editor wants to file their daily update. Triggers: "file my
daily report", "daily update", "log my day", "end-of-day report", "submit my
daily update".

## What it captures vs. tops up

- **Auto (read from sessions):** Claude Code work — the task reads it directly.
- **Top-up (the editor adds):** Cowork, claude.ai chat, ChatGPT, or offline work —
  these aren't readable, so the task asks the editor to add them in one step.
  (About half the team splits Claude + ChatGPT, so this step matters — don't skip it.)

## Procedure

### Step 1 — Gather today's Claude Code sessions
```
python3 scripts/gather_sessions.py
```
(`--date YYYY-MM-DD` for another day.) Prints a clean digest of today's prompts + responses, tool
noise stripped. If it reports no sessions, still run Step 3 (the editor may have worked elsewhere).

### Step 2 — Distill the Geo work
From the digest, write a **consolidated** set of bullet progress statements — *deliverables and
outcomes*, not the mechanics of talking to Claude, and **nothing personal or non-Geo**. Dedupe
across sessions. Also collect: any **links** touched (Geo pages / Notion / PRs) and any **blockers**.

### Step 3 — Top-up (ask the editor)
Show the draft and ask: **"Anything from Cowork, chat, ChatGPT, or offline to add?"** Fold their
additions into the bullets / links / blockers. This is what makes the report complete for split-tool
editors and for work done on surfaces the task can't read.

### Step 4 — Confirm
Show the final draft (the three fields below) and get the editor's OK. It's their report — they
approve before it files.

### Step 5 — File it in Notion
Using the editor's **Notion connector**, create a page in the daily-update data source:
- data source: `collection://257273e2-14eb-8057-8956-000b1157caf1` (DB "᠎:: db daily update responses")
- properties (EXACT names, including the newline and "?"):
  - `Progress summary` = the bullet list (title field)
  - `Do you have any blockers or challenges? \n(optional)` = blockers (omit if none)
  - `Provide links to see the progress when possible (optional)` = links, one per line (omit if none)
  - `Respondent` and `Submission time` are auto-set — do not set them; `Respondent` becomes the
    connected editor (this is why each editor uses their own Notion connection).
- **Idempotency:** check the data source for a row already submitted today by this editor; if one
  exists, update it (or ask) — don't create a duplicate.
Confirm the created/updated page URL.

## Guardrails
- It's the editor's report — **always confirm before filing** (Step 4). Never auto-file.
- **Never invent activity.** Only report what the sessions show + what the editor adds. No activity → don't file.
- **Geo work only** — exclude anything personal or unrelated.

## Files
- `scripts/gather_sessions.py` — clean digest of the day's Claude Code sessions (run it in Step 1; `--help` for flags).

## Notes

- Compatibility: runs in the editor's own Claude Code (reads local session files
  at `~/.claude/projects/`). Requires the editor's Notion connector (writes the
  row under their identity). Python 3 stdlib only.
- Does NOT touch the Geo graph — it only writes the editor's own report row to Notion.
