#!/usr/bin/env bash
SESSION="smela-e2e"
E2E_CMD="e2e"

if [[ "$1" == "--ui" ]]; then
  E2E_CMD="e2e:ui"
elif [[ "$1" == "--kill" ]]; then
  tmux kill-session -t $SESSION 2>/dev/null || true
  exit 0
fi

if tmux has-session -t $SESSION 2>/dev/null; then
  tmux kill-session -t $SESSION
fi

tmux new-session -d -s $SESSION -x "$(tput cols)" -y "$(tput lines)"
tmux split-window -h -t $SESSION

tmux select-pane -t $SESSION:0.0 -T "smela API"
tmux select-pane -t $SESSION:0.1 -T "smela E2E"

tmux send-keys -t $SESSION:0.0 "bun run --cwd apps/api dev" Enter
tmux send-keys -t $SESSION:0.1 "bun run --cwd apps/web $E2E_CMD" Enter

tmux attach-session -t $SESSION
