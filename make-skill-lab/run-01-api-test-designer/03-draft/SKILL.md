---
name: api-test-designer
description: >-
  设计/起草接口集成测试用例为「可评审的 Markdown case 文档草稿」，在写测试代码之前。
  当用户想为某个接口或业务流程设计测试场景、把产品需求或一段 AI-人讨论整理成测试用例、
  或说「给这个接口设计测试用例」「把这个需求拆成测试场景」「先出 case 再写代码」「design test cases for this endpoint」时，
  使用本 skill。它产出 status:draft 的 case .md 供人类 CR，**不生成测试代码**（生成代码用 api-test-generator）。
  即使用户没明说「skill」「用例文档」，只要是在为接口/流程规划测试、设计断言、梳理测试场景，也优先用本 skill。
---

# api-test-designer

把「产品需求 / AI-人讨论 / 接口探索笔记」变成**精简、可评审、schema 合规**的测试用例 Markdown 草稿。

这是「设计 → 人类 CR → 生成代码」三段流水线的**第一段**：

```
产品需求 / AI-人对话
   └─[本 skill] 设计场景 + 写 case .md(status: draft) ──→ 人类 CR(status: approved) ──→ api-test-generator 生成 pytest
```

**职责到草稿为止**：产出一份人能快速 review 的 case 文档，然后停下。不写测试代码、不跑测试——那是下游 `api-test-generator` 的事。
**框架级**：case 文档的 schema、目录约定、风险模型都**从目标项目现场发现**，不套用别处假设。

## 唯一锚点：业务意图（WHAT，不是 HOW）

下游测试的质量上限由这份 case 文档决定。本 skill 的全部判断，都是**同一根锚点**——「这条业务意图」——在不同维度上的投影。case 文档**只承载意图（WHAT）**；机制（HOW：怎么调、判别值、mock 命中、fixture 形状）**整条归下游**，写进 case 文档就是分层泄漏（业界叫 Specification by Example：规格只说 WHAT，把 HOW 留给实现）。

| 设计判断 | 实为「业务意图」的哪个投影 | 规则 |
|---|---|---|
| 场景配不配立 case | 能否**独立证伪**一条意图 | §2 |
| case 边界画哪 | 一次触发引发的、属同一意图的**全部后果** | §2 |
| 反向断言写哪几条 | 意图的**精确否定** | §3 |
| 一条断言钉多强 | 恰好能**证伪意图**的最小字段集 | §3 |

## 流程

### 1. 先发现脚手架（不要猜）

动笔前读清目标项目约定：case 文档 **schema**（必填 frontmatter 键、必需章节）、同 SUT 已批准的 case（只对齐**编号/命名/措辞**，不从范例反推结构）、**sut.md**（接口事实来源）、**风险模型**（如 non_destructive/stateful/destructive）、**数据层**（fixture/case spec 位置）、**场景造数**（引用既有 `logged_in_temp_user`/`funded_temp_user` 等，不发明一次性造数）。定位不到就**停下说明缺什么**，别编 schema。详见 `references/case-format.md`。

### 2. 选场景：一个场景 = 一条可独立证伪的意图

基于需求/对话 + 接口事实，提候选场景集，逐个和人确认测哪些、**显式说明缓测/不测哪些及理由**。覆盖维度见 `references/scenario-coverage.md`（happy path / 每个业务错误码 / 边界异常 / 异步终态 / 副作用与反向 / 风险分级）。两条硬规则：

- **场景门槛**：一个场景值得**单独立一个 case ⟺ 它能独立证伪一条业务意图**。凑不出这样一条独立断言的，归进别的场景，不单立。
- **case 边界**：**一个 case = 一个〈前置 + 触发动作〉+ 它的完整终态契约**（所有正向断言 + 所有反向断言）。拆 case 的触发器是 **Arrange 或 Act 变了，不是 Assert 多了**：触发输入/请求不同→拆（各错误码、各边界）；前置不同→拆；异步终态不同→拆（成功/失败/超时）；只是断言多几条→**不拆**，堆进同一 case。
  - 这对应 Meszaros 的 **Verify One Condition per Test**（拆分单位是 condition，不是 assert 数）。**定位靠每条断言写清自己的 failure message，不靠拆 case 换**——按"能否独立坏掉"拆会让 case 爆炸、前置重复。
  - 反例：「下单成功返回订单号」+「下单成功扣库存」=**一个** case（同一次请求两条断言）；「库存不足拒单」=**另一个**（不同前置 + 不同终态）。

### 3. 写 case：意图契约，零机制

从 `references/case-format.md` 固定模板起骨架，写 `suts/<sut>/cases/NNN-*.md`，frontmatter 标 **`status: draft`**。只写第①层（意图 + 本用例独有参数 + 覆盖意图的断言 + 风险级）。三条断言纪律：

- **每个场景必须声明预期 oracle（WHAT），禁止写 HOW**：列出「该验什么终态/副作用」——正向（如「应扣减**本单**库存」）+ 反向（如「**不应**动他人库存」）。只声明业务终态，**不写**怎么验、判别值、mock 命中机制、fixture（那些是下游 generator 的事）。这是 case 层**唯一**的防假绿义务：把意图说到足够精确，下游才据此选判别值、配 oracle。
- **反向断言 = 意图的精确否定**：只写「与本 case 意图相对立」的那几条，不穷举宇宙。前提——**先把正向意图说精确**：「扣库存」罩不住「误扣他人库存」，「**只**扣本单库存」才罩得住。
- **断言强度 = 最小作用域、域内最强**：只声明能证伪本意图所需的**最小字段集**，但在该字段上要求**精确相等**（不是「存在/非空」这种弱断言——**最小 ≠ 弱**）。**不要**钉与意图无关、易随版本漂移的表示细节（时间戳、trace id、字段顺序、可选空字段是否出现）——钉了就是 **Sensitive Equality**，会让测试变 **Fragile Test**（SUT 改了不影响本意图的部分，测试却红）。

接口事实/调用链/base/path/cleanup → **链到 sut.md，不要 inline**；**不写可执行 python 片段**；断言引用的数据**从 fixture 派生**，不硬编码；只镜像 schema 必需章节，范例的 ④层冗余（mock 取证、留现场、排障 runbook）只留一行指针。详见 `references/authoring-discipline.md`。

### 4. sut.md 处理

- 存在 → 当接口事实权威来源，据它写、链它。
- 缺失/没覆盖本场景 → 标 `接口假设·未校准（需 api-test-context 核实）` 并继续，**不阻塞**、不瞎编。
- **设计期自己核实到的新接口事实必须回写 sut.md**（按 api-test-context 的 verification 格式补一条），否则下游只读 sut.md，这条事实会断流。

### 5. 缓测交接 + 自检后停下

- **缓测/不测**：每条落成**带「补测触发条件」的可跟踪条目**（什么条件下必须补测），对照项目的 residual-risk / coverage gate 当显式 exit criterion——不让它静默消失。
- 形状自检（如 `skills/api-test-generator/scripts/inspect_case_document.py <case.md>`，只查 frontmatter/章节形状）。逐条自查断言是否真能证伪意图，不能的改强或删。
- **停在这里**，不生成测试代码。

> 防假绿补注：测试「假绿」（mock 没真命中却照样通过）的客观检测器是 mutation testing 的 **survived mutant**，那属下游执行层；case 层管不了机制，**唯一**能做的就是上面「声明精确 oracle」。

## 最终回复

简短给出：创建的 case 文档（路径 + 一句话意图 + 风险级 + `status: draft`）；提了哪些场景、本批测哪些、缓测哪些及**补测触发条件**；需人类 CR 重点确认的点（尤其「未校准」假设、风险分级、缓测项）；提示下一步：人类把 `status` 改 `approved` 后用 `api-test-generator` 生成代码。

## 参考文件

- `references/case-format.md` — case 文档**固定模板** + 与脚手架 schema 的优先级规则。**第 3 步动笔从它起骨架。**
- `references/authoring-discipline.md` — 分层纪律 + 防冗余规则（哪些必须链出去、不能 inline），含正反例。**写 case 前读它。**
- `references/scenario-coverage.md` — 场景覆盖维度清单，用于第 2 步提候选场景。

> 设计依据（详见 make-skill-lab run-01 的 02-research.md）：意图锚点 = Specification by Example / behavior-not-implementation；断言强度 = Sensitive Equality、Fragile Test、resistance to refactoring（Meszaros / Khorikov）；case 粒度 = Verify One Condition per Test、single state transition（Meszaros / R. C. Martin，二人均反对教条"单断言"）；假绿 = survived mutant（mutation testing）；缓测 = residual-risk exit criterion（RBT / ISO·IEC·IEEE 29119）。
