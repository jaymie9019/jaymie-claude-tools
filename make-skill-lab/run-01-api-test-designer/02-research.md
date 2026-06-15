---
artifact: research (外部依据报告 / knowledge anchor)
pipeline: make-skill
stage: ② 外部依据 (deep-research)
run: run-01
subject_skill: api-test-designer
date: 2026-06-14
status: complete
upstream: 01-field-notes.md
next_stage: ③ 起草 (write-a-skill) — 用本报告的 canonical 术语 + 引用加固草稿
research_stats: 5 angles · 26 sources fetched · 111 claims · 25 verified · 19 confirmed / 6 killed · 108 agents
---

# 外部依据报告 — api-test-designer

> make-skill pipeline 第 ② 步产物。把第 ① 步逼出的 8 条判断逐条对照工程权威/学术来源，给每条一个 verdict，并提炼**可直接写进 SKILL.md 的 canonical 术语 + 引用**。
> 每条结论都经 deep-research 的 3 票对抗式验证（2/3 反驳即杀）。被杀的 claim 单列在「不可乱用的命名」一节——它们标出了**容易安错的权威标签**。

---

## 总览：8 条判断 × verdict

| # | 判断（来自 01-field-notes） | verdict | 一句话 |
|---|---|---|---|
| 0 | 业务意图是唯一锚点 | ✅ **一致·有权威命名** | Specification by Example / GWT / behavior-not-implementation 全是它 |
| 1 | 场景门槛=能否独立证伪一条意图 | ✅ 一致（间接） | 对应 Meszaros「Verify One Condition per Test」的 condition 单位 |
| 2 | 拆 case 靠 Arrange/Act 不靠 Assert | ✅ **一致·原作者亲自驳斥教条单断言** | 但"single ACT rule"这个说法本身无据，措辞要收 |
| 3 | 反向断言=意图的精确否定 | 🟡 一致（无直接命名） | 归在意图锚点下，无专门反模式撑 |
| 4 | 断言强度=最小可证伪字段集 | ✅ **业界更狠** | Sensitive Equality（"just plain wrong"）/ Fragile Test / Overspecified Software / resistance to refactoring |
| 5 | 头号隐性失败=假绿 | ✅ **有客观检测器靠山** | mutation testing：survived mutant = 假绿的可度量定义；coverage 测不出 |
| 6 | 防假绿整条归下游，designer 零机制 | 🟠 **有支撑但留分歧** | mutation 归下游成立；但"设计层是否仍需声明 oracle"业界无定论→**需你再裁** |
| 7 | 缓测=带触发条件的可跟踪 TODO | 🟡 **原则一致·具体形态是自创延伸** | RBT 把 residual risk 操作化为显式 exit criterion / coverage gate；TODO 形态无 primary 直接命名 |

---

## 逐条详解

### 判断 0 — 业务意图是唯一锚点　✅ 一致·有权威命名

- **Specification by Example**（Gojko Adzic, Manning 2011, Jolt Award）：用**具体、协作产出的 examples**当共享 artifact，让业务意图的 **WHAT** 而非 **HOW** 成为规格锚点。Adzic：「When people mix up the WHAT and the HOW they create specifications that are difficult to read for business people.」
- **Fowler**（SpecificationByExample）：example 同时充当可执行测试，且「say things twice, once in the code and once in the tests」——重复表述放大查错。
- **BDD 价值次序**（Liz Keogh / Adzic）：「Having conversations is more important than capturing conversations is more important than automating conversations.」——**意图（对话）> 记录 > 自动化**，正是"意图为锚"的权威排序。
- **Given-When-Then** 因「表达力与开发效率的平衡」成为主导格式（survey 71% 主用）。
- **起草影响**：第 ① 步的顶层原则可以直接挂 Specification by Example + behavior-not-implementation 这两个 canonical 名号。SKILL.md 顶部建议用「锚定业务意图（WHAT），把 HOW 留给下游」这种 SBE 措辞。
- 来源：`martinfowler.com/bliki/SpecificationByExample.html`、`gojko.net/books/specification-by-example/`、`gojko.net/2020/03/17/sbe-10-years.html`

### 判断 1 — 场景门槛=能否独立证伪一条意图　✅ 一致（间接）

- 对应 Meszaros《xUnit Test Patterns》原则 **"Verify One Condition per Test"**——测试的拆分单位是 **condition（一个可判定的条件）**，不是 assert 语句数。"一个场景=一条可独立证伪的意图"与"一个测试=一个 condition"同构。
- **起草影响**：可借 "one condition per test" 的措辞把"门槛"讲清；condition ≈ 你说的"可独立证伪的业务意图"。
- 来源：`xunitpatterns.com/Principles of Test Automation.html`

### 判断 2 — 拆 case 靠 Arrange/Act 不靠 Assert　✅ 一致·原作者亲自驳斥教条单断言

- **严格 one-assertion-per-test 学派被两位原作者本人驳回**：
  - Meszaros：「I would not be too dogmatic about insisting on a single assertion.」
  - Uncle Bob（Robert C. Martin）：「The so-called single assert rule simply means that a test should be **a single state transition**. Arrange, act, assert. **Not**: Arrange, act, assert, act, assert.」——单位是**一次状态转移 = 一个 AAA**。
- **实证**（arXiv:2203.12085）：高质量 vs 低质量测试在**断言数量上无显著差异**（3.7 vs 1.6，仅 small effect）；真正区分质量的是 **test smell**，不是 assert 数。
- **⚠️ 措辞要收**：我原话里的 **"single ACT rule（拆 case 靠 Act 不靠 assert)"** 这个**重命名本身没获验证通过**（见下"不可乱用的命名"）。正确做法：援引 **"single state transition / one condition per test"** 这个有据的说法，**不要**自创"single ACT rule"当成 Uncle Bob 原话。
- **起草影响**：规则在精神上完全站得住（同一次触发的所有后果入一个 case = 一次 state transition）；引用时用 condition/state-transition，别用 ACT-rule 这个标签。
- 来源：`xunitpatterns.com/Principles of Test Automation.html`、`x.com/unclebobmartin/status/1078695335935979520`、`blog.cleancoder.com/.../PickledState.html`、`arXiv:2203.12085`

### 判断 3 — 反向断言=意图的精确否定　🟡 一致（无直接命名）

- 没找到专门给"反向断言选择"命名的权威反模式。它最自然地归在**判断 0（意图锚点）**之下：反向断言 = 把精确陈述的意图取否定。
- 倒是有个**反向支撑**：判断 4 的 Overspecified Software 警告"别 over-specify"，恰好约束了反向断言不能无穷穷举——和你"只写意图的精确否定"同向。
- **起草影响**：这条可以不单列权威引用，作为判断 0 的推论写；强调"先把正向意图说精确，否定才罩得住静默损坏"。

### 判断 4 — 断言强度=最小可证伪字段集　✅ 业界更狠（最大收获）

业界不仅同意，还把你的"别钉太多/别钉易漂移字段"**命名成了成熟反模式**，且话说得更狠：

- **Sensitive Equality**（Meszaros）：用对象的字符串表示来做断言「**is just plain wrong**」——「sensitive to behavior that it is not in the business of verifying」。**这正是你说的"不钉易随版本漂移的表示细节(时间戳/字段顺序/序列化形态)"的 canonical 名字。**
- **Fragile Test**（Meszaros, umbrella smell）：「A test fails to compile or run when the SUT is changed in ways that **do not affect the part the test is exercising**.」
- **Overspecified Software**（Meszaros）：过度用 Behavior Verification / Mock 会让软件被 over-specify，测试更脆、阻碍重构。
- **resistance to refactoring**（Vladimir Khorikov《Unit Testing》）：把"是否易随重构破裂"升级成一个**可操作的质量度量**——断言越贴实现，resistance to refactoring 越低。
- **Page Object**（Fowler）：直接操作 HTML 元素 → 测试脆；应用专属 API 隔离实现细节。**同构论证**（原生针对 UI，迁移到 API integration 是类比，非字面适用——见 caveat）。
- **⚠️ 两类 over-specification 要分清**（caveat 2）：
  - over-specify 断言的 **VALUE**（钉了不该钉的字段）→ **Sensitive Equality**
  - over-specify **交互 / mock 调用**（钉了"怎么调的"）→ **Overspecified Software**
  - **Fragile Test** 是这两者的 umbrella。
- **⚠️ 一个值得写进去的精化（来自被杀 claim 的反向启示）**：有人主张"弱断言才是低质量标志"(assertNotEquals vs assertEquals)，该 claim 被验证杀掉(0-3)，但它点出一个真实区别——**"最小字段集" ≠ "弱断言"**。最小指**作用域最小**（只碰与意图相关的字段），但在这个作用域内断言要**最强**（精确相等，不是"非空/存在"）。SKILL.md 措辞应是「**作用域最小、域内判别力最强**」，避免被读成"能弱则弱"。
- **起草影响**：这条是 delta 最大的一条。SKILL.md 应直接引 Sensitive Equality + Fragile Test + resistance to refactoring 三个名号，并写清"最小作用域 ≠ 弱断言"。
- 来源：`xunitpatterns.com/Fragile Test.html`、`martinfowler.com/bliki/PageObject.html`、`livebook.manning.com/book/unit-testing/chapter-5/`

### 判断 5 — 头号隐性失败=假绿　✅ 有客观检测器靠山

- **mutation testing** 是公认的客观检测器：注入 mutant，测试 fail→**killed**，测试 pass→**survived**。**零断言/假绿测试无法 kill 任何 mutant，从而被暴露。**（Stryker 官方）
- **code coverage 单独测不出假绿**：「Code coverage does not tell you everything... e.g. a test without an assertion purely to increase coverage.」可满覆盖却零断言。（arXiv:2203.12085：great coverage with no assert）
- **assertion-free / pseudo-tested**（arXiv:2103.08480 extreme mutation）：只要不抛异常就 pass 的测试是真实存在的反模式。
- **mock verification 命名**（Fowler, Mocks Aren't Stubs）：「only mocks insist upon **behavior verification**」——"verify mock was invoked"有正式名字叫 behavior verification。
- **caveat 3**：mutation **识别假绿**很稳；但 mutation **score 是否等价真实缺陷检测力**有争议（equivalent-mutant、correlation；Papadakis 2018 / Just 2014）。→ 当"假绿检测器"用可放心，当"总体质量分"用要加 caveat。
- **起草影响**：假绿这条可以从"作者经验之谈"升级成"有 mutation testing 撑腰的客观失败模式"，SKILL.md 可点名 survived mutant 作为假绿的可度量定义。
- 来源：`stryker-mutator.io/docs/`、`arXiv:2203.12085`、`arXiv:2103.08480`、`martinfowler.com/articles/mocksArentStubs.html`

### 判断 6 — 防假绿整条归下游，designer 零机制　🟠 有支撑但留分歧（需你再裁）

- **支撑面**：mutation testing 天然属于**执行/CI 层**（要真跑测试看 mutant 死活），把它归到下游 generator/runtime 完全合理。behavior verification（verify mock invoked）也是代码层断言，不是用例文档能表达的。
- **⚠️ 分歧面（open question #3，业界无定论）**：deep-research 明确提出——
  > 「mutation testing 归到下游后，**用例设计层是否仍需承担可证伪性前置约束**（如每个 case 显式声明 oracle 或期望副作用），还是完全外包给 mutation？**职责切分缺权威表述。**」
- 还有一个相关张力（open question #4）：behavior verification（验证 mock 被调用）**何时是合法 oracle、何时它本身就是 Overspecified Software**——业界指出风险但**没给 API 场景的判定边界**。
- **这正是第 ① 步我标记的设计分歧点，现在被外部研究独立确认为"业界空白"**。你在 grill 里连选两次"彻底推给下游、连判别值都不归 designer"——这是个**清晰的设计立场**，业界既没否定也没背书。
- **起草影响**：这条不是"对错"问题，是**设计取舍**。建议 SKILL.md：① 保留你的立场（case 文档零机制），但 ② 显式写出"designer 的唯一防假绿义务 = 把意图说到足够精确，让下游能据此选判别值/配 oracle"——这样既守住零机制，又不把可证伪性责任凭空蒸发。**是否要在 case 文档里强制每个场景声明一个『预期 oracle/副作用』占位（哪怕不写机制），是留给你拍的点。**

### 判断 7 — 缓测=带触发条件的可跟踪 TODO　🟡 原则一致·具体形态是自创延伸

- **原则有据**：RBT taxonomy（Felderer & Schieferdecker, peer-reviewed, 对齐 **ISO/IEC/IEEE 29119**）把 **residual risk 操作化为显式 exit criterion**，与 risk-item / threat-scenario / countermeasure 的 **coverage 准则**并列；exit criteria 是「conditions used to report against and to plan **when to stop testing**」。还引了 **ALARP**（residual risk shall be as low as reasonably practical）。ISTQB 对 exit-criteria 有正式词条。
- **⚠️ caveat 1 + open question #2**：你的"带补测**触发条件**的可跟踪 **TODO 条目**"这个**具体交付物形态**，**没有 primary 来源直接命名**——它是对 RBT/exit-criterion 框架的**忠实工程化延伸**，不是行业标准模板。
- **起草影响**：可以理直气壮地把缓测写成"对照 residual-risk / coverage gate 的显式 exit criterion"（有据），但**别声称"带触发条件的 TODO"是行业标准**——如实写成"本 skill 的具体落地形态"。
- 来源：`arXiv:1912.11519`、`istqb-glossary.page/exit-criteria/`

---

## ⚠️ 不可乱用的命名（被对抗式验证杀掉的 claim）

起草 SKILL.md 时**别引用**下面这些——它们听着权威，但没扛过验证，安上去会被 skill-judge 抓"编造出处"：

| 想安的标签 | 票数 | 为什么别用 |
|---|---|---|
| "Overcoupled Test"（当 Overspecified Software 的别名） | 1-2 ✗ | 这个别名无据。over-specification 用 Sensitive Equality（值）/ Overspecified Software（交互）即可 |
| "single ACT rule"（重命名 Uncle Bob 的 single assert rule） | 0-3 ✗ | Uncle Bob 没这么说。用"single state transition / one condition per test" |
| "single complex assert 只要还是一次 transition 就 OK"（说成 Uncle Bob 原话） | 0-3 ✗ | 未获其确认，别当原话引 |
| "四阶段里一次 exercise+一次 verify，交替就该拆"（说成 Meszaros 定义） | 1-2 ✗ | 措辞无据；用"Verify One Condition per Test"即可 |
| "弱断言是低质量的实证标志" | 0-3 ✗ | 被杀；但反向启示有用→"最小作用域≠弱断言"（见判断 4） |

---

## 给第 ③ 步（write-a-skill）的净增量

**1. 术语升级表（土话 → canonical，带引用）——直接喂进草稿：**

| field-notes 的土话 | 写进 SKILL.md 的 canonical 术语 | 引用锚点 |
|---|---|---|
| 业务意图是唯一锚点 | Specification by Example / WHAT-not-HOW / behavior-not-implementation | Adzic, Fowler |
| 别钉易漂移的表示细节 | **Sensitive Equality**（"just plain wrong"） | Meszaros |
| 钉太多导致随源码漂移 | **Fragile Test** / **Overspecified Software** | Meszaros |
| 断言贴实现就脆 | **resistance to refactoring**（可操作度量） | Khorikov |
| 假绿 | **survived mutant** / vacuous pass；coverage 测不出 | Stryker, arXiv:2203.12085 |
| 验证 mock 真命中 | **behavior verification** | Fowler |
| 一个场景=一条可证伪意图 | **Verify One Condition per Test** | Meszaros |
| 拆 case 靠触发不靠断言数 | **single state transition**（≠"single ACT rule"） | Uncle Bob |
| 缓测交接 | **residual risk as explicit exit criterion / coverage gate**（ALARP） | RBT taxonomy, ISTQB |

**2. 两处需在草稿里写清的精化（外部研究新增，01 没有）：**
- **"最小字段集 ≠ 弱断言"**：作用域最小、域内判别力最强（精确相等，非"存在/非空"）。
- **两类 over-specification 分治**：over-specify VALUE→Sensitive Equality；over-specify 交互/mock→Overspecified Software。

**3. 一个需你拍的设计分歧（third-party 研究独立确认为业界空白）：**
- 判断 6：把防假绿整条推给下游后，**case 文档要不要强制每个场景声明一个『预期 oracle/副作用』占位**（只声明 WHAT，不写 HOW）？业界无定论，是纯设计取舍。我的倾向：要——这样可证伪性责任不蒸发，又不破"零机制"。**等你拍。**

---

## 残留 open questions（供后续迭代，非阻塞）

1. API integration 专属（非 UI/unit）的 contract-testing 权威边界（Pact 的 schema 校验 vs 具体值断言）——现有证据多来自 unit/UI 语境。
2. "带触发条件的 TODO"是否有 ISO/IEC/IEEE 29119 测试计划模板的成文支撑。
3. 设计层 oracle 声明义务 vs 完全外包 mutation 的职责切分（= 上面要你拍的那条）。
4. behavior verification 何时是合法 oracle、何时是 over-specification 的 API 场景判定边界。
