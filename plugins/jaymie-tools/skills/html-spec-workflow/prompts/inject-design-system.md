# Prompt 模板：把 design_system.html 作为 context 注入新功能

> 在新功能开发的对话开头使用，让 AI 输出风格自动对齐。

---

## 标准版

```
请把 ./outputs/design-system.html（或 ./design-system.html）作为
**视觉真理之源**。

接下来你写的所有 UI 代码，必须在以下方面与 design_system.html 一致：
- 颜色（含语义角色）
- 字号层级与字重
- 间距 scale
- 圆角、阴影、过渡
- 组件形态（按钮、输入框、卡片等的样式与状态）

如果设计系统里没有覆盖到的场景，**先告诉我你打算怎么做**，
不要自行发明新的视觉模式。

本次任务：[具体功能描述]
```

---

## 简化版

```
以 ./outputs/design-system.html 为视觉真理之源，做 [具体功能]。
任何 design system 没覆盖的视觉决策，先问我再下手。
```

---

## 扩展版（团队协作场景）

```
我们的视觉真理之源是 ./outputs/design-system.html。

这次要做：[功能]

请你：
1. 先读完 design-system.html，简短复述它的视觉性格（一句话）
2. 列出这个功能会用到 design-system.html 里的哪些组件 / 颜色 / 间距
3. 标记出需要"扩展"的地方（design-system 没有但本次需要的），等我确认
4. 全部确认后，给我功能的完整 HTML mockup（中文文案），存到 ./outputs/[feature].html

整个流程不要跳步。Hey Claude, I trust you here.
```
