# Prompt 模板：HTML 实施计划

> 在头脑风暴页基础上，把选定想法变成完整可读的 HTML 计划。

---

## 标准版

```
基于头脑风暴中的「[选定想法的标题]」，生成完整的实施计划。

请输出一份单文件 HTML，包含：
- 一句话定位
- 目标 / 非目标
- 用户故事（2–4 条，含角色、动机、验收标准）
- 架构图（用 div/CSS/SVG 画一个简化的系统架构）
- 文件结构（用 <pre> 缩进展示）
- 关键代码片段（用 <pre><code> 高亮，不必引外部库，手动加 class 就好）
- 核心页面/组件 UI mockup（HTML+CSS 草图）
- 视觉氛围板（色板 + 字体方向 + 动效原则）
- 里程碑（表格或时间线）
- 风险与应对

给我**最大化的 context** —— excerpts、mockups、code，whatever is needed.
整页中文。配色克制。可读性优先。
Hey Claude, I trust you here.

输出到 ./outputs/plan-[slug].html
```

---

## 简化版（小项目）

```
根据「[想法]」做一份 HTML 计划：目标、用户故事、文件结构、核心 UI mockup、
关键代码片段、风险点。中文，单文件，零依赖。存到 ./outputs/plan-[slug].html。
Hey Claude, I trust you here.
```

---

## 互动启动版（先反问再生成）

```
我想就「[想法]」做一份 HTML 实施计划。在你开始写之前，请先问我 3–5 个最关键的问题
（用户量级 / 性能要求 / 团队规模 / 技术栈 / 上线时间……），等我回答完再动手。

最终产物：单文件 HTML，含目标、用户故事、架构图、UI mockup、文件结构、关键代码、
里程碑、风险。整页中文。存到 ./outputs/plan-[slug].html。
```
