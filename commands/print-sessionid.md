# Print Session ID

打印当前 Claude Code 会话的 session ID（Desktop / CLI 通用）。

执行以下 Bash 命令，并把结果**原样**输出给用户，不要做任何解释或多余文字：

```bash
echo "${CLAUDE_CODE_SESSION_ID:-${CLAUDE_SESSION_ID:-<not-set>}}"
```

说明：
- Desktop 注入 `CLAUDE_CODE_SESSION_ID`
- CLI 老版本可能用 `CLAUDE_SESSION_ID`
- 两个都没有时回退到 `<not-set>`
