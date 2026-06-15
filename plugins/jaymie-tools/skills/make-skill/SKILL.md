---
name: make-skill
description: >-
  把"造一个高质量 Agent Skill"从凭感觉手写升级成一条可复现的四步流水线，专门用于**固化专家的隐性判断**：
  ① grill-me 逼出领域判断 → ② deep-research 找带引用的外部锚点 → ③ write-a-skill 起草 → ④ skill-judge 对打 + 动态回归。
  当用户想创建/重锻一个**需要捕获领域专家隐性知识**的 skill、想要可复现的高质量而非随手写、
  或说「造个 skill」「重锻这个 skill」「forge a skill」「skill 流水线」「make-skill」「把我这套判断固化成 skill」时，使用本 skill。
  它**编排**其它 skill、在阶段间留结构化 artifact，**自身不直接实现**——每步路由到对应 skill。
  随手写个小工具型 skill 用 write-a-skill 即可，不必动用本流水线。
---

# make-skill

锻造一个高质量 Agent Skill：按 **① grill-me → ② deep-research → ③ write-a-skill → ④ skill-judge** 路由，阶段间用结构化 artifact 串联、关键处设质量门。**你负责编排和把关，不在本 skill 里直接写目标 skill。**

## 为什么是流水线，而不是单用 write-a-skill

单用 `write-a-skill` 有四个洞，这条链正好各补一个：

| 洞 | 补它的阶段 |
|---|---|
| requirements 太浅（拿不到专家隐性判断） | ① grill-me |
| 无外部依据（术语不 canonical、易编造出处） | ② deep-research |
| 无客观标尺（好坏全凭感觉） | ④ skill-judge（对打基准） |
| 无迭代闭环（写完就完） | ④ SkillsBench + SkillOpt |

所以本流水线**只在"要固化专家隐性知识 / 要可复现高质量"时用**。随手写个查表型小 skill，直接 write-a-skill。

## 流水线（路由，不要自己实现）

在 lab 目录里干活：`make-skill-lab/run-NN-<subject>/`，每步**必须**落一个文件供下一步消费（不落盘=不可断点续传、不可复盘）。

| 阶段 | 调起 | 产物 | 干什么 |
|---|---|---|---|
| ① deep-in-field | `grill-me` | `01-field-notes.md` | 逼出顶层原则 + N 条判断，每条标"现有覆盖状态/delta"，文末附给②的 research brief |
| ② 外部依据 | `deep-research`（主），grok-search/find-docs 补 | `02-research.md` | 逐条 verdict（一致/业界更狠/有反对）+ 术语升级表 + **命名黑名单** + 标出设计分歧 |
| ③ 起草 | `write-a-skill` | `03-draft/SKILL.md` | 把①②合成 SKILL.md，**不覆盖**被重锻的原版（原版留作④的基准） |
| ④ 校验 | `skill-judge` + SkillsBench | `04-judge.md` | 静态对打基准 + 动态真任务回归 + SkillOpt 小步改 |

详细每步 I/O、handoff 格式、artifact 模板：动手跑某一步前**读** [`references/pipeline-sop.md`](references/pipeline-sop.md)。run-01（主题 api-test-designer）是一个完整 worked example，可对照。

## 质量门（最不显然、也最容易被跳过的部分）

- **人类仲裁门（②→③ 之间，MANDATORY）**：第②步若报"**业界对某设计分歧无定论**"，**停下问用户**，把决定写进 artifact 再起草。**绝不让起草者替用户瞎猜**——这是隐性设计决策，不是技术对错。
- **静态门（④a）**：重锻版必须**对打 ground-truth 基准**（被重锻的原版 / 同领域好 skill），用 skill-judge 同尺打分**比出 Δ**，而不是孤立打个分。优于基准才算①②③有效。
- **动态门（④b）**：静态分高 ≠ 真好用。拿 3~5 个真任务让 agent 实际用它，看失败轨迹。**静态门过不等于成功。**

## NEVER

- **NEVER** 在①里让专家"复述"一个已写好的 skill——靶心永远是 **delta**（没捕捉的判断 + 他真踩过的坑），否则 grill 零产出。
- **NEVER** 因为主题是"专家直接经验"就跳过②——它的价值会从"找证据"**转成 canonical 命名 + 防编造护栏**（②的命名黑名单专治 skill-judge 最恨的"编造出处"），不是零。
- **NEVER** 让③引用任何②没确认的权威名号/出处——只用②的术语升级表，**遵守命名黑名单**。
- **NEVER** 把 artifact 只留在对话里——每步落一个文件。
- **NEVER** 用静态 skill-judge 一过就宣布成功——它只量设计分，量不了可用性。

## 收尾（若锻出的 skill 落在本仓库）

新增/改 skill 后**必须 bump** `plugins/<plugin>/.claude-plugin/plugin.json` 的 `version`，否则 Claude Code 不重新同步、新 skill 装不上。然后 commit+push → `/plugin` 更新 marketplace → update 插件 → `/reload-plugins`。
