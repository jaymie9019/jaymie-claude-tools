# collect-html — 面板安装（一次性）

`collect-html` skill 收录产物后会生成 `~/collect-html/index.html`，**`file://` 直接打开就能浏览**——这一步零安装。

只有当你想要 **(a) 一个常驻、带漂亮域名的面板**，或 **(b) 在面板上点击「归档/删除」**时，才需要起一个后端。下面从简到繁三档，按需选。

> 前提：本机装了 [Bun](https://bun.sh)（`bun --version`）。

---

## 档位 1 ·  原生 Bun（最简，推荐先用）

后端直接跑在 host 上，symlink 天然解析到 `~` 下任何真文件，**不需要任何挂载**。

```bash
bun ~/.claude-plugin-or-wherever/.../scripts/server.ts
# 实际路径用插件内的：
#   bun "${CLAUDE_PLUGIN_ROOT}/skills/collect-html/scripts/server.ts"
# 打开 http://localhost:4321
```

- 列表上的「归档/删除」即刻可用（删除 = 仅脱管，绝不动项目真文件）。
- 端口可改：`COLLECT_HTML_PORT=5000 bun server.ts`。
- 想常驻：用 `launchd` / `pm2` / `tmux` 把它守住即可。

代价：URL 是 `localhost:4321`，没有漂亮域名。要域名看档位 2。

---

## 档位 2 ·  Docker + OrbStack（要 `https://collect-html.orb.local` 这种域名）

OrbStack 会给容器自动分配 `https://<容器名>.orb.local` 域名。把后端容器化即可。

**关键约束（grilling 时踩过的坑）**：容器里的进程跟 symlink 时，是在**容器自己的文件系统**里找 target。所以必须把 `~` **按同样的绝对路径**挂进容器，symlink 才解析得到。

`docker-compose.yml`：

```yaml
services:
  collect-html:
    image: oven/bun:1
    container_name: collect-html
    working_dir: /app
    command: bun /app/server.ts
    environment:
      COLLECT_HTML_HOME: /Users/jaymie/collect-html
      COLLECT_HTML_PORT: "4321"
    volumes:
      # 脚本
      - ${HOME}/.../skills/collect-html/scripts:/app:ro
      # 存储目录（要写 manifest / 断 symlink）→ 可写
      - ${HOME}/collect-html:/Users/jaymie/collect-html:rw
      # 项目根（symlink 的 target 在这里）→ 只读、且挂到「同样的绝对路径」
      - /Users/jaymie:/Users/jaymie:ro
```

- OrbStack 启动后访问 `https://collect-html.orb.local`。
- 安全：写接口无鉴权，**只在本机/Orb 本地用，别对外暴露**；删除永远只脱管。
- 注意挂载顺序——`~/collect-html` 的可写挂载要在 `~` 只读挂载**之后/之上**生效（compose 里后写的优先），否则会被只读覆盖。

---

## 档位 3 ·  换静态服务器（如 nginx / Caddy）

`server.ts` 自带静态 serve + 归档/删除 API，通常够用。若你坚持要 nginx/Caddy：

- 它们只能 serve 静态文件（`index.html` + `links/`），**给不了「归档/删除」按钮**（无后端）。
- 同样受上面的「容器内 symlink 必须同路径挂载」约束。
- 这条路只适合「我只要看、不要在网页上操作」——那其实档位 1 的 `file://` 就够了。

---

## 校验

```bash
# 收一个测试产物
bun "${CLAUDE_PLUGIN_ROOT}/skills/collect-html/scripts/collect-html.ts" \
  add /path/to/some.html --project demo --title "demo" --keep
# 档位 1：
open http://localhost:4321
# 档位 2：
open https://collect-html.orb.local
```

> 改了 skill 内容后，在 Claude Code 里 `/reload-plugins` 热加载；若 bump 了
> `plugin.json` 的 version，用 `/plugin update` 重拉。
