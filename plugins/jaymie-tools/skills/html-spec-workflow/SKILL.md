---
name: html-spec-workflow
description: Use HTML files (instead of Markdown) as a richer, visual medium for AI-collaborated planning, spec writing, and design system maintenance. Use this skill whenever the user wants to brainstorm ideas, write a PRD/tech spec/implementation plan, build a throwaway editing UI for complex data, or maintain a living design system — especially with Claude. Trigger keywords include "做计划", "实施方案", "PRD", "技术规格", "头脑风暴", "脑暴", "brainstorm", "spec", "设计系统", "design system", "让 Claude 做 plan", "用 HTML 写 spec", "可视化方案", "活的设计系统". Even if the user only mentions "想要一个方案" or "帮我规划" without explicitly saying HTML, prefer this skill — the whole point is to convert text-heavy planning into engaging HTML artifacts. All HTML output produced by this skill must be in 中文 (Simplified Chinese) by default.
---

# HTML Spec Workflow（HTML 即规格）

> 一句话：**"HTML 是新的 Markdown。"** —— 让人类持续在回路里（in the loop），是和 AI 协作的最大杠杆。

本 skill 把 Anthropic Claude Code 工程师 Thariq Shihipar 的三大工作流封装成可复用流程：

1. **Brainstorm & Plan** — 用交互式 HTML 做头脑风暴和实施计划
2. **Disposable Micro-App** — 为复杂编辑场景生成"用完即扔"的定制 UI
3. **Living Design System** — 维护可携带、可执行的 `design_system.html`

---

## 核心默认值

- **输出语言**：所有 HTML 产物**默认使用中文（简体）**。包括标题、正文、按钮文案、注释、mockup 文字。代码内的标识符可以保留英文。
- **输出格式**：单文件 HTML（内联 CSS 和 JS），可以直接双击打开。除非用户要求拆分。
- **风格**：现代、克制、可读。优先 system-ui / "PingFang SC" / "Microsoft YaHei" 字体栈。深色模式优先级低于"易读"。
- **避免**：花里胡哨的渐变、emoji 装饰、多余动画。**复杂度必须自证其价值（complexity has to earn its keep）**。

---

## 何时进入哪个工作流

| 用户在做什么 | 走哪个流程 | 详细说明 |
|---|---|---|
| "我有个想法/题目，帮我想想怎么做" | Workflow 1 → 头脑风暴 | `references/brainstorm.md` |
| "把这个想法变成完整方案/PRD/spec" | Workflow 1 → 实施计划 | `references/brainstorm.md` |
| "这一段表格/规则我想改，但 HTML 不好编辑" | Workflow 2 → 微应用 | `references/micro-app.md` |
| "新功能怎么和现有产品风格保持一致" | Workflow 3 → 设计系统 | `references/design-system.md` |
| 不确定 / 多目标混合 | 先问清楚再选 | 见下方"对话开场" |

---

## 对话开场（当用户意图不清晰时）

不要直接动手。先用 1–2 个问题对齐：

1. **现在的目标是什么**？想头脑风暴 / 想要完整方案 / 想编辑已有内容 / 想抽取风格？
2. **要不要我把产物保存到当前项目目录**？（默认放 `./outputs/`，文件名用拼音或英文，标题和内容用中文）

对齐后立刻进入对应工作流。

---

## 通用 Prompt 哲学（贯穿三个工作流）

写给 Claude（也就是你正在执行 skill 的那个模型）的提醒：

1. **给约束 + 留余地**。约束保证方向，余地让模型发挥。多用 "whatever is needed to give me maximum context" 这种留白措辞。
2. **明示信任**。在 prompt 里加一句 "Hey Claude, I trust you here." 不是仪式，是让模型知道它有发挥空间。
3. **让人想看**。HTML 的全部价值就是让人愿意打开、愿意滚动、愿意点击。任何让页面变枯燥的细节都是反指标。
4. **复杂度自证**。每加一个交互、一个组件、一个动画，问一句："它真的让用户决策更快/更好了吗？"
5. **丰盈思维**。token 便宜了，一次性 UI、一次性图表、一次性脚本都值得做。但产物的"长期维护成本"要自觉控制——能扔就扔。
6. **99% / 1%**。绝大多数生成的 token 应该花在规划、界面、沟通上；最终落地代码只是冰山一角。

---

## 工作流总览（详细见各 reference）

### Workflow 1：Brainstorm & Plan

**触发**：用户给一个题目/想法，希望产出方案或计划。

**两步走**：
1. **HTML 头脑风暴页**：5–8 个想法，每个带小 mockup、说明、风险点。
2. **完整实施计划页**：选定一个想法后，输出包含 mockup、文件结构、代码片段、视觉氛围板的单文件 HTML。

**详细说明 + Prompt 模板**：见 `references/brainstorm.md`

---

### Workflow 2：Disposable Micro-App

**触发**：HTML 计划里有一段（表格、决策规则、配置）很难直接手改。

**做法**：让 Claude 再生成一个**专门用来编辑这一段**的临时 HTML 工具，含输入框、按钮、复制功能。改完即扔。

**详细说明 + Prompt 模板**：见 `references/micro-app.md`

---

### Workflow 3：Living Design System

**触发**：要给项目建一份"活的"设计系统，或想让 AI 在新功能里保持现有风格。

**做法**：从代码库抽取设计 DNA → 生成 `design_system.html` → 在新工作中作为 context 注入。

**详细说明 + Prompt 模板**：见 `references/design-system.md`

---

## 输出位置与命名约定

- 默认目录：`./outputs/`（如果不存在就提示用户或创建）。
- 文件名：英文/拼音，小写连字符，例如：
  - `brainstorm-csv-dashboard.html`
  - `plan-csv-dashboard.html`
  - `editor-decision-rules.html`
  - `design-system.html`
- 标题（`<title>` 和 `<h1>`）：**中文**。

---

## 底层原则速查（来自 Thariq Shihipar）

详见 `references/principles.md`。要点：

- 你正在变成一个 **算力分配者（compute allocator）**。
- **HTML 让人重新回到回路里**——这是 Markdown 做不到的。
- **复杂度必须赚到它的工资**。
- **约束 + 信任** 是最佳 Prompt 配比。
- **99% 的 token 该花在沟通上，1% 才是生产代码**。

---

## 当模型卡住时

如果用户给的需求太宽泛，模型容易陷入"想做完美"而停滞。脱困办法：

- 立刻先生成一个**最小可看版本**（5 个想法、1 个 mockup），让用户在浏览器里点开看。
- 用产物驱动对话，而不是用提问驱动对话。
- 视觉上的"差一口气"远比文本上的"还差几条"更容易让用户给出有效反馈。

---

## 可复用 Prompt 模板（中文版本）

完整版本见 `prompts/` 目录：

- `prompts/brainstorm.md` —— 头脑风暴 prompt
- `prompts/plan.md` —— 实施计划 prompt
- `prompts/micro-app.md` —— 一次性编辑 UI prompt
- `prompts/design-system.md` —— 设计系统抽取 prompt
- `prompts/inject-design-system.md` —— 把设计系统作为 context 注入新功能 prompt

每个文件都是"复制就能用"的中文 prompt 模板。
