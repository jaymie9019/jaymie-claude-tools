# jaymie-claude-tools

Jaymie 个人 Claude Code 工具箱，按官方 [Plugin](https://code.claude.com/docs/en/plugins) 规范打包。

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

## 本地试用

```bash
# 注意：本仓库含 submodule，clone 时必须带 --recurse-submodules
git clone --recurse-submodules https://github.com/jaymie9019/jaymie-claude-tools.git
claude --plugin-dir ./jaymie-claude-tools
```

如果忘了带 `--recurse-submodules`，在仓库目录里补跑：

```bash
git submodule update --init --recursive
```

同步 skills 仓库最新内容：

```bash
git submodule update --remote skills
git add skills && git commit -m "Bump skills submodule"
```

启动后用 `/jaymie-claude-tools:<command>` 调用任意命令；`/help` 可以看到本插件下的所有命令。

修改插件内容后，在会话里运行 `/reload-plugins` 即可热加载，不需要重启。

## 通过 Marketplace 安装

把本仓库加入个人/团队 marketplace 后，使用 `/plugin install jaymie-claude-tools` 安装。

## 目录结构

```
jaymie-claude-tools/
├── .claude-plugin/
│   └── plugin.json              # Manifest
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
