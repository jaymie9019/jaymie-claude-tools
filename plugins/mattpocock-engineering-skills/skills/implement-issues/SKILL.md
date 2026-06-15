---
name: implement-issues
description: Autonomously implement all AFK-ready issues for a feature — set a success goal, self-orchestrate parallel/serial execution, implement each issue with the tdd skill, verify each part independently, and report what differed. Use after to-issues has published the breakdown, when the user wants to implement ready-for-agent issues AFK, or asks to "implement all the issues" for a feature.
---

# Implement Issues

Implement every AFK-ready issue belonging to a feature with a single up-front review gate — the user approves the orchestration plan/script once, then the run is unattended — and report what differed from the plan.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-engineering-skills` if not.

This skill is the execution half of the loop that `to-issues` starts: spec → issues → **implementation → verification → deviation report**. The guiding template:

> Set a goal to implement the spec fully, then use a workflow to verify each part of the plan, and prepare a report on what was implemented and if anything differed.

## Process

### 1. Gather the work-list

Identify the target issues from whatever the user gives you — a parent issue, a milestone, a label, or an explicit list. Collect every issue that:

- belongs to the feature, AND
- carries the AFK-ready triage label (canonical role: `ready-for-agent`)

Fetch each issue's full body. The body is the contract: "What to build" describes the slice, "Acceptance criteria" are the behaviors to verify, "Blocked by" declares ordering. Also locate the original plan/spec (usually the parent issue or a referenced PRD) — you need it for final verification.

HITL issues are out of scope: list them in the final report as "not attempted (HITL)", never implement them.

### 2. Set the goal — and the stop conditions

Define the success condition before starting. Make it **dual**: "done" means *either* finished *or* cleanly escalated.

> Every target issue is implemented, its acceptance criteria are verified by an independent reviewer, the full test suite passes, and a deviation report is delivered — OR every remaining issue is blocked on an explicit `needs-info` / escalation that the report records. Stop in either case; never keep retrying a stuck issue.

The "OR … escalated" clause is what lets the run grind on unattended without spinning forever on an impossible issue — escalation is a *success* path, not a failure.

**Inline path (no workflow).** Running as a single Claude, set this with `/goal` so an independent evaluator checks progress after every turn and keeps you working across turns until the condition holds:

```
/goal every ready-for-agent issue for <feature> is implemented + independently verified + tests green + deviation report posted, OR the remaining issues are escalated as needs-info; stop after 30 turns
```

Note the explicit `stop after N turns` cap. Claude Code's goal evaluator **never pauses to ask for help** — when it can't reach the condition it just retries or hits the cap. So the turn cap plus the "OR … escalated" clause ARE your intervention valve: together they force a stop-and-surface instead of an infinite loop. (`/goal clear` cancels at any time.)

**Workflow path (ultracode).** When the orchestration runs as a Workflow (next step), `/goal` does NOT drive it — a workflow is an independent script running outside the turn loop, and the goal evaluator can't see inside it. Encode the same "run until done, bounded retry, then escalate" logic in the script itself (see step 3). Do not try to wrap a workflow in `/goal`; they are separate features.

### 3. Design the orchestration yourself

Do not assume serial, do not assume parallel — **analyze, then decide**:

- Build the dependency graph from the "Blocked by" fields.
- Predict file overlap: for each issue, estimate which modules/files it touches. Issues with overlapping footprints conflict even when not formally blocked.
- Issues that are independent in both senses can run in parallel; everything else runs in dependency order.
- **Size each issue and assign its implementation agent a model by complexity — pass `model` explicitly, never rely on the default.** Only three tiers:
  - **Complex** → `opus` — cross-cutting changes, tricky domain logic, ambiguous design, or a slice touching many layers/modules.
  - **Medium** → `sonnet` — a normal vertical slice with clear acceptance criteria and a bounded footprint. This is the default tier when unsure.
  - **Trivial** → `haiku` — mechanical or near-mechanical work: a config tweak, a one-file edit, a rename, a copy change.

To run this graph concurrently, **call the Workflow tool** and author a script that encodes the dependency graph — do not hedge on "if a workflow tool is available". A skill instructing you to call Workflow is itself a valid opt-in, but the reliable user-facing trigger is the **`ultracode`** keyword in the request (one task) or **`/effort ultracode`** (whole session); if neither is active and no Workflow tool exists at all, fall back to inline sequential execution in dependency order under the step-2 `/goal`. In the script:

- parallel branches MUST use isolated worktrees (`isolation: 'worktree'`), and merge back in dependency order — on a merge conflict, drop that branch back to sequential re-do rather than guessing the merge;
- pass each branch's `agent()` the model tier you assigned above;
- keep looping until the step-2 success condition holds, but **bound the retries**: if an issue fails independent verification twice, stop retrying it, escalate it (`needs-info` + record in the report), and move on. This bounded-retry-then-escalate is where "run until done, intervene when stuck" actually lives — the script, not `/goal`, is what keeps a workflow running unattended without looping forever.

Each issue gets a fresh implementation agent (or a fresh start, when running inline) — don't let one issue's context bleed into the next.

**Review gate — get sign-off before anything runs.** This is the one sanctioned human touchpoint; after it the run is unattended. Before you call the Workflow tool (or, inline, before you start executing), present BOTH of these and wait for explicit approval:

1. **The orchestration plan** — the dependency graph, which issues run in parallel vs serial and why, and the model tier assigned to each issue.
2. **The workflow script itself** (when using Workflow) — the actual `meta` block (its `phases` ARE the plan) plus the script body you are about to run, so the user can see the worktree/merge order and per-branch models before a single agent spawns.

Use AskUserQuestion (or an equivalent prompt) offering **proceed** / **request changes** / **skip review and run**. Do NOT invoke the Workflow tool until the user proceeds; if they request changes, revise and re-present. The Workflow tool's own permission dialog shows only the one-line `description` — it is NOT a substitute for this review.

### 4. Implement each issue with tdd

Each implementation agent follows the **tdd skill** (red-green-refactor, one tracer bullet at a time). State this explicitly when delegating — subagents don't inherit skills silently.

AFK adaptation of tdd's planning step: there is no user to confirm with. The issue body stands in for the user's answers — acceptance criteria are the behaviors to test, "What to build" bounds the interface. Respect the project's domain glossary (`CONTEXT.md`) and ADRs as usual.

**The no-guessing rule.** If the issue cannot answer a question that tdd's planning step needs (ambiguous interface, contradictory criteria, missing decision), do NOT guess:

1. Apply the `needs-info` triage label and comment on the issue stating exactly what is unclear.
2. Skip the issue (and anything blocked by it).
3. Continue with the rest of the work-list.
4. List it in the deviation report.

Delivering 7 of 10 issues plus 3 precise questions beats delivering 10 where 3 are guesses.

### 5. Verify at two layers

**Per issue (immediately after implementation):** a verifier that did NOT write the code checks the implementation against the issue's acceptance criteria and runs the tests. The implementer's claim of "done" is never sufficient. Failures go back to the implementer; an issue is only complete when the independent check passes — but apply the step-2/3 bound: after two failed independent checks, stop retrying, escalate the issue (`needs-info` + record it), and move on rather than looping.

**Whole feature (after all issues):** fan out one verifier per part of the original plan/spec — in parallel if orchestration tooling is available. This layer catches what per-issue checks cannot: seams between slices, criteria that every issue individually satisfies but the assembled feature does not.

### 6. Deliver

Per issue: commit (or PR) per the repo's convention, close the issue with a short summary comment linking the commits. Do NOT close or modify the parent issue.

Then write the deviation report. Its job is to be the user's only required read — lead with deviations, not effort:

<report-template>

## Deviation report: <feature>

### Differed from plan

What was implemented differently than specified, and why. "None" is a valid and ideal answer.

### Skipped

Issues labeled `needs-info` (with the open question), HITL issues not attempted, and anything blocked by them.

### Implemented

One line per issue: identifier, slice, verification result.

### Evidence

Test suite results (command + outcome), and how each verification layer passed.

</report-template>

Post the report where the user can act on it — as a comment on the parent issue, the PR description, or a file in the repo, matching project convention.
