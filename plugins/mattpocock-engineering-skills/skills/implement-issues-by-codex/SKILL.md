---
name: implement-issues-by-codex
description: Implement all AFK-ready issues for a feature by having Claude orchestrate (work-list, dependency graph, prompt authoring, verification, synthesis) and delegating the actual coding to Codex — one foreground Codex task at a time, with parallelism pushed down into Codex's native subagents (agent teams). Use after to-issues has published the breakdown, when the user wants the issues implemented AFK *by Codex* rather than by Claude itself, or says "implement the issues with codex" / "委派 codex 实现这些 issue". Requires the codex plugin (codex:codex-rescue) and a configured issue tracker.
---

# Implement Issues by Codex

Same goal as the `implement-issues` skill — implement every AFK-ready issue of a feature without human intervention, then report what differed — but the **execution layer is Codex, not Claude**. Claude stays the orchestrator: it builds the work-list, designs the batching, authors each Codex prompt, runs verification, and synthesizes the report. The coding itself is delegated to Codex, and all parallelism lives **inside a single Codex process** via Codex's native subagents (agent teams).

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-engineering-skills` if not. This skill requires the **codex plugin** (the `codex:codex-rescue` subagent); if it is missing or unauthenticated, stop and tell the user to run `/codex:setup`.

This is the Codex-execution variant of the loop `to-issues` starts: spec → issues → **delegated implementation → verification → deviation report**.

## Relationship to `implement-issues`

The first half is identical — work-list, goal, dependency analysis, the two-layer verification idea, and the deviation report. The difference is step 3–5: instead of Claude implementing each slice itself (with the Workflow tool + isolated worktrees), Claude **authors prompts and delegates to Codex one task at a time**, and the fan-out happens inside Codex.

## Iron rules (validated on real runs — do not relax)

These come from hard-won experience delegating Claude→Codex. Each anti-rule has burned a real session.

1. **Parallelism only sinks into a single Codex process.** Codex spawns its own subagents (agent teams) internally. Claude NEVER stacks multiple Codex tasks concurrently — the codex plugin's app-server broker is a shared singleton; concurrent Codex tasks from Claude collide on it and deadlock or fork cold-starting processes.
2. **One Codex task at a time, foreground.** Delegate via the `Agent` tool with `subagent_type: "codex:codex-rescue"`, run in the **foreground** (do not set `run_in_background`). Read its result, then delegate the next batch.
3. **Lock the wording so the forwarder can't mis-route.** `codex:codex-rescue` is a thin forwarder. If the prompt says a vague "spawn two in parallel", it may split the parallelism to the *outer* layer (two Codex tasks → broker collision). Always say explicitly: parallelize *inside this one task only*, never start outer Codex tasks.
4. **Anti-patterns that have each crashed a run:** background + internal-parallel task (double-background → orphaned completion notifications); vague "parallel" wording (forwarder splits outward → broker deadlock); delegating Codex from inside a Claude subagent or a Workflow `parallel()` (Agent nesting + broker contention); and `Skill(codex:rescue)` (command re-entry → session deadlock — use the `Agent` tool, not the Skill).
5. **When a delegation hangs,** the user can run `codex-clean-zombies --dry` to clear pid-dead-but-status-running jobs. Don't silently retry a hung task.

## Process

### 1. Gather the work-list

Identical to `implement-issues`. Collect every issue that belongs to the feature AND carries the AFK-ready triage label (canonical role: `ready-for-agent`). Fetch each issue's full body — "What to build" is the slice, "Acceptance criteria" are the behaviors to verify, "Blocked by" declares ordering. Locate the original plan/spec (parent issue or PRD) for final verification. HITL issues are out of scope — list them in the report as "not attempted (HITL)", never delegate them.

### 2. Set the goal

> Every target issue is implemented by Codex, its acceptance criteria are verified by an independent reviewer, the full test suite passes, and a deviation report is delivered.

If a goals feature is available (e.g. `/goal`), set this so an independent verifier checks progress. Otherwise treat it as your standing success condition.

### 3. Design batches (adaptive granularity)

This is where Claude earns its keep. Do not assume one-issue-per-task or all-in-one — **analyze, then batch**:

- Build the dependency graph from the "Blocked by" fields.
- Predict file overlap: for each issue, estimate which modules/files it touches. Overlapping footprints conflict even without a formal "Blocked by".
- Group the work-list into **batches**. A batch is a set of issues that are independent in BOTH senses (no dependency between them, no file overlap) — these go into **one Codex task** and run in parallel inside Codex. An issue that conflicts with everything, or is large/risky, becomes a batch of one.
- Order the batches by the dependency graph. Batches are delegated **serially** (rule 2); issues *within* a batch run in parallel *inside Codex* (rule 1).
- **Assign each batch an effort tier by complexity.** Codex always runs on a single model — **`gpt-5.5`** (codex-cli's current default model id; no `-codex` suffix) — so complexity is expressed through `--effort`, never by switching models:
  - **Complex** batch → `--effort high` — cross-cutting changes, tricky domain logic, or several non-trivial issues at once. Reserve `xhigh` for genuinely hard, high-risk work.
  - **Medium** batch → `--effort medium` — a normal slice with clear acceptance criteria. Default when unsure.
  - **Trivial** batch → `--effort low` — mechanical edits, config, one-file changes.

State the batching plan to the user before delegating (which issues land in which batch, the order, and each batch's effort tier). One line per batch.

### 4. Author the prompt and delegate (one batch → one Codex task)

For each batch in dependency order, assemble a Codex prompt and delegate it. Prompt Codex like an operator: compact, XML-block structured, state what "done" looks like (see the codex plugin's `gpt-5-4-prompting` conventions). Use this template, filling the issue bodies verbatim from the tracker:

<codex-batch-prompt>
```xml
<task>
You are the single Codex agent assigned this batch. Implement the following issue(s)
for feature "<FEATURE>" in this repository, end to end, using TDD
(red-green-refactor, one tracer bullet at a time).

The issues in this batch are independent — no ordering or file conflicts between them:

<issue id="<ID>">
What to build: <verbatim from issue body>
Acceptance criteria:
- <criterion>
- <criterion>
</issue>
<!-- repeat <issue> per issue in the batch -->
</task>

<parallelism>
Inside THIS single task ONLY, use your native subagents (agent teams) to work the
batch in parallel: spawn one implementer per issue; after each is green, spawn one
reviewer that did NOT write that issue's code to check it against its acceptance
criteria and run the tests. Merge their results yourself and report.
CRITICAL: Do NOT start, spawn, or request any additional OUTER Codex tasks. All
parallelism stays inside this one task.
</parallelism>

<completeness_contract>
Resolve every issue in the batch fully before stopping. Do not stop after planning —
implement, test, and independently review each one.
</completeness_contract>

<verification_loop>
An issue is done only when an independent reviewer subagent confirms its acceptance
criteria pass AND the test suite is green. The implementer's claim of "done" is never
sufficient.
</verification_loop>

<missing_context_gating>
Do not guess. If an issue's interface or criteria are ambiguous, contradictory, or
missing a decision, skip it (and anything it blocks) and report it as "needs-info"
with the exact open question. 3 of 4 implemented plus 1 precise question beats 4 with
a guess.
</missing_context_gating>

<action_safety>
Keep changes scoped to the listed issues. No unrelated refactors or cleanup. Respect
the project glossary (CONTEXT.md) and docs/adr/.
</action_safety>

<structured_output_contract>
Return per issue: id; done | needs-info; files touched; verification result (reviewer
verdict + test outcome); and any deviation from the issue body.
</structured_output_contract>
```
</codex-batch-prompt>

**Delegation mechanics:**

- Call the `Agent` tool with `subagent_type: "codex:codex-rescue"` and the assembled prompt. **Foreground** (no `run_in_background`). Include the runtime flags `--model gpt-5.5 --effort <tier>` in the request — the rescue forwarder treats these as runtime controls and strips them from the task text — where `<tier>` is the effort you assigned this batch in step 3.
- The subagent forwards to a write-capable Codex run by default — that's what we want. Codex's internal subagents inherit the same `gpt-5.5` model, so you set complexity once per batch via `--effort`.
- A batch of one issue uses the same template with a single `<issue>`; Codex then parallelizes by role (explorer/implementer/reviewer) inside the one task instead of by issue.
- After the call returns, parse Codex's structured output. Record each issue as done / needs-info. For `needs-info`, apply the `needs-info` triage label and comment the open question on the issue, then skip anything it blocks.
- Only then delegate the next batch. Never have two batches in flight.

### 5. Verify at two layers

**Per issue (inside the batch):** the reviewer subagent in the Codex prompt already gates each issue against its acceptance criteria — that's the `<verification_loop>` block. Trust it only when Codex's output shows the reviewer ran the tests.

**Whole feature (after all batches, Claude layer):** this catches seams between slices that per-issue checks miss. Either read the assembled diff against the original spec yourself, or delegate ONE final read-only Codex review task using the Root-Cause Review recipe (`<grounding_rules>` + severity-ordered findings) scoped to "does the assembled feature satisfy the original spec". Still one task at a time.

### 6. Deliver

Per issue: commit (or PR) per the repo's convention, close the issue with a short summary comment linking the commits. Do NOT close or modify the parent issue.

Then write the deviation report — lead with deviations, not effort:

<report-template>

## Deviation report: <feature> (via Codex)

### Differed from plan

What Codex implemented differently than specified, and why. "None" is valid and ideal.

### Skipped

Issues labeled `needs-info` (with the open question), HITL issues not attempted, and anything blocked by them.

### Implemented

One line per issue: identifier, slice, which batch, verification result.

### Evidence

Test suite results (command + outcome), how each verification layer passed, and the Codex task per batch.

</report-template>

Post the report where the user can act on it — a comment on the parent issue, the PR description, or a file in the repo, matching project convention.

## Cost note

Codex subagents carry a fixed overhead (even a trivial two-subagent task costs ~70K tokens). Don't force fan-out onto a batch that is genuinely one small issue — a single-issue batch is fine, and Codex will keep the internal team small. Reserve wide internal fan-out for batches that are actually several independent issues.
