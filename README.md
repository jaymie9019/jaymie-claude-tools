# jaymie-claude-tools

Jaymie 个人 Claude Code 工具箱，按官方 [Plugin](https://code.claude.com/docs/en/plugins) 规范打包。

## 包含内容

### Commands

| 命令 | 说明 |
| --- | --- |
| `/jaymie-claude-tools:print-sessionid` | 打印当前 Claude Code 会话的 session ID（Desktop / CLI 通用） |

## 本地试用

```bash
git clone https://github.com/jaymie9019/jaymie-claude-tools.git
claude --plugin-dir ./jaymie-claude-tools
```

启动后用 `/jaymie-claude-tools:<command>` 调用任意命令；`/help` 可以看到本插件下的所有命令。

修改插件内容后，在会话里运行 `/reload-plugins` 即可热加载，不需要重启。

## 通过 Marketplace 安装

把本仓库加入个人/团队 marketplace 后，使用 `/plugin install jaymie-claude-tools` 安装。

## 目录结构

```
jaymie-claude-tools/
├── .claude-plugin/
│   └── plugin.json          # Manifest
├── commands/                # User-invoked slash commands
│   └── print-sessionid.md
└── README.md
```

后续会扩展 `skills/`、`agents/`、`hooks/` 等目录。

## License

MIT
