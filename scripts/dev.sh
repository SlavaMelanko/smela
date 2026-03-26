#!/usr/bin/env bash
SESSION="smela-dev"

tmux kill-session -t $SESSION 2>/dev/null || true
tmux new-session -d -s $SESSION -x "$(tput cols)" -y "$(tput lines)"

tmux split-window -h -t $SESSION
tmux split-window -v -t $SESSION:0.1

tmux send-keys -t $SESSION:0.0 "cd apps/api && bun run dev" Enter
tmux send-keys -t $SESSION:0.1 "cd apps/web && bun run dev" Enter
tmux send-keys -t $SESSION:0.2 "bun run --filter @smela/api db:ui" Enter

tmux attach-session -t $SESSION
