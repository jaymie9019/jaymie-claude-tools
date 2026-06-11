# Workflow 3：Living Design System（活的设计系统）

## 适用场景

- 用户希望新功能/新页面**和现有产品风格一致**。
- 用户希望团队（甚至非技术同事）有一个**自助查阅**的视觉语言文档。
- 用户在开几个项目，希望共享一套设计语言。

## 核心思想

把设计系统从**死的文档**变成**活的 HTML 单文件**。它同时是：

- **给人看的展示页**——色板、字号、组件状态全都直接渲染。
- **给 AI 用的 context**——下次写新功能时，把它丢给 Claude 当输入。

一份 `design_system.html` 就是项目的"视觉 DNA 提取物"，可携带、可执行、可分享。

---

## 五步生成法

### 步骤 1：抽取设计 DNA

把 Claude 指向项目源码（本地目录或多个 GitHub 仓库），让它分析：

- 颜色变量（CSS variables、Tailwind config、SCSS variables）
- 字体栈、字号层级、行高
- 间距 scale（margin/padding 常用值）
- 圆角、阴影、过渡时长
- 现有组件清单和它们的状态（hover、active、disabled、loading 等）

**Prompt 起点**：

> 请分析 [本地目录 / 仓库列表]，提取这个项目的视觉设计 DNA：
> - 颜色（含语义角色：primary/secondary/success/warning/danger/neutral 等）
> - 字体与字号层级
> - 间距 scale
> - 圆角、阴影、过渡
> - 现有组件清单与它们的状态
>
> 先把抽取结果列给我（Markdown 即可），我确认后再让你生成 HTML。

**为什么先列再生成**：直接生成 HTML 经常会"猜"——先用 Markdown 对齐一遍，可以让用户在低成本阶段就指出"这个色不对"。

---

### 步骤 2：生成 `design_system.html`

确认 DNA 之后，生成单文件 HTML。**这不是风格指南文档，是一个组件 playground**。

**必含模块**：

1. **顶部一句话**：用一句中文描述这个产品的视觉性格（克制 / 温暖 / 极简 / 工业感 / ……）。
2. **色板**：每个颜色一个色块，**带 hex / rgb 标签 + 一键复制**。按语义分组。
3. **字体层级**：H1–H6 + body + caption，每行实际渲染，旁边标 `font-size / line-height / weight`。
4. **间距 scale**：用一组横条直观展示 `4px / 8px / 12px / 16px / ...`。
5. **圆角 / 阴影 / 过渡**：每项给一个示例方块。
6. **核心组件**：按钮（所有状态）、输入框、卡片、徽章、Tab、Modal、Toast……每个组件**全部状态都要渲染出来**——不是只画 default。
7. **应用截图区**（可选）：给 1–2 个真实页面 mockup，让人看到这些原子组合后的样子。

**Prompt**：

> 基于刚刚确认的设计 DNA，生成 `design_system.html`：
> - 单文件，零外部依赖（字体可用系统字体栈）。
> - 整页中文注释和文案。
> - 包含色板（带复制按钮）、字号层级、间距 scale、圆角/阴影/过渡示例、
>   核心组件全部状态、1–2 个页面 mockup。
> - 顶部一句话用中文描述产品视觉性格。
>
> 输出到 `./outputs/design-system.html`。

---

### 步骤 3：作为 context 注入新功能

下次开新功能时，给 Claude 的 prompt 里**第一件事就是这一句**：

> 把 `./outputs/design-system.html`（或 `./design-system.html`）作为视觉真理之源。
> 接下来你写的所有 UI 必须在颜色、字号、间距、圆角、组件形态上与它一致。

模型会主动读这份 HTML 当 context，从此**风格漂移大幅减少**。

---

### 步骤 4：探索组件变体（进阶）

如果用户想做 component playground（"按钮 padding 大点会怎样？"），让 Claude 在 `design-system.html` 里加：

- 滑杆（border-radius、padding、shadow blur）
- 颜色选择器（background、border）
- 实时预览块

> 给现有的 design-system.html 加一个"按钮变体探索区"：用滑杆和颜色选择器
> 让我能实时调 padding、border-radius、shadow，预览块同步变化。Hey Claude, I trust you here.

---

### 步骤 5：分享给非技术同事

把 `design-system.html` 部署到任何静态托管（GitHub Pages、Vercel、Netlify、内网静态服务），把 URL 发给市场/PM/设计同事。他们可以：

- 自己截图组件做 PPT、视频物料。
- 用色板取色。
- 看到所有按钮形态选择需要的那个。

**不再需要每次"骚扰工程师"**。

---

## 实战检查清单

- [ ] 色板每个色块带 **hex 值 + 一键复制按钮**？
- [ ] 字号层级**实际渲染**了，不是只写"H1 = 32px"？
- [ ] 按钮把 default / hover / active / disabled / loading 都画了？
- [ ] 顶部一句话能让一个新人**3 秒内理解这个产品的视觉气质**？
- [ ] 整页打开后流畅滚动，没有抖动 / FOUC？
- [ ] 所有文案中文？

---

## 反模式（不要做）

- ❌ 只写文档不渲染——"主色 #1677FF"这种纯文字描述等于没做。
- ❌ 把 `design-system.html` 做得像一个"宣传 landing page"——它是**工具**，不是营销材料。
- ❌ 把 800 个图标全塞进去——只放在产品里**用过**的，其他放外链或第二份文件。
- ❌ 用 Tailwind / 引外部 CDN——这份文件要能**离线用**、能**作为 context 注入 LLM**，依赖越少越好。
- ❌ 一次想生成完美版——**先低保真，让用户改两轮，再加细节**。

---

## 与 Workflow 1 / 2 的协作

- **Workflow 1（计划页）** 引用 `design-system.html` 当 mockup 的视觉规范，确保计划里画的草图和真实产品一致。
- **Workflow 2（微应用）** 也可以用这份 design system 当样式来源——让一次性工具看起来像产品自家的小工具，而不是 raw HTML。
