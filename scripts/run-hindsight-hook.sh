#!/usr/bin/env sh
set -eu

debug() {
  case "${JAYMIE_HINDSIGHT_HOOK_DEBUG:-${HINDSIGHT_DEBUG:-}}" in
    1|true|TRUE|yes|YES) printf '%s\n' "$*" >&2 ;;
  esac
}

case "${JAYMIE_DISABLE_HINDSIGHT_HOOKS:-}" in
  1|true|TRUE|yes|YES)
    debug "[jaymie-claude-tools] Hindsight hooks disabled by JAYMIE_DISABLE_HINDSIGHT_HOOKS"
    exit 0
    ;;
esac

if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  debug "[jaymie-claude-tools] Skipping local Hindsight hook in remote Claude Code"
  exit 0
fi

script_name="${1:-}"
case "$script_name" in
  session_start.py|recall.py|retain.py) ;;
  *)
    debug "[jaymie-claude-tools] Refusing unknown Hindsight hook script: $script_name"
    exit 0
    ;;
esac

integration="${JAYMIE_HINDSIGHT_INTEGRATION:-claude-code}"
script="$HOME/.hindsight/$integration/scripts/$script_name"

if [ ! -f "$script" ]; then
  debug "[jaymie-claude-tools] Hindsight hook script not found: $script"
  exit 0
fi

exec python3 "$script"
