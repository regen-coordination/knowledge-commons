# Setup — the parts only a human does

// Provenance: adapted from geo-explorers/geo-editor-agent
// Source: SETUP.md
// Pinned SHA: 875549162fc17804c08aa47feec4672ba9f48590
// Date: 2026-09-23

Nothing here is needed for read-only work; skip to `docs/geo/operations.md` if
you only want lookups and reviews.

## 1. Your wallet key — only for publishing to Geo

The actionable skills (`geo-write`, `geo-mirror` Part 2) sign proposals with
your Geo account. They need your private key in `.env`.

1. Go to [geobrowser.io/export-wallet](https://www.geobrowser.io/export-wallet).
2. Click **Copy key** — not the copy button next to the wallet address.
3. Open `.env` in the repository folder with any text editor. Paste the key
   after `GEO_PRIVATE_KEY=`. Save.

**Never paste the key into a chat, on any tool. Your agent must never ask for
it.** If a key ever lands in a chat, export a fresh wallet and replace it.

`.env` is ignored by git and will never be committed. The variable name is
`GEO_PRIVATE_KEY`; older guides that say `PK` are out of date.

## 2. Notion — for mirrors and claim grouping into Notion

Scripts reach Notion as an **internal integration**, which starts with access to
nothing.

1. In Notion: **Settings → Connections → Develop or manage integrations → New
   integration.** Give it a name. Copy the **Internal Integration Secret**.
2. Open `.env`, paste it after `NOTION_TOKEN=`. Save.
3. **Connect the pages the integration may touch.** On each page: **•••** →
   **Connections** → add the integration. Children inherit the connection.

A page you can open in your browser still returns **404** to a script until it
is connected.

## 3. Network — sandboxed hosts only

| Host | What to do |
|---|---|
| **Claude Code** | Nothing. Ready after install. |
| **Claude Desktop / Cowork** | Settings → Capabilities → Code execution and file creation → allow `api-testnet.geobrowser.io` and `api.notion.com`. |
| **Codex** | Add `api-testnet.geobrowser.io` and `api.notion.com` to workspace network allowlist. |

The endpoint is `api-testnet.geobrowser.io`.

## 4. Confirm

```bash
cd .agents/scripts/geo && bun install
```

Read-only work needs nothing else.
