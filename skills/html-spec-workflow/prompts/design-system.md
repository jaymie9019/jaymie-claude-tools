# Prompt 模板：设计系统抽取

> 从代码库提炼"视觉 DNA"，并生成 `design_system.html`。

---

## 第一步：抽取 DNA（先用 Markdown 对齐）

```
请分析 [项目路径 / 仓库列表，例如 ./src 或 ./marketing-site + ./app]，
提取这个项目的视觉设计 DNA：

- 颜色（含语义角色：primary / secondary / success / warning / danger / neutral 等）
- 字体栈、字号层级、行高、字重
- 间距 scale（margin/padding 常用值）
- 圆角、阴影、过渡时长
- 现有组件清单和它们的状态（hover / active / disabled / loading）

先把抽取结果用 Markdown 列出来给我看，**不要直接生成 HTML**。
我确认 DNA 没问题之后再让你写 design_system.html。
```

---

## 第二步：生成 design_system.html

```
基于刚刚确认的设计 DNA，生成 design_system.html，要求：

- 单文件，零外部依赖（字体用系统字体栈即可）
- 整页中文注释和文案
- 顶部一句话用中文描述这个产品的视觉性格（克制 / 温暖 / 极简 / ……）
- 必含模块：
  1. 色板（每色块带 hex 标签 + 一键复制按钮，按语义分组）
  2. 字号层级（H1–H6 + body + caption，每行实际渲染，旁标 size/line-height/weight）
  3. 间距 scale（用横条直观展示）
  4. 圆角 / 阴影 / 过渡示例
  5. 核心组件全部状态（按钮、输入框、卡片、徽章、Tab、Modal、Toast……）
  6. 1–2 个真实页面 mockup（让人看到原子组合后的样子）

输出到 ./outputs/design-system.html
Hey Claude, I trust you here.
```

---

## 第三步（进阶）：组件变体探索区

```
在 design-system.html 里加一个"按钮变体探索区"：

- 用滑杆调 padding（4px ~ 32px）
- 用滑杆调 border-radius（0 ~ 24px）
- 用颜色选择器调 background 和 border
- 用滑杆调 shadow blur 和 spread
- 中间一个实时预览块，所有改动同步

整页中文。Hey Claude, I trust you here.
```
