---
name: grok-search
description: >-
  Use this skill whenever you need current, real-time information from the web or X/Twitter that may be beyond your training cutoff — recent events, latest software releases, breaking news, library changelogs, current prices or stats, "what's the latest on …", or any time-sensitive fact you'd otherwise have to guess at. It runs Grok's live web/X search via the `grokx` CLI and returns a concise summary with source links. Prefer this over relying on stale knowledge for anything that could have changed recently.
---

# Grok Search

This skill answers time-sensitive questions by delegating live web/X search to Grok through the `grokx` CLI. Grok runs the searches server-side and returns a summarized answer with citations; you relay that answer (with its sources) to the user.

**Run the search directly — no pre-flight checks.** On an already-configured machine (the common case) install/auth checks are wasted round-trips: `grokx search` itself fails fast with a distinct, recognizable message for every setup problem. Consult Troubleshooting only when a command actually fails.

## Search

```bash
grokx search "<a specific, self-contained query>" [--depth fast|expert|heavy] [--no-x] [--no-web] [--timeout <secs>]
```

If `grokx` isn't on PATH, try `~/.local/bin/grokx`.

Choose `--depth` by how hard the question is — it maps to how much compute Grok spends:

- `fast` — quick lookups (single agent, low reasoning effort).
- `expert` (default) — solid research; the right choice for most questions.
- `heavy` — hard or broad questions where multiple Grok agents collaborate. Slower and more expensive, can run for minutes — reserve it for questions that truly warrant it, and raise your own command/tool timeout so your shell call doesn't time out before `grokx` does.

Both web and X are searched by default. Use `--no-x` or `--no-web` when the user's intent is clearly one or the other. `--timeout <secs>` overrides the per-depth default (60 / 180 / 300).

Write the query to be specific and self-contained (include the entities, timeframe, and what you want) — Grok searches better with a focused question than a vague one.

## Using the output

The command prints a Markdown summary followed by a `## 来源` (Sources) section of URLs. Base your answer on that summary and cite the relevant sources back to the user — for time-sensitive facts, provenance matters and lets them verify. If a search comes back empty or unconvincing, say so plainly rather than backfilling from memory.

## Troubleshooting — only when a command fails

| Failure output | Meaning | Fix |
|---|---|---|
| `command not found: grokx` (and `~/.local/bin/grokx` doesn't exist either) | Not installed | Run the installer from this skill's directory: `GROKX="$(bash scripts/install.sh)"`. Its final stdout line is the path to a usable binary; retry the search with `"$GROKX"`. |
| `error: unrecognized subcommand 'search'` | Installed `grokx` predates the `search` subcommand | Same installer — it's capability-gated and replaces the stale binary with the latest GitHub release in `~/.local/bin` (no sudo). |
| ``Error: not logged in. Run `grokx login` first.`` | One-time OAuth not done | **You cannot log in for the user** — `grokx login` opens a browser only they can authorize. Tell them to run `grokx login` (one-time, ~20s, credential persists), stop rather than retrying in a loop, and continue once they confirm. |
| Installer: unsupported platform / download failed | No prebuilt binary for this target | The installer prints the fallback: `cargo install --git https://github.com/jaymie9019/grokx` (needs the Rust toolchain). |
| Installer notes `~/.local/bin` is not on PATH | PATH gap | Keep using the full `$GROKX` path yourself; tell the user to add `~/.local/bin` to their PATH for manual use. |

An expired access token is **not** a failure mode: `grokx status` may report one, but `search` refreshes it automatically.
