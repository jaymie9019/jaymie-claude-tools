# decode-skill

用 **skill-judge** 方法论解读并学习任意 Agent Skill，产出一份**可视化、自包含、（非中文源则）双语对照**的 HTML 讲解页。

- 逐字引用原文，**逐段讲解**设计意图
- 每段标注 skill-judge 透镜：**E/A/R** 知识类型 + 服务于哪个**维度**
- 非中文 skill 自动**中英对照**（左原文 / 右中文，左侧大纲默认展开）
- 末尾附一节 **skill-judge 8 维评分**（/120 + 等级），分数服务于讲解、不喧宾夺主
- 重在"学会怎么读 skill"——讲解为主、评分为辅

## 用法

把要解读的 skill 交给它，三选一：

- **本地路径**：`解读一下 plugins/.../skills/xxx/SKILL.md`
- **粘贴原文**：直接把 SKILL.md 贴进对话
- **GitHub / 网页 URL**：给链接，自动抓取

产出一份 HTML，自动打开；可用 `collect-html` 收藏后续浏览。

## 结构

```
decode-skill/
├── SKILL.md                      # 工作流（Process pattern）
├── references/
│   └── skill-judge-lens.md       # 精简版 skill-judge 方法论（自包含）
└── assets/
    └── decode-template.html      # HTML 输出模板（低自由度，保证渲染质量）
```

## 来源

解读体系基于 [skill-judge](https://github.com/softaworks/agent-toolkit/blob/main/skills/skill-judge/SKILL.md)（softaworks/agent-toolkit）。本 skill 为本仓库原创。
