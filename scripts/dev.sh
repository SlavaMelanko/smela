#!/usr/bin/env bash
SESSION="smela-dev"

if [[ "$1" == "--kill" ]]; then
  tmux kill-session -t $SESSION 2>/dev/null || true
  exit 0
fi

if tmux has-session -t $SESSION 2>/dev/null; then
  tmux attach-session -t $SESSION
  exit 0
fi

tmux new-session -d -s $SESSION -x "$(tput cols)" -y "$(tput lines)"

tmux split-window -h -t $SESSION
tmux split-window -v -t $SESSION:0.1

tmux select-pane -t $SESSION:0.0 -T "smela API"
tmux select-pane -t $SESSION:0.1 -T "smela Web"
tmux select-pane -t $SESSION:0.2 -T "Drizzle Studio"

tmux send-keys -t $SESSION:0.0 "cd apps/api && bun run dev" Enter
tmux send-keys -t $SESSION:0.1 "cd apps/web && bun run dev" Enter
tmux send-keys -t $SESSION:0.2 "bun run --filter @smela/api db:ui" Enter

tmux attach-session -t $SESSION
