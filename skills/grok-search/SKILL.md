---
name: grok-search
description: >-
  Use this skill whenever you need current, real-time information from the web or X/Twitter that may be beyond your training cutoff — recent events, latest software releases, breaking news, library changelogs, current prices or stats, "what's the latest on …", or any time-sensitive fact you'd otherwise have to guess at. It runs Grok's live web/X search via the `grokx` CLI and returns a concise summary with source links. The skill self-bootstraps and installs the `grokx` binary on first use, then guides one-time authentication. Prefer this over relying on stale knowledge for anything that could have changed recently.
---

# Grok Search

This skill answers time-sensitive questions by delegating live web/X search to Grok through the `grokx` CLI. Grok runs the searches server-side and returns a summarized answer with citations; you relay that answer (with its sources) to the user. Work through the three steps below — they're ordered so the tool is guaranteed to be present and authenticated before you search.

## Step 1 — Ensure `grokx` is installed and current

Always run the bootstrap script first — it's fast and idempotent. Run it from this skill's directory:

```bash
GROKX="$(bash scripts/install.sh)"
```

The script ensures a `grokx` that supports the `search` subcommand is present: it reuses an existing one only if `grokx search` works, and otherwise downloads the latest prebuilt binary from GitHub Releases into `~/.local/bin/grokx` (no sudo). This matters because a stale `grokx` (installed before `search` existed) would otherwise be used and fail. The script's final stdout line is the path to a usable binary, captured into `$GROKX`.

Use `"$GROKX"` for every command below. On most setups it's just `grokx` on PATH; if it had to be installed to `~/.local/bin` and that dir isn't on PATH, `$GROKX` is the full path so commands still work. (If a later step runs in a separate shell where `$GROKX` is unset, use the path the script printed — commonly `grokx`.) If the installer noted `~/.local/bin` isn't on PATH, tell the user to add it for their own manual use.

If the platform is unsupported or the download fails, the installer prints a `cargo install --git https://github.com/jaymie9019/grokx` fallback (needs the Rust toolchain).

## Step 2 — Ensure the user is authenticated (one-time)

`grokx` uses the user's own xAI Grok subscription via OAuth. Check the login state first:

```bash
"$GROKX" status
```

If it reports "未登录" / "not logged in", **you cannot complete login for the user** — `grokx login` opens a browser for them to authorize, which only they can do. Surface this instruction clearly and stop, rather than retrying in a loop. Tell the user to run (using the path from Step 1 if `grokx` isn't on their PATH yet):

```bash
grokx login   # one-time; opens a browser, ~20s, credential persists
```

Once they confirm they've logged in, continue. (Auth persists across runs, and the access token auto-refreshes during use, so this is genuinely one-time for most users.)

## Step 3 — Search

```bash
"$GROKX" search "<a specific, self-contained query>" [--depth fast|expert|heavy] [--no-x] [--no-web] [--timeout <secs>]
```

Choose `--depth` by how hard the question is — this maps to how much compute Grok spends:

- `fast` — quick lookups (single agent, low reasoning effort).
- `expert` (default) — solid research; the right choice for most questions.
- `heavy` — hard or broad questions where multiple Grok agents collaborate. It's slower and more expensive and can run for minutes, so reserve it for questions that truly warrant it. If you do use it, raise your own command/tool timeout — otherwise your shell call may time out before `grokx` does.

Both web and X are searched by default. Use `--no-x` to skip X/Twitter or `--no-web` to skip the web when the user's intent is clearly one or the other. `--timeout <secs>` overrides the per-depth default (60 / 180 / 300).

Write the query to be specific and self-contained (include the entities, timeframe, and what you want) — Grok searches better with a focused question than a vague one.

## Using the output

The command prints a Markdown summary followed by a `## 来源` (Sources) section of URLs. Base your answer on that summary and cite the relevant sources back to the user — for time-sensitive facts, provenance matters and lets them verify. If a search comes back empty or unconvincing, say so plainly rather than backfilling from memory.
