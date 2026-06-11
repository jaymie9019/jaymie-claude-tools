---
name: implement-issues
description: Autonomously implement all AFK-ready issues for a feature — set a success goal, self-orchestrate parallel/serial execution, implement each issue with the tdd skill, verify each part independently, and report what differed. Use after to-issues has published the breakdown, when the user wants to implement ready-for-agent issues AFK, or asks to "implement all the issues" for a feature.
---

# Implement Issues

Implement every AFK-ready issue belonging to a feature without human intervention, then report what differed from the plan.

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

### 2. Set the goal

Define the success condition before starting:

> Every target issue is implemented, its acceptance criteria are verified by an independent reviewer, the full test suite passes, and a deviation report is delivered.

If a goals feature is available (e.g. `/goal` in Claude Code), set this as the goal so progress is checked by an independent verifier. Otherwise treat it as your standing success condition — keep working until it is met, don't stop at the first obstacle.

### 3. Design the orchestration yourself

Do not assume serial, do not assume parallel — **analyze, then decide**:

- Build the dependency graph from the "Blocked by" fields.
- Predict file overlap: for each issue, estimate which modules/files it touches. Issues with overlapping footprints conflict even when not formally blocked.
- Issues that are independent in both senses can run in parallel; everything else runs in dependency order.

If a workflow orchestration tool is available (e.g. the Workflow tool in Claude Code), author a workflow that encodes this graph — parallel branches MUST use isolated worktrees, and merge back in dependency order. Without such a tool, fall back to sequential execution in dependency order.

Each issue gets a fresh implementation agent (or a fresh start, when running inline) — don't let one issue's context bleed into the next.

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

**Per issue (immediately after implementation):** a verifier that did NOT write the code checks the implementation against the issue's acceptance criteria and runs the tests. The implementer's claim of "done" is never sufficient. Failures go back to the implementer; an issue is only complete when the independent check passes.

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
