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
tmux split-window -v -t $SESSION:0.2

tmux select-pane -t $SESSION:0.0 -T "smela API"
tmux select-pane -t $SESSION:0.1 -T "smela Web"
tmux select-pane -t $SESSION:0.2 -T "Drizzle Studio"
tmux select-pane -t $SESSION:0.3 -T "i18n Sync"

tmux send-keys -t $SESSION:0.0 "cd apps/api && bun run dev" Enter
tmux send-keys -t $SESSION:0.1 "cd apps/web && bun run dev" Enter
tmux send-keys -t $SESSION:0.2 "cd apps/api && bun run db:ui" Enter
tmux send-keys -t $SESSION:0.3 "cd packages/i18n && bun run sync:watch" Enter

tmux attach-session -t $SESSION
