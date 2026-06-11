# html-spec-workflow

把 HTML 文件当作比 Markdown 更丰富的"视觉介质"，与 Claude 协作做计划、写 spec、维护 design system。

灵感来自 Anthropic 工程师 Thariq Shihipar 在 *How I AI* 节目中的分享。

## 三大工作流

1. **HTML 头脑风暴 + 实施计划** —— 把方案做成可视化页面而不是文字列表
2. **一次性微应用** —— 给难以手改的内容（表格 / 决策树 / 配置）做定制 HTML 编辑器
3. **活的设计系统** —— 单个 `design_system.html` 作为视觉真理之源

## 输出语言

所有 HTML 产出默认中文。

## 安装

复制整个目录到 `~/.claude/skills/html-spec-workflow/`：

```bash
mkdir -p ~/.claude/skills
cp -r html-spec-workflow ~/.claude/skills/
```

之后在 Claude Code 里说"帮我用 HTML 做计划"、"做个头脑风暴"、"我要一份 PRD"等时会自动触发。

## 触发关键词

`做计划` `实施方案` `PRD` `技术规格` `头脑风暴` `脑暴` `brainstorm` `spec` `设计系统` `design system` `让 Claude 做 plan` `用 HTML 写 spec` `可视化方案` `活的设计系统`

## 目录结构

```
html-spec-workflow/
├── SKILL.md                       # 主入口（YAML 元信息 + 路由）
├── references/
│   ├── brainstorm.md              # 工作流 1 详细方法
│   ├── micro-app.md               # 工作流 2 详细方法
│   ├── design-system.md           # 工作流 3 详细方法
│   └── principles.md              # 5 条核心原则 + 决策树
└── prompts/
    ├── brainstorm.md              # 头脑风暴 prompt 模板
    ├── plan.md                    # 实施计划 prompt 模板
    ├── micro-app.md               # 一次性微应用 prompt 模板
    ├── design-system.md           # 设计系统抽取 prompt 模板
    └── inject-design-system.md    # 把设计系统注入新功能 prompt 模板
```
