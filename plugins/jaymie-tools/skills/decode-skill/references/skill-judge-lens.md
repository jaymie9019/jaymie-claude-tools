# skill-judge 解读透镜（精简版）

> 这是解读一个 skill 时戴的"眼镜"。逐段标注时，从这里取概念。来源：softaworks/agent-toolkit 的 skill-judge。

## 核心公式

**好 skill = 专家独有知识 − Claude 已经会的**

一个 skill 的价值 = 它的 **knowledge delta**。解释 Claude 早就会的东西 = 浪费 token。
Skill 不是教程，而是**知识外化机制**——改一个 Markdown 文件，模型行为就变。

## 三类知识标签（逐段必标）

| 标签 | 含义 | 判据 |
|------|------|------|
| **E · Expert** | Claude 真的不知道 | 决策树、踩坑得来的权衡/edge case、领域专有思维框架 |
| **A · Activation** | Claude 知道，但当下可能想不到 | 简短的提醒、行为纠偏 |
| **R · Redundant** | Claude 肯定知道 | 基础概念、标准库用法、通用最佳实践、"写整洁代码"类空话 |

判一段属于哪类，问一句：**"Claude 已经知道这个吗？"**
好 skill 的大致配比：E > 70%、A < 20%、R < 10%。

## 8 个维度（既用于逐段标注，也用于末尾打分）

每段标注时指出它服务哪个维度；末尾评分时，每维给一个分数 + 一行依据。满分 120。

| 维度 | 满分 | 它在管什么 |
|------|------|-----------|
| **D1 Knowledge Delta** | 20 | 这段有没有真正的专家增量？ |
| **D2 Mindset + Procedures** | 15 | 传递"怎么想"的思维框架 + Claude 不知道的领域专有流程 |
| **D3 Anti-Pattern** | 15 | 具体、带原因的 NEVER 列表（专家知识的另一半） |
| **D4 Description** | 15 | frontmatter 的 description 答全 WHAT / WHEN / KEYWORDS 了吗？（激活前 Agent 只看得到它） |
| **D5 Progressive Disclosure** | 15 | 三层加载；references 有没有明确加载触发 + "Do NOT Load" |
| **D6 Freedom Calibration** | 15 | 自由度匹配任务脆弱性：创意高自由、易错操作低自由 |
| **D7 Pattern Recognition** | 10 | 套用了哪种官方 pattern（见下） |
| **D8 Usability** | 15 | Agent 能否真照着用：决策树、能跑的示例、fallback、edge case |

## 等级（总分换算）

| 等级 | 分数 | 百分比 |
|------|------|--------|
| **A** | 108–120 | 90%+ |
| **B** | 96–107 | 80–89% |
| **C** | 84–95 | 70–79% |
| **D** | 72–83 | 60–69% |
| **F** | <72 | <60% |

打分不是目的，是把"哪里强、哪里弱"量化到可对话。给分后必须回到下方「诚实原则」：**这把尺子重 D1/D3，行为/prompt 型 skill 常落 B/C，分数低 ≠ 不好用**——这一点要在结论里讲明。

## 5 种官方设计 Pattern（鸟瞰时判定属于哪种）

| Pattern | 约行数 | 特征 | 适用 |
|---------|--------|------|------|
| **Mindset** | ~50 | 思维>技巧、强 NEVER、高自由 | 需品味的创意 |
| **Navigation** | ~30 | 极简正文，路由到子文件 | 多个不同场景 |
| **Philosophy** | ~150 | 两步：哲学→表达，重匠艺 | 需原创的创作 |
| **Process** | ~200 | 分阶段、检查点、中自由 | 复杂多步项目 |
| **Tool** | ~300 | 决策树、代码示例、低自由 | 对特定格式精确操作 |

## 9 个常见失败模式（发现时点名 + 给修法）

1. **The Tutorial** — 解释"什么是 X"、库基础用法 → 删掉，聚焦专家决策
2. **The Dump** — SKILL.md 800+ 行全塞一起 → 下沉到 references
3. **The Orphan References** — 有 references 却从不加载 → 在决策点加 MANDATORY 触发
4. **The Checkbox Procedure** — 机械 Step 1/2/3 → 改成"做 X 前，先问自己……"
5. **The Vague Warning** — "小心""注意 edge case" → 具体 NEVER + 非显然原因
6. **The Invisible Skill** — 内容好但很少被激活 → description 补全 WHAT/WHEN/KEYWORDS
7. **The Wrong Location** — "何时使用"写在正文 → 移到 description
8. **The Over-Engineered** — 塞 README/CHANGELOG → 删掉关于 skill 自身的文档
9. **The Freedom Mismatch** — 创意给死脚本 / 脆弱操作给含糊指引 → 按脆弱性校准

## 元问题（写鸟瞰结论时回到这）

> "一个该领域的专家看了这个 skill，会不会说：'对，这正是我花了好几年才学会的东西'？"

会 → 有真价值。不会 → 只是在压缩 Claude 早就有的东西（垃圾压缩）。

## 重要：解读时的诚实原则

- **"短"本身不是缺点**——D5 奖励简洁，"43 行能赢 500 行"。别因为一个 skill 短就贬低它。
- **这把尺子量的是 knowledge delta 与 anti-pattern**——行为型 / prompt 型 skill 在 D1/D3 天然吃亏，优秀者也常落 B/C，这不代表它"不好用"。解读时要点明"这把尺子量什么、不量什么"。
- **标签是判断、不是事实**——给 E/A/R 或维度归属时，附一句依据，别武断。
