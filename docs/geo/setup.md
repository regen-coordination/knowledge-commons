# Setup — the parts only a human does

// Provenance: adapted from geo-explorers/geo-editor-agent
// Source: SETUP.md
// Pinned SHA: 875549162fc17804c08aa47feec4672ba9f48590
// Date: 2026-09-23

Nothing here is needed for read-only work; skip to `docs/geo/operations.md` if
you only want lookups and reviews.

## 1. Your wallet key — only for publishing to Geo

The publish path (`geo-write`) signs proposals with
your Geo account. It needs your private key in `.env`.

1. Go to [geobrowser.io/export-wallet](https://www.geobrowser.io/export-wallet).
2. Click **Copy key** — not the copy button next to the wallet address.
3. Open `.env` in the repository folder with any text editor. Paste the key
   after `GEO_PRIVATE_KEY=`. Save.

**Never paste the key into a chat, on any tool. Your agent must never ask for
it.** If a key ever lands in a chat, export a fresh wallet and replace it.

`.env` is ignored by git and will never be committed. The variable name is
`GEO_PRIVATE_KEY`; older guides that say `PK` are out of date.

## 2. Network — sandboxed hosts only

| Host | What to do |
|---|---|
| **Claude Code** | Nothing. Ready after install. |
| **Claude Desktop / Cowork** | Settings → Capabilities → Code execution and file creation → allow `api-testnet.geobrowser.io`. |
| **Codex** | Add `api-testnet.geobrowser.io` to workspace network allowlist. |

The endpoint is `api-testnet.geobrowser.io`.

## 3. Confirm

```bash
cd .agents/scripts/geo && bun install
```

Read-only work needs nothing else.
