---
name: decode-skill
description: Decode and learn any Agent Skill through the skill-judge methodology, producing a visual, self-contained bilingual HTML walkthrough. It quotes the original SKILL.md verbatim, explains it fragment by fragment, and tags each fragment with skill-judge lenses (E/A/R knowledge type + which of the 8 dimensions it serves). Use this whenever the user wants to understand, study, interpret, break down, "解读", "拆解", "看懂", or learn from an existing skill / SKILL.md — whether it's their own, a third-party plugin skill, or one found on GitHub. Trigger even when the user just pastes a SKILL.md and asks "what makes this good?" or "explain this skill", and especially when they want a visual HTML explainer or a bilingual (English↔中文) reading of a non-Chinese skill.
---

# Decode Skill

Turn an existing Agent Skill into a teaching artifact: a beautiful HTML page that quotes the
original, walks through it fragment by fragment, and annotates each piece through the
skill-judge lens — so the user *learns how the skill is built*, not just what it does.

This is a **teaching-first** tool. The fragment-by-fragment reading is its heart — the goal is
**understanding and transferable design intuition**. It *also* closes with a formal skill-judge
score (the 8-dimension / 120 rubric), so the user walks away with both the *why* behind every
move and a quantified verdict in one artifact. The score serves the teaching, never the reverse.

## The mindset

Before decoding, hold this frame: you are showing the user **why each fragment was written the
way it was** — the design decisions hiding in plain sight. A good decode makes the reader say
"oh, *that's* why they phrased it like that." Every annotation should answer two questions:
**what does this fragment do for the agent**, and **what would be lost if it were written
differently or deleted**.

The skill-judge lens (E/A/R + 8 dimensions + 5 patterns + 9 failure modes) is how you make
those design decisions legible. Load it before you analyze.

## Workflow

### Phase 1 — Ingest the target (read the real thing, never guess)

Get the skill's actual content. The user gives you one of three:

- **Local path** → read the `SKILL.md` in full, and list/peek any bundled `references/`,
  `scripts/`, `assets/`. The body's design (D5 progressive disclosure) can't be judged without
  knowing what resources exist.
- **Pasted text** → use it as given.
- **GitHub / web URL** → fetch the raw file (`raw.githubusercontent.com/...` for GitHub).
  If a fetch tool refuses to reproduce the text, clone or curl the raw file instead — you need
  the verbatim source, not a summary.

Detect the source language. If it is **not Chinese**, this decode is **bilingual**: every
original fragment gets a 中文对照 translation. If it is Chinese, skip translation.

Capture a **citable source link** while you have it — this becomes the clickable "原文出处"
in the output. For a local file use `file://` + the absolute path; for GitHub use the `blob`
or raw URL; for pasted text with no source, say so plainly (no link).

### Phase 2 — Load the lens

**MANDATORY — READ ENTIRE FILE**: read [`references/skill-judge-lens.md`](references/skill-judge-lens.md)
completely before analyzing. It holds the formula, the E/A/R definitions, the 8 dimensions, the
5 patterns, the 9 failure modes, and the honesty rules you must apply. Do not work from memory.

### Phase 3 — Bird's-eye pass

Before going fragment by fragment, form the big picture:

- Which of the **5 patterns** does it most resemble? (Mindset / Navigation / Philosophy / Process / Tool)
- Rough **E:A:R ratio** across the whole skill.
- A **one-line verdict** — honest, and aware of what this ruler does and doesn't measure
  (a sharp prompt-skill is allowed to be excellent without deep knowledge delta).

The E:A:R ratio is a judgment call, not a precise count — per-fragment tallies or
token-weighted percentages are both fine; just pick one and be consistent.

### Phase 4 — Segment and annotate

Split the SKILL.md into meaningful fragments **in original order**: the frontmatter is always
its own fragment — it's the highest-leverage piece (D4) — and that fragment includes *all*
frontmatter keys, not just `name` + `description` (e.g. `argument-hint`, `compatibility`, which
are often load-bearing). Then each section or coherent block. For each fragment, produce:

1. **The original, verbatim.** Quote it exactly. This is the anchor of trust — the reader must
   be able to see the real text next to your reading of it.
2. **中文对照** (only if the source isn't Chinese) — a faithful translation, not a paraphrase.
3. **Explanation** — what this fragment does for the agent, and the design decision behind it.
4. **Lens tags** — one E/A/R tag and the dimension(s) it serves, **each with a one-line basis**.
   Where a fragment exemplifies a pattern trait or stumbles into a failure mode, name it.

Give the `description` fragment special attention: check it against WHAT / WHEN / KEYWORDS (D4),
since that single field decides whether the skill ever activates.

### Phase 5 — Score with skill-judge

Now turn the reading into a number. Score each of the **8 dimensions** against the rubric in the
lens file (D1/20, D2/15, D3/15, D4/15, D5/15, D6/15, D7/10, D8/15 — total 120), and give **each
dimension a one-line basis** drawn from the fragments you just annotated. Sum to a total and map
to a grade (A 108+ / B 96+ / C 84+ / D 72+ / F <72).

The score is a *judgment*, not a measurement — anchor every dimension's points to concrete
evidence from the body, and stay honest about this ruler's bias: it weights D1 (knowledge delta)
and D3 (anti-patterns) heavily, so a sharp behavioral/prompt skill can be genuinely excellent and
still land a B or C. **A modest score is not a verdict of "bad."** Say that plainly.

### Phase 6 — Render the HTML

**MANDATORY**: fill the bundled template [`assets/decode-template.html`](assets/decode-template.html).
Do not author HTML/CSS from scratch — the template guarantees a consistent, print-clean,
beautiful result. Your freedom is in the prose and the tags; the layout is fixed.

- Replace every `{{PLACEHOLDER}}`, including `{{SOURCE_HREF}}` (the citable link from Phase 1)
  and `{{SOURCE}}` (a human-readable label). Both the header and the closing 原文出处 block use them.
- Duplicate the `<article class="fragment">` block once per fragment, in order, numbering each
  `id="frag-N"`. The template ships with sample chips (`{{EAR_TAG}}` + `{{DIMENSION_TAG}}`) —
  **set the E/A/R and dimension chips per fragment**; don't leave samples on a fragment they don't fit.
- **Bilingual layout**: the template always shows original ↔ 中文 side by side as two paired
  columns (no display toggle). For a non-Chinese source, fill both `.orig` and `.zh` columns per
  fragment. For a **Chinese source**, delete the `.zh` column in each fragment and add
  `no-bilingual` to the `<body>` class — the right column collapses to a single full-width column.
- **Scoring section**: fill the `D1..D8` scores and each `*_BASIS`, the `{{TOTAL}}` /
  `{{TOTAL_PCT}}` / `{{GRADE}}` / `{{GRADE_LABEL}}`, and each per-dimension `{{D#_PCT}}` (that
  dimension's points ÷ its max, as a percentage, for the bar). Set the `.grade` element's class to
  `grade-a`/`grade-b`/`grade-c`/`grade-d`/`grade-f` to match.
- The left-docked 大纲 outline is **auto-generated** by the template's script (plus a link to the
  scoring section) and opens expanded by default — you don't maintain it by hand. Set a short
  `data-toc="..."` (2–6 chars, e.g. `Frontmatter`, `核心指令`) on each `<article>` for the outline
  label, so long fragment titles don't wrap there; the full title still lives in `.ttl`.
- Fill the closing **带走什么** section: what to imitate, what could be better, and the ruler's
  blind spot for this particular skill.

Save to a sensible path (e.g. alongside the user's work, or `/tmp/decode-<name>.html` if unsure).
If you're running interactively, open it (`open <file>` on macOS) and offer to collect it via the
`collect-html` skill so the user can browse it later. If you're running as a delegated sub-agent,
skip opening and just report the saved path back.

## NEVER do this

These are the landmines that make a decode untrustworthy or useless:

- **NEVER paraphrase inside the 原文 block.** It must be verbatim. The moment the "original" is
  reworded, the reader can no longer trust the page as a faithful reading.
- **NEVER skip 中文对照 for a non-Chinese source.** Bilingual reading is the whole point for
  foreign skills — half the learning is mapping English design language to your own.
- **NEVER assign an E/A/R or dimension tag without a one-line basis.** Tags are judgments, not
  facts. An unjustified "Expert" chip teaches the reader nothing and may mislead.
- **NEVER penalize a skill just for being short.** Brevity is rewarded, not punished — a 43-line
  skill can outperform a 500-line one. Call out conciseness as a strength when it is one.
- **NEVER dump skill-judge theory as a wall of text up front.** The value is *inline* annotation,
  fragment by fragment. Theory without a fragment to attach to is the thing you're teaching
  against.
- **NEVER hide the ruler's bias.** If the skill is a behavioral/prompt skill that scores modestly
  on knowledge delta, say so *and* say that this ruler isn't the only measure of "good." A B or C
  is not a failing grade for this kind of skill.
- **NEVER score a dimension without a one-line basis tied to the actual text.** A bare number is
  not feedback — every D1..D8 score must point to concrete evidence from the fragments.
- **NEVER let the score eat the teaching.** The fragment-by-fragment reading is the point; the
  score is a closing summary, not the headline. Don't lead with the number.

## Why HTML, and why fragment-by-fragment

A flat prose summary teaches the user nothing reusable — they finish knowing *this* skill but no
better at reading the next one. Anchoring every annotation to a verbatim fragment, side by side,
is what builds transferable design intuition: the reader sees the move *and* the text that
produced it. The HTML form makes it scannable, re-readable, and printable — a reference they
return to, not a chat message they scroll past.
