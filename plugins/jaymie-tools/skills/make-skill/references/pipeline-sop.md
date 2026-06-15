# make-skill 流水线 SOP（详细每步 I/O + handoff 格式）

> 这是 [SKILL.md](../SKILL.md) 的展开。**真要跑某一步时读对应小节。**
> 配套 worked example：`make-skill-lab/run-01-api-test-designer/`（01→04 全套真实产物）。

## 前置：建 lab 目录

```
make-skill-lab/run-NN-<subject>/
├── 01-field-notes.md      # ① 产物
├── 02-research.md         # ② 产物
├── 03-draft/SKILL.md      # ③ 产物（+ references/ 若拆文件）
└── 04-judge.md            # ④ 产物
```

先和用户确认三件事：**目标主题**、**是重锻已有 skill 还是从零造**、**meta 信息**（叫什么名、落哪个 plugin）。
重锻已有 skill 时，被重锻的原版**留在原地不动**，当 ④ 的 ground-truth 基准。

---

## ① deep-in-field（grill-me）

**目标**：从领域专家榨出能写进 SKILL.md 的 **E 类知识**（专家独有、Claude 不自带）：决策树、NEVER、踩坑权衡、edge case。**不是**讨论 plan。

**靶心 = delta**：
- 重锻已有 skill → 逼问"现有 SKILL.md **没覆盖 / 覆盖得不够狠**的判断"+"你写完之后**真用时踩的坑**"。**绝不让专家复述已写的内容。**
- 从零造 → 逼问"你**教过别人 ≥3 次**的那套判断里，哪些是新手永远想不到的"。

**怎么 grill**：用 grill-me，一题一题、每题给推荐答案（你的假设让专家证实/推翻），沿决策树往下走。专家说"没想清楚"时——这正是金矿，当场帮他把判断结晶出来再请他用直觉校验。

**artifact `01-field-notes.md` 格式**：
- 顶部 frontmatter：subject、stage、被重锻原版路径（若有）。
- **【顶层原则】**（若 grill 中浮现一条 through-line，单列——它往往是原版缺的结构性 delta）。
- **N 条判断**，每条：`规则陈述` + `适用判断` + `反例/陷阱` + **`现有 skill 覆盖状态`（❌缺失 / 🟡半截 / ✅已有）**。覆盖状态就是 delta 清单。
- **待挖支线**：grill 没展开但专家确认"真在用"的判断，留给后续迭代。
- **给②的 research brief**：把最需外部锚点的 3~5 个点列成 deep-research 的输入问题。

---

## ② 外部依据（deep-research 主，grok-search/find-docs 补）

**目标**：给①的判断找带引用的工程最佳实践 + 理论锚点。**三个产出，缺一不可**：
1. **verdict**：每条判断标"专家判断与业界**一致** / 业界有**更狠**的说法 / 业界有**反对**意见需再裁"。
2. **术语升级表**：专家的"土话" → 写进 SKILL.md 的 **canonical 术语** + 引用。canonical 命名让 skill-judge 的"知识 delta / 外部锚点"维度加分。
3. **命名黑名单**：deep-research 的对抗式验证会**杀掉**一批"听着权威但无据"的标签（被错误归因的出处/别名）。**这是②最值钱的副产品**——它划出③不能踩的雷区，专治 skill-judge 最恨的"编造出处"。

**输入**：①的 research brief，作为 deep-research 的 args。
**注意**：直接经验型主题，②的价值从"找证据"转成"canonical 命名 + 防编造护栏"，**不要因此跳过②**。

**⚠️ 触发人类仲裁门**：②若报告"**业界对某设计分歧无定论**"（如本属纯设计取舍的边界问题），**不要让③替用户决定**。停下，用 AskUserQuestion 把分歧+各选项摆给用户，把决定回写进 `02-research.md` 再进③。run-01 的 "oracle 声明 WHAT 禁止 HOW" 就是这样定下来的。

**artifact `02-research.md` 格式**：总览 verdict 表 + 逐条详解（命名+引用+对起草的影响）+ "不可乱用的命名"（被杀 claim）+ 给③的"术语升级表 + 需用户拍的分歧"。

---

## ③ 起草（write-a-skill）

**目标**：把 `01` + `02` + 仲裁决定合成 `03-draft/SKILL.md`。

**关键动作**：
- **重组结构**：若①浮现了顶层原则，把 SKILL.md 重组成"**一根锚点 + 它的推论**"，而不是平铺的流程。这通常是相对原版最大的结构性增量。
- **canonical 术语就地加固**：用②的术语升级表，把土话换成 canonical 名号（就地用、靠语境自解释，别堆定义）。
- **遵守命名黑名单**：②杀掉的标签一个都不准引。
- **落地仲裁决定**：把人类仲裁门定下的设计决策写成明确规则。
- **不覆盖原版**：draft 进 `03-draft/`，原版留作基准。
- 守 write-a-skill 自身的 checklist：description 含 WHAT/WHEN/keywords；SKILL.md 尽量精简；引用一层深；具体例子。

**警惕**：别把②的学术引用堆进正文当门面——agent 执行任务不需要知道 Khorikov 是谁。canonical 术语要，长篇 citation 不要（最多文末一行依据脚注，或干脆只留在 02）。

---

## ④ 校验 + 迭代（skill-judge 静态 + SkillsBench 动态 + SkillOpt）

**④a 静态门（skill-judge，对打）**：
- 用 skill-judge 的 8 维 120 分 rubric，**同尺给"重锻版 vs ground-truth 基准"分别打分**，列维度对比、算 Δ。
- **优于基准才算①②③有效**。同时让 skill-judge 自挑刺：重锻版有没有回退点 / 新引入的问题 / 是不是只堆术语没真提升 delta。
- artifact `04-judge.md`：总分对照表 + 逐维对照 + 自挑刺 + SkillOpt 候选改动。

**④b 动态门（SkillsBench）**：
- 静态分量"设计得好不好"，量不了"agent 真用好不好用"。拿 **3~5 个真实任务**让 agent 分别用基准版/重锻版跑，看 ① 产出质量 ② 失败轨迹。
- **静态门过 ≠ 成功**；动态门才是 SkillOpt 闭环的 validation gate。

**SkillOpt 迭代**（`rollout → reflection → bounded edit → validation gate`）：
- 按动态失败轨迹**小步改**（一次一个 bounded edit），改完重过④a/④b，别一把大改丢失归因。
- 真实 edge case 从失败轨迹回填，比凭空想的更值钱。

---

## run-01 沉淀的五条教训（写进流程的由来）

1. grill 已写好的 skill 要瞄 delta、不是复述 → ①的"靶心=delta"。
2. deep-research 最值钱的是命名黑名单（防编造出处）→ ②的三产出之三。
3. ②③ 之间必须有人类仲裁门（研究报"无定论"时停下问）→ 质量门之一。
4. 静态 skill-judge 量不了可用性 → ④拆静态/动态两道门。
5. 直接经验型 skill 第②步仍有价值（价值转向命名+护栏）→ ②的"不要跳过"。
