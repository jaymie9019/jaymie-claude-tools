# jaymie-claude-tools

Jaymie 个人 Claude Code 工具箱，按官方 [Plugin](https://code.claude.com/docs/en/plugins) 规范打包。本仓库**同时是 plugin 和 marketplace**——既可以用 `/plugin` 直接装，也可以用 `--plugin-dir` 本地调试。

## 包含内容

### Commands

| 命令 | 说明 |
| --- | --- |
| `/jaymie-claude-tools:print-sessionid` | 打印当前 Claude Code 会话的 session ID（Desktop / CLI 通用） |

### Skills

通过 git submodule 挂载 [`jaymie9019/skills`](https://github.com/jaymie9019/skills) 到 `skills/` 目录，统一在那个仓库维护、这里只引用。

| Skill | 说明 |
| --- | --- |
| `html-spec-workflow` | 用 HTML（而非 Markdown）作为 AI 协作的规格/计划/设计系统媒介。触发词：做计划、PRD、技术规格、脑暴、设计系统、用 HTML 写 spec 等 |

## 通过 `/plugin` 在 Claude Code 内安装（推荐）

在 Claude Code 会话里：

```
/plugin marketplace add jaymie9019/jaymie-claude-tools
/plugin install jaymie-claude-tools@jaymie-tools
```

之后用 `/plugin` 管理（启用/禁用/更新/卸载）。

**更新到最新版本**：

```
/plugin marketplace update jaymie-tools
```

> ⚠️ `skills/` 是 git submodule。如果发现通过 `/plugin install` 装好后 skills 内容为空（取决于 Claude Code 是否递归 clone submodule），改走下面的"本地试用 / 开发模式"。

## 本地试用 / 开发模式

```bash
# 注意：本仓库含 submodule，clone 时必须带 --recurse-submodules
git clone --recurse-submodules https://github.com/jaymie9019/jaymie-claude-tools.git
claude --plugin-dir ./jaymie-claude-tools
```

如果忘了带 `--recurse-submodules`，在仓库目录里补跑：

```bash
git submodule update --init --recursive
```

启动后用 `/jaymie-claude-tools:<command>` 调用任意命令；`/help` 可以看到本插件下的所有命令。修改插件内容后，在会话里运行 `/reload-plugins` 即可热加载，不需要重启。

## 维护：同步 skills 仓库

skills 仓库（`jaymie9019/skills`）有更新后：

```bash
cd ~/projects/jaymie-claude-tools
git submodule update --remote skills
git add skills && git commit -m "Bump skills submodule"
git push
```

## 目录结构

```
jaymie-claude-tools/
├── .claude-plugin/
│   ├── plugin.json              # Plugin manifest
│   └── marketplace.json         # Marketplace catalog (self-referencing)
├── commands/                    # User-invoked slash commands
│   └── print-sessionid.md
├── skills/                      # Submodule -> jaymie9019/skills
│   └── html-spec-workflow/
│       ├── SKILL.md
│       ├── prompts/
│       └── references/
├── .gitmodules
└── README.md
```

后续会扩展 `agents/`、`hooks/` 等目录。新 skill 直接在 [`jaymie9019/skills`](https://github.com/jaymie9019/skills) 维护。

## License

MIT
