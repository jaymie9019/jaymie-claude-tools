# jaymie-claude-tools

Jaymie 个人 Claude Code 插件仓库，按官方 [Plugin](https://code.claude.com/docs/en/plugins) 规范打包。本仓库是一个 **marketplace**，内含 3 个独立 plugin，可以按需选择安装。

## 包含的 plugin

| Plugin | 内容 | 适合谁装 |
| --- | --- | --- |
| [`jaymie-tools`](plugins/jaymie-tools/) | Jaymie 自定义 skill（grok-search、html-spec-workflow、print-sessionid）+ Hindsight 记忆 hooks | 自己的日常主力 |
| [`mattpocock-engineering-skills`](plugins/mattpocock-engineering-skills/) | 从 mattpocock/skills vendor 的 10 个工程 skill | 写代码时 |
| [`mattpocock-productivity-skills`](plugins/mattpocock-productivity-skills/) | 从 mattpocock/skills vendor 的 5 个效率 skill | 通用工作流 |

## 安装

```
/plugin marketplace add jaymie9019/jaymie-claude-tools

# 按需选装,互不依赖
/plugin install jaymie-tools@jaymie-tools
/plugin install mattpocock-engineering-skills@jaymie-tools
/plugin install mattpocock-productivity-skills@jaymie-tools
```

之后用 `/plugin` 管理（启用/禁用/更新/卸载）。

**更新到最新版本**：

```
/plugin marketplace update jaymie-tools          # 1. 拉最新的 marketplace catalog
/plugin update <plugin-name>@jaymie-tools        # 2. 升级 plugin 本体（仅当 plugin.json 的 version 已 bump）
```

> 因为各 `plugin.json` 设置了显式 `version` 字段，必须 bump 它（如 `0.7.0` → `0.7.1`）`/plugin update` 才会重拉。如果想"每次 commit 都算新版本"，可以删掉 manifest 里的 `version` 字段。

## Plugin 1：jaymie-tools（自定义 skill + hooks）

主动调用的功能都以 Claude Code skill 形式实现，调用时**无需 plugin 前缀**（如 `/print-sessionid` 而非 `/jaymie-tools:print-sessionid`）。后台能力通过 plugin hooks 自动注册。

| 功能 | 类型 | 说明 |
| --- | --- | --- |
| [`/print-sessionid`](plugins/jaymie-tools/skills/print-sessionid/SKILL.md) | user-invoked | 打印当前 Claude Code 会话的 session ID（Desktop / CLI 通用） |
| [`grok-search`](plugins/jaymie-tools/skills/grok-search/SKILL.md) | model-invoked | 经 `grokx` CLI 调 Grok 联网搜索，获取实时 web / X 信息 |
| [`html-spec-workflow`](plugins/jaymie-tools/skills/html-spec-workflow/SKILL.md) | model-invoked | 用 HTML（而非 Markdown）作为 AI 协作的规格/计划/设计系统媒介。触发词：做计划、PRD、技术规格、脑暴、设计系统、用 HTML 写 spec 等 |
| Hindsight memory hooks | plugin hooks | 自动注册 `SessionStart` / `UserPromptSubmit` / `Stop`，复用本机 `~/.hindsight/claude-code/scripts/` 做记忆预热、召回和写入 |

> `html-spec-workflow` 的源仓库在 [`jaymie9019/skills`](https://github.com/jaymie9019/skills)，定期 vendor 到本仓库。

### Hindsight 记忆 hooks

启用 `jaymie-tools` 插件后，Claude Code 会在以下生命周期事件中调用 wrapper：

- `SessionStart` → `session_start.py`：检查 / 预热本机 Hindsight 服务
- `UserPromptSubmit` → `recall.py`：在处理用户 prompt 前召回相关记忆
- `Stop` → `retain.py`：在一轮结束后写入可复用记忆

wrapper 位于 `plugins/jaymie-tools/scripts/run-hindsight-hook.sh`，默认委托给：

```bash
~/.hindsight/claude-code/scripts/session_start.py
~/.hindsight/claude-code/scripts/recall.py
~/.hindsight/claude-code/scripts/retain.py
```

这样做的边界很明确：本插件只负责把 Claude Code plugin hooks 接起来，不把 Hindsight Python 脚本和个人配置 vendor 到公开仓库。实际 bank、API URL、retain/recall 策略继续由 `~/.hindsight/claude-code.json` 管理。

本机验证：

```bash
curl -fsS http://localhost:8888/health
claude plugin validate .
```

在 Claude Code 里可以用 `/hooks` 查看这些 hooks 的来源是否为 `Plugin`。如果未安装 Hindsight，本插件会静默跳过，不影响其他 skill 使用。

可选环境变量：

- `JAYMIE_DISABLE_HINDSIGHT_HOOKS=1`：临时关闭本插件的 Hindsight hooks
- `JAYMIE_HINDSIGHT_HOOK_DEBUG=1`：输出 wrapper 调试日志
- `JAYMIE_HINDSIGHT_INTEGRATION=claude-code`：指定 `~/.hindsight/<integration>/scripts/`，默认 `claude-code`

## Plugin 2：mattpocock-engineering-skills

从 [`mattpocock/skills`](https://github.com/mattpocock/skills)（MIT License）vendor 进来，本仓库自行维护更新，不保证与上游同步。导入基线：上游 commit `694fa30`（2026-06）。

| Skill | 说明 |
| --- | --- |
| [`diagnose`](plugins/mattpocock-engineering-skills/skills/diagnose/SKILL.md) | 疑难 bug / 性能回归的纪律化诊断循环：复现 → 最小化 → 假设 → 插桩 → 修复 → 回归测试 |
| [`grill-with-docs`](plugins/mattpocock-engineering-skills/skills/grill-with-docs/SKILL.md) | 拷问式评审：用已有领域模型挑战你的方案，打磨术语，并就地更新 `CONTEXT.md` 与 ADR |
| [`triage`](plugins/mattpocock-engineering-skills/skills/triage/SKILL.md) | 按 triage 角色状态机处理 issue |
| [`improve-codebase-architecture`](plugins/mattpocock-engineering-skills/skills/improve-codebase-architecture/SKILL.md) | 基于 `CONTEXT.md` 领域语言和 `docs/adr/` 决策，寻找代码库的架构深化机会 |
| [`setup-engineering-skills`](plugins/mattpocock-engineering-skills/skills/setup-engineering-skills/SKILL.md) | 脚手架每个仓库的配置（issue tracker、triage 标签、领域文档布局），供其他 engineering skill 消费。上游原名 `setup-matt-pocock-skills` |
| [`tdd`](plugins/mattpocock-engineering-skills/skills/tdd/SKILL.md) | 红-绿-重构循环的 TDD，按 vertical slice 逐片实现功能或修 bug |
| [`to-issues`](plugins/mattpocock-engineering-skills/skills/to-issues/SKILL.md) | 把任意 plan / spec / PRD 按 vertical slice 拆成可独立认领的 GitHub issue |
| [`to-prd`](plugins/mattpocock-engineering-skills/skills/to-prd/SKILL.md) | 把当前会话上下文整理成 PRD 并提交为 GitHub issue |
| [`zoom-out`](plugins/mattpocock-engineering-skills/skills/zoom-out/SKILL.md) | 让 agent 跳出细节，对不熟悉的代码给出更高层视角 |
| [`prototype`](plugins/mattpocock-engineering-skills/skills/prototype/SKILL.md) | 构建一次性原型验证设计：终端应用验证状态/业务逻辑，或单路由多 UI 变体切换 |

## Plugin 3：mattpocock-productivity-skills

来源与维护方式同上。

| Skill | 说明 |
| --- | --- |
| [`caveman`](plugins/mattpocock-productivity-skills/skills/caveman/SKILL.md) | 极简压缩沟通模式，砍掉填充词省 ~75% token，技术准确性不变 |
| [`grill-me`](plugins/mattpocock-productivity-skills/skills/grill-me/SKILL.md) | 对你的计划/设计穷追猛打地提问，直到决策树每个分支都有答案 |
| [`handoff`](plugins/mattpocock-productivity-skills/skills/handoff/SKILL.md) | 把当前会话压缩成交接文档，让另一个 agent 接着干 |
| [`teach`](plugins/mattpocock-productivity-skills/skills/teach/SKILL.md) | 以当前目录为有状态教学工作区，跨多个会话教会用户一项新技能或概念 |
| [`write-a-skill`](plugins/mattpocock-productivity-skills/skills/write-a-skill/SKILL.md) | 按正确结构、渐进披露和资源捆绑规范创建新 skill |

## 本地试用 / 开发模式

```bash
git clone https://github.com/jaymie9019/jaymie-claude-tools.git
claude --plugin-dir ./jaymie-claude-tools/plugins/jaymie-tools
```

`--plugin-dir` 指向单个 plugin 目录。启动后用 `/<skill-name>` 调用 user-invoked skill；`/help` 可以看到该插件下的所有 skill。修改插件内容后，在会话里运行 `/reload-plugins` 即可热加载，不需要重启。

## 维护

### 同步 jaymie9019/skills 仓库

`html-spec-workflow` 等自定义 skill 的更新在 [`jaymie9019/skills`](https://github.com/jaymie9019/skills) 仓库做，然后 vendor 到 `plugins/jaymie-tools/skills/` 下对应目录并提交。

### 同步 mattpocock/skills 上游

mattpocock 的 skill 以本仓库为准自行维护，不强制跟上游。如需参考上游更新：

```bash
git clone --depth 1 https://github.com/mattpocock/skills.git /tmp/mp-skills
# 对比后手动合并感兴趣的改动到 plugins/mattpocock-*-skills/skills/
```

注意：`setup-engineering-skills` 在上游叫 `setup-matt-pocock-skills`，`triage` / `to-issues` / `to-prd` 中的引用也已相应改名，同步时需保留这一改动。

### 发版

改动后 bump 对应 plugin 的 `plugin.json` version，commit + push 即可；安装方跑 `/plugin marketplace update jaymie-tools` + `/plugin update` 获取。

## 目录结构

```
jaymie-claude-tools/
├── .claude-plugin/
│   └── marketplace.json                     # Marketplace catalog（3 个 plugin）
├── plugins/
│   ├── jaymie-tools/
│   │   ├── .claude-plugin/plugin.json
│   │   ├── hooks/hooks.json                 # Hindsight lifecycle hooks
│   │   ├── scripts/run-hindsight-hook.sh
│   │   ├── tests/hindsight-hook-wrapper.test.sh
│   │   └── skills/
│   │       ├── print-sessionid/
│   │       ├── grok-search/
│   │       └── html-spec-workflow/
│   ├── mattpocock-engineering-skills/
│   │   ├── .claude-plugin/plugin.json
│   │   └── skills/                          # 10 个工程 skill
│   └── mattpocock-productivity-skills/
│       ├── .claude-plugin/plugin.json
│       └── skills/                          # 5 个效率 skill
└── README.md
```

约定：

- 所有功能用 `skills/<name>/SKILL.md`，不再使用 `commands/`（避免 `/plugin-name:` 前缀）
- User-invoked（用户主动 `/name` 调）→ 在 frontmatter 加 `disable-model-invocation: true`
- Model-invoked（model 根据上下文调）→ 不加该字段，并把 `description` 写清楚触发场景
- 需要跨会话自动运行的能力放对应 plugin 的 `hooks/hooks.json`，脚本放 `scripts/`，并用 `${CLAUDE_PLUGIN_ROOT}` 引用

## License

MIT。`mattpocock-*` 两个 plugin 的内容源自 [mattpocock/skills](https://github.com/mattpocock/skills)（MIT License）。
