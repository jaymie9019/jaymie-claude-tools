---
artifact: judge (对照评分报告)
pipeline: make-skill
stage: ④ 校验 (skill-judge 静态)
run: run-01
date: 2026-06-14
status: complete (静态)；动态 SkillsBench 待跑
A_original: /Users/jaymie/projects/c5-api-integration-test-scaffold-20260603/skills/api-test-designer/SKILL.md
B_draft: make-skill-lab/run-01-api-test-designer/03-draft/SKILL.md
---

# 对照评分报告 — api-test-designer：手写原版 vs 流水线重锻版

> 用 skill-judge 的 8 维 120 分 rubric 同尺对打，回答：**make-skill 流水线重锻的版本是否客观优于手写原版。**
> 评分刻意保守、自挑刺——skill-judge 明令"别因看着专业给高分""每段冗余都要扣分"。

## 总分

| | A 手写原版 | B 重锻草稿 | Δ |
|---|---|---|---|
| **总分** | **98 / 120（82%, B）** | **106 / 120（88%, B+）** | **+8** |
| Knowledge Ratio (E:A:R) | ~78:18:4 | ~85:12:3 | E 占比↑ |
| Pattern | Process | Process（anchor-then-rules） | 同型，结构更紧 |

**结论：B 客观优于 A，+8 分，提升集中在 D1/D2/D3/D8（知识 delta、思维框架、反模式、可用性）——即"把原本隐性、散落的专家判断显式化成可执行决策规则"。不是堆术语：术语只在加固既有规则处出现，且都有 02-research 的引用背书。**

## 逐维对照

| 维度 | A | B | 说明 |
|---|---|---|---|
| D1 知识 delta (20) | 16 | **18** | A 的判断隐性散落（"提出候选场景集"靠 agent 自悟）；B 把场景门槛/case 边界/断言强度/反向断言**显式成裁定规则**，并用 Sensitive Equality、Verify One Condition per Test 等 canonical 名锚定。↑ |
| D2 思维框架+流程 (15) | 12 | **14** | A 有"为什么这步重要"+5 步流程；B 多了一根**顶层思维框架**（"所有判断都是业务意图的投影"+映射表），这是 A 完全没有的 mindset 升级。↑ |
| D3 反模式 (15) | 12 | **13** | A 的 NEVER 已不错（别反推结构/别 inline/别硬编码）；B 全保留并加"钉易漂移字段=Sensitive Equality→Fragile Test""最小≠弱断言"。↑ |
| D4 规范·description (15) | 14 | 14 | description 一字未改（原版已含 WHAT/WHEN/keywords/负向边界，本就强）。持平。 |
| D5 渐进披露 (15) | 12 | 12 | references 三件套 + 内嵌加载触发，两版相同；**都缺"Do NOT Load"指引**（共同失分点）。持平。 |
| D6 自由度校准 (15) | 12 | 13 | 测试设计=中低自由度判断任务，两版都校准得当；B 的 oracle 规则把"该声明什么"收得更准。略↑ |
| D7 模式识别 (10) | 8 | 9 | 同为 Process；B 的"锚点→推论"组织让 Process 更典范。略↑ |
| D8 可用性 (15) | 12 | **13** | A 的"梳理场景"较靠 agent 判断；B 用裁定规则 + 具体反例（下单返回号+扣库存=一个case）替换模糊指引，更可立即执行。↑ |

## B 的回退点 / 新引入的问题（自挑刺，非护短）

1. **文末"设计依据"脚注有 token-waste 风险**：那段 citation 对 agent **执行**任务并非必需（agent 不需要知道 Khorikov 是谁就能写 case）。skill-judge 视角它偏 Activation/meta。**保留它的理由**：信号"本规则有外部锚点"、便于人维护时溯源；**但若追求纯 delta，应删，移到 02-research 即可。** → 列为 SkillOpt 候选改动。
2. **长度从 ~105 行涨到 ~115 行**：仍在 Process 模式合理区间，但增量不全是 delta（脚注 + 部分 canonical 解释）。需警惕继续膨胀。
3. **oracle『声明 WHAT 禁止 HOW』是全新规则、未经真任务验证**：可能 ① 表述不够清楚导致 agent 把判别值也当 WHAT 写进去（泄漏），或 ② 过度约束。**这条最需要动态 SkillsBench 验证**，静态评分给不了它真分数。
4. **canonical 术语的"自解释性"假设**：Sensitive Equality 等是就地用、未展开定义。语境里基本能猜，但对完全不熟的 agent 有轻微理解成本。可接受。

## 静态评分的边界（为什么还不能宣布 pipeline 成功）

skill-judge 是**设计分（静态）**——它量"这份 SKILL.md 设计得好不好"，量不了"agent 拿它真去设计 case 时好不好用"。本次 +8 分证明**重锻在设计质量上确有客观提升**，但 handoff 第 3 节的硬要求是 **④ 必须配"任务集 + 验证器"跑动态回归**。所以：

- ✅ **静态门：B > A，pipeline 在"产出更高质量设计"这一点上得到验证。**
- ⏳ **动态门（未跑）**：拿 3~5 个真实接口，让 agent 分别用 A、B 设计 case，看 ① 产出的 case 文档质量 ② 下游 generator 生成的测试是否更少假绿/漂移。这才是 SkillOpt 闭环的 validation gate。

## 给 SkillOpt 迭代的候选改动（下一轮 bounded edit）

1. 决定文末 citation 脚注去留（纯 delta 派→删；可维护性派→留）。
2. 给 references 补一句"Do NOT Load"类指引，吃下 D5 的共同失分。
3. oracle WHAT/HOW 规则配一个**正反各一行的微例**（如 ✓「应扣本单库存」 ✗「断言 resp.stock == fixture.stock-1」），降低被误用风险——但要小心别因此把机制写进正文。
4. 跑动态 SkillsBench 后，按失败轨迹回填真实 edge case。
