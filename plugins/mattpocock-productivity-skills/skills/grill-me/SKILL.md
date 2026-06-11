---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Make sure the questions are not obvious — probe technical implementation, UX, tradeoffs, edge cases, and failure modes, not surface preferences I could have answered without you.

Ask the questions one at a time. If a structured question tool is available (e.g. AskUserQuestion in Claude Code), use it and put your recommended answer first; otherwise ask in plain text.

If a question can be answered by exploring the codebase, explore the codebase instead.

When the interview is complete, write the resolved plan to a spec file — update the spec the user pointed you at, or create one if none exists — so the outcome survives the conversation.
