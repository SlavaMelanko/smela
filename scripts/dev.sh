#!/usr/bin/env bash
SESSION="smela-dev"

tmux new-session -d -s $SESSION -x "$(tput cols)" -y "$(tput lines)"

tmux split-window -h -t $SESSION

tmux send-keys -t $SESSION:0.0 "cd apps/api && bun run dev" Enter
tmux send-keys -t $SESSION:0.1 "cd apps/web && bun run dev" Enter

tmux attach-session -t $SESSION
