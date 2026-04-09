#!/usr/bin/env bash

# Default to web app
CALLER_APP="web"
E2E_CMD="e2e"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --admin)
      CALLER_APP="admin"
      shift
      ;;
    --web)
      CALLER_APP="web"
      shift
      ;;
    --ui)
      E2E_CMD="e2e:ui"
      shift
      ;;
    --kill)
      SESSION="smela-e2e-$CALLER_APP"
      tmux kill-session -t $SESSION 2>/dev/null || true
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

SESSION="smela-e2e-$CALLER_APP"
APP_NAME="smela $CALLER_APP"

if tmux has-session -t $SESSION 2>/dev/null; then
  tmux kill-session -t $SESSION
fi

tmux new-session -d -s $SESSION -x "$(tput cols)" -y "$(tput lines)"
tmux split-window -h -t $SESSION

tmux select-pane -t $SESSION:0.0 -T "smela API"
tmux select-pane -t $SESSION:0.1 -T "$APP_NAME E2E"

tmux send-keys -t $SESSION:0.0 "bun run --cwd apps/api dev" Enter
tmux send-keys -t $SESSION:0.1 "bun run --cwd apps/$CALLER_APP $E2E_CMD" Enter

tmux attach-session -t $SESSION
