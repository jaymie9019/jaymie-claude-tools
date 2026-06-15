---
artifact: field-notes (领域判断纪要)
pipeline: make-skill
stage: ① deep-in-field (grill-me)
run: run-01
subject_skill: api-test-designer
subject_source: /Users/jaymie/projects/c5-api-integration-test-scaffold-20260603/skills/api-test-designer/SKILL.md
date: 2026-06-14
status: complete
next_stage: ② 外部依据 (deep-research) — brief 见文末
---

# 领域判断纪要 — api-test-designer

> 这是 make-skill pipeline 第 ① 步（grill-me deep-in-field）的产物。
> 目的：把"设计接口集成测试用例"这件事里**专家脑中的隐性判断**逼成可写进 SKILL.md 的 E 类知识（专家独有、Claude 不自带）。
> 靶心是 **delta**：现有 `api-test-designer` SKILL.md **没写 / 写得不够狠**的判断，以及作者真用时踩过的坑。
> 每条都经过 grill 当场与作者直觉对齐确认。

---

## 0. 【顶层原则】业务意图是设计的唯一锚点

设计 case 时所有微观判断，本质上是**同一个东西**——"这条业务意图"——在不同维度上的投影：

| 微观判断 | 实为「业务意图」的哪个投影 |
|---|---|
| 一个场景该不该立 case | 它能否**独立证伪**一条意图 |
| 一个 case 的边界画哪 | 一次触发引发的、属于**同一意图**的全部后果 |
| 反向断言写哪几条 | 意图的**精确否定** |
| 一条断言钉多强 | 恰好能**证伪意图**的最小字段集 |

**为什么这是 delta**：现有 SKILL.md 里"业务意图"只是个反复出现的词，**从没被立成组织全局的那根轴**。重锻版应把它提到顶层，让下面每条规则都显式挂回这根轴——这会让 skill 从"一堆并列的好规则"变成"一条原理 + 它的推论"。

---

## 1. 场景门槛：一个场景配不配立 case

**规则**：一个场景值得单独立一个 case ⟺ **它能独立证伪一条业务意图**。凑不出这样一条独立断言的场景，不配独立 case，归进别的场景。

**作用层**：场景层（Arrange + Act），**不**作用在断言层。

**现有 skill 覆盖**：❌ 缺失。现有 SKILL.md 只说"不要一把塞满""和人对齐这一批先测哪几个"，但**到底凭什么判断一个场景值得立 case，是空的**。

---

## 2. case 边界 / 粒度：拆 case 靠 Arrange/Act，不靠 Assert

**规则**：
> 一个 case = 一个〈前置条件 + 触发动作〉组合 + 它的**完整终态契约**（所有该为真的断言 + 所有反向断言）。

**拆 case 的触发器**：
- 触发输入/请求不同 → 拆（happy / 各错误码 / 各边界，是不同的 **Act**）
- 前置条件不同 → 拆（空库存 vs 有库存，是不同的 **Arrange**）
- 异步终态不同 → 拆（成功 / 失败 / 超时，是真正不同的 **end state**）
- **只是断言多了几条 → 不拆**，堆进同一个 case 的断言区

**反例（陷阱）**：按"能否独立坏掉"拆 case。每条断言都能独立坏，推到尽头就是"一条断言一个 case"，case 数量爆炸、前置重复、请求构造重复，摧毁第 1 条的门槛。
**定位能力**靠 case 内每条断言写清自己的 failure message，**不靠拆 case 换**。

**具体裁定**：「下单成功返回订单号」+「下单成功扣库存」= **一个 case**（同一次下单请求的两条断言）；「库存不足拒单」= **另一个 case**（不同前置 + 不同终态）。

**现有 skill 覆盖**：❌ 缺失。SKILL.md 谈"场景"也谈"断言"，却从没清晰定义过**一个 case 的边界画在哪一层**。

---

## 3. 反向断言：写意图的精确否定

**规则**：一个 case 的反向断言（"不该发生的没发生"）理论上无穷，**只写「与本 case 业务意图相对立」的那几条**（「成功才扣款」的对立面 = 「失败时不该扣款」）。不穷举宇宙、不按代码写路径。

**精化（前置条件）**：这条规则的威力取决于**正向意图陈述得够不够精确**。"扣减库存"四个字，其反面抓不到"误扣了别人的库存"；但若意图精确成"**只**扣减本单库存"，则"没动别人库存"自动成为它的反面。
→ **写反向断言前，先把正向意图说到足够精确，让它的否定能罩住危险的静默损坏。**

**含义**：一个 case 的正向 + 反向断言合起来 = **围绕单一意图的闭合契约**。

**现有 skill 覆盖**：🟡 部分。SKILL.md 提了反向断言的例子（「无新增行」），但**没给"哪几条值得写"的判据**。

---

## 4. 断言强度：恰好能证伪意图的最小字段集

**规则**：一条断言**只钉能证伪本意图所需的最小字段集**，其余不管。

**两头的坑**：
- 太弱（「响应里有 data 字段」）→ 放过 bug。【现有 skill 已警惕这头】
- 太强（把返回体每个字段都钉死）→ 测试脱离业务意图、随源码漂移。【现有 skill **没提**这头】
- 不钉与意图无关、易随版本漂移的表示细节：时间戳、trace id、字段顺序、可选空字段是否出现。

**现有 skill 覆盖**：🟡 半截。只教了"别太弱"（assetId 集合==fixture 的 10 个 ✓ vs 响应有 data ✗），**完全没提"别太强 / 防漂移"这另一头**——明确的 delta。

---

## 5. 头号隐性失败模式：假绿（false green）

**事实**：一份看着好、过了 CR 的 case 文档，下游最常生成出的坏测试是**假绿**——mock/fixture 没真命中（fixture 反序列化失败、mock 未命中走了 fallthrough 到真实下游），测试照样绿，**绿得毫无意义**。最阴，因为没人会去看绿的测试。

**作者亲历**：这是实际最咬人的失败模式（高于"漏副作用"和"系统性漏场景"）。

**现有 skill 覆盖**：🟡 generator skill 已管 fixture 来源纪律与 fallthrough 归因；但 designer 这一层**没有针对假绿的设计指引**——见下条边界裁定。

---

## 6. 分层边界：case 文档 = 纯业务意图，零机制

**裁定（防假绿的责任归属）**：防假绿**整条归下游 generator**，designer 不背。

**边界细节**（grill 中连追两题确认，作者两次选"更彻底地推给下游"）：
- case 文档**零机制**。意图 → 机械断言 → **判别值** → fixture/mock 命中，**这条机制链整条归 generator**。
- designer **绝不**为"可测性"往 case 里掺机制（如刻意挑一个"判别业务值"留 hook）——**那本身就是分层泄漏**。连"判别值"都是 generator 的事。
- designer 对防假绿的**唯一**贡献：把**业务意图说得足够精确**，让下游有足够语义自己去挑判别值、配命中敏感的 fixture。

**为什么是重要 delta**：这条把"分层纪律"从"接口事实别 inline"推进到了一个更尖的边界——**连"为了可测而引入的机制"也算泄漏**。它同时解释了第 0 条为何成立：designer 守在纯意图层，机制全在下游，所以意图才能当唯一锚点。

**现有 skill 覆盖**：🟡 SKILL.md 有分层纪律（接口事实链出去、别写 python 片段），但**没明确"为可测性掺机制也是泄漏"**，也没把假绿的责任边界讲清。

---

## 7. 缓测 / 残余风险的交接：落成可跟踪的 TODO + 补测触发条件

**规则**：把每条"缓测/不测"的场景**落成显式 TODO / 后续场景条目，带「什么条件下必须补测」的触发条件**——确保它可跟踪、不静默消失。

**对比（作者的选择 vs 备选）**：作者选"可跟踪条目 + 触发条件"，**而非**写风险叙事（坏了会怎样+为何敢缓），**也非**只按风险分级排序。偏好一致：具体、可跟踪、机制轻 > 叙事。

**现有 skill 覆盖**：🟡 SKILL.md 说"显式说明缓测及理由""CR 时重点确认被缓测的场景"——**说了要交代，但没给"交代成什么形态才可跟踪"的判据**。

---

## 待挖支线（本轮未展开，留给后续迭代）

grill 收尾时作者确认下面两条"设计时真在用、但本轮没问到"，可作为下一轮 grill 或 SkillOpt 迭代的补充：

- **场景集"够了"的停手判据**：不是单个 case 粒度，而是"整个场景集什么时候算覆盖够了"。（现有 skill 有 `references/scenario-coverage.md` 维度清单，但"何时停"的判断是隐性的。）
- **异步终态该设哪几个**：接口触发异步任务时，成功/失败/超时终态哪些必测、怎么判定终态到了。

> 注：作者在第 6 题选"假绿"而非"系统性漏场景"，提示"场景集完整性"不是其当前最痛点——优先级可低于上面 8 条核心。

---

## 给第 ② 步（deep-research）的 brief

第 ② 步要为以下几条**最稀缺、最需外部锚点**的判断找工程最佳实践 + 理论依据（带引用），当 knowledge anchor 喂给第 ③ 步起草：

1. **「一条断言该多强」的业界判据** — 关键词：assertion granularity / over-specification / brittle tests / "test what you mean" / behavior vs implementation assertions（Meszaros《xUnit Test Patterns》的 Assertion Roulette / Fragile Test，Martin Fowler 的 test fragility，contract testing 的 schema-vs-value 之争）。验证第 4 条"最小可证伪字段集"是否有更成熟的命名与边界。
2. **false-green / vacuous test 的系统性定义与防御** — 关键词：vacuous pass、mock not invoked、test that can't fail、mutation testing（用变异测试客观检测"假绿/无效断言"是否成熟实践）。给第 5、6 条找理论靠山。
3. **case/scenario 粒度（一个测试该断言多少）** — 关键词：one assertion per test 之争、single concept per test（Robert C. Martin）、Arrange-Act-Assert、test granularity。验证第 2 条"拆 case 靠 Arrange/Act 不靠 Assert"是否与主流一致或有反对意见。
4. **测试设计里的业务意图 vs 实现细节锚定** — 关键词：testing behavior not implementation、specification by example、Given-When-Then 的意图表达。给第 0 条顶层原则找权威表述。
5. **残余风险/缓测在测试计划中的交接惯例** — 关键词：risk-based testing、test deferral、residual risk sign-off。验证第 7 条的形态选择。

> deep-research 产出：一份**带引用**的依据报告（`02-research.md`），逐条对照上面 5 点，标出"作者判断与业界一致 / 业界有更狠的说法 / 业界有反对意见需作者再裁"。
