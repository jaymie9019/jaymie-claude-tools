# jaymie-claude-tools

Jaymie 个人 Claude Code 工具箱，按官方 [Plugin](https://code.claude.com/docs/en/plugins) 规范打包。本仓库**同时是 plugin 和 marketplace**——既可以用 `/plugin` 直接装，也可以用 `--plugin-dir` 本地调试。

## 包含内容

主动调用的功能都以 Claude Code skill 形式实现，调用时**无需 plugin 前缀**（如 `/print-sessionid` 而非 `/jaymie-claude-tools:print-sessionid`）。后台能力通过 plugin hooks 自动注册。

| 功能 | 类型 | 说明 |
| --- | --- | --- |
| `/print-sessionid` | user-invoked | 打印当前 Claude Code 会话的 session ID（Desktop / CLI 通用） |
| `html-spec-workflow` | model-invoked | 用 HTML（而非 Markdown）作为 AI 协作的规格/计划/设计系统媒介。触发词：做计划、PRD、技术规格、脑暴、设计系统、用 HTML 写 spec 等 |
| Hindsight memory hooks | plugin hooks | 自动注册 `SessionStart` / `UserPromptSubmit` / `Stop`，复用本机 `~/.hindsight/claude-code/scripts/` 做记忆预热、召回和写入 |

> `html-spec-workflow` 由 model 根据上下文自动调用，无需手动触发；其源仓库在 [`jaymie9019/skills`](https://github.com/jaymie9019/skills)，定期 vendor 到本仓库 `skills/` 下。

## Hindsight 记忆 hooks

从 `0.3.0` 起，本插件自带 `hooks/hooks.json`。启用插件后，Claude Code 会在以下生命周期事件中调用 wrapper：

- `SessionStart` → `session_start.py`：检查 / 预热本机 Hindsight 服务
- `UserPromptSubmit` → `recall.py`：在处理用户 prompt 前召回相关记忆
- `Stop` → `retain.py`：在一轮结束后写入可复用记忆

wrapper 位于 `scripts/run-hindsight-hook.sh`，默认委托给：

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

## 通过 `/plugin` 在 Claude Code 内安装（推荐）

在 Claude Code 会话里：

```
/plugin marketplace add jaymie9019/jaymie-claude-tools
/plugin install jaymie-claude-tools@jaymie-tools
```

之后用 `/plugin` 管理（启用/禁用/更新/卸载）。

**更新到最新版本**：

```
/plugin marketplace update jaymie-tools     # 1. 拉最新的 marketplace catalog
/plugin update jaymie-claude-tools@jaymie-tools  # 2. 升级 plugin 本体（仅当 plugin.json 的 version 已 bump）
```

> 因为 `plugin.json` 设置了显式 `version` 字段，必须 bump 它（如 `0.2.0` → `0.2.1`）`/plugin update` 才会重拉。如果想"每次 commit 都算新版本"，可以删掉 manifest 里的 `version` 字段。

## 本地试用 / 开发模式

```bash
git clone https://github.com/jaymie9019/jaymie-claude-tools.git
claude --plugin-dir ./jaymie-claude-tools
```

启动后用 `/<skill-name>` 调用 user-invoked skill；`/help` 可以看到本插件下的所有 skill。修改插件内容后，在会话里运行 `/reload-plugins` 即可热加载，不需要重启。

## 维护：同步 skills 仓库

新 skill 或 skill 更新都在 [`jaymie9019/skills`](https://github.com/jaymie9019/skills) 仓库做。同步到本仓库：

```bash
# 1. 拉最新的 skills 仓库到临时位置
git clone --depth 1 https://github.com/jaymie9019/skills.git /tmp/skills-src

# 2. 用最新内容覆盖本仓库的 skills/（保留目录结构）
rm -rf ~/projects/jaymie-claude-tools/skills
cp -r /tmp/skills-src ~/projects/jaymie-claude-tools/skills
rm -rf ~/projects/jaymie-claude-tools/skills/.git

# 3. 提交 + 推送
cd ~/projects/jaymie-claude-tools
git add skills && git commit -m "Sync skills from jaymie9019/skills"
git push
rm -rf /tmp/skills-src
```

## 目录结构

```
jaymie-claude-tools/
├── .claude-plugin/
│   ├── plugin.json              # Plugin manifest
│   └── marketplace.json         # Marketplace catalog (self-referencing)
├── hooks/
│   └── hooks.json               # Plugin hooks，自动接入 Hindsight lifecycle
├── scripts/
│   └── run-hindsight-hook.sh    # Hindsight hook wrapper
├── skills/
│   ├── print-sessionid/         # User-invoked (disable-model-invocation)
│   │   └── SKILL.md
│   └── html-spec-workflow/      # Model-invoked (vendored from jaymie9019/skills)
│       ├── SKILL.md
│       ├── prompts/
│       └── references/
├── tests/
│   └── hindsight-hook-wrapper.test.sh
└── README.md
```

约定：
- 所有功能用 `skills/<name>/SKILL.md`，不再使用 `commands/`（避免 `/plugin-name:` 前缀）
- User-invoked（用户主动 `/name` 调）→ 在 frontmatter 加 `disable-model-invocation: true`
- Model-invoked（model 根据上下文调）→ 不加该字段，并把 `description` 写清楚触发场景
- 需要跨会话自动运行的能力放 `hooks/hooks.json`，脚本放 `scripts/`，并用 `${CLAUDE_PLUGIN_ROOT}` 引用

## License

MIT
