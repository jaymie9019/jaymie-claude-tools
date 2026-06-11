#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WRAPPER="$ROOT/scripts/run-hindsight-hook.sh"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

export HOME="$TMP_DIR/home"
mkdir -p "$HOME/.hindsight/claude-code/scripts"

missing_output="$("$WRAPPER" recall.py <<<'{"prompt":"remember this"}')"
if [[ -n "$missing_output" ]]; then
  echo "expected missing Hindsight script to produce no stdout" >&2
  exit 1
fi

"$WRAPPER" "../bad.py" <<<'{}'

cat > "$HOME/.hindsight/claude-code/scripts/recall.py" <<'PY'
import sys

print(sys.stdin.read())
PY

actual="$(printf '{"prompt":"remember this"}' | "$WRAPPER" recall.py)"
if [[ "$actual" != '{"prompt":"remember this"}' ]]; then
  echo "expected wrapper to pass stdin through to Hindsight script" >&2
  echo "actual: $actual" >&2
  exit 1
fi

remote_output="$(printf '{"prompt":"remote"}' | CLAUDE_CODE_REMOTE=true "$WRAPPER" recall.py)"
if [[ -n "$remote_output" ]]; then
  echo "expected remote Claude Code environment to skip local Hindsight hooks" >&2
  exit 1
fi
