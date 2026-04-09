#!/usr/bin/env bash

SESSION="smela-dev"

if tmux has-session -t $SESSION 2>/dev/null; then
  tmux attach-session -t $SESSION
  exit 0
fi

tmux new-session -d -s $SESSION -x "$(tput cols)" -y "$(tput lines)"

# Panes layout:
#  ┌──────────────┬─────────────┐
#  │              │     Web     │ 40%
#  │  smela API   │    (0.1)    │
#  │    (0.0)     ├─────────────┤
#  │    100%      │    Admin    │ 40%
#  │              │    (0.2)    │
#  │              ├─────────────┤
#  │              │  i18n Sync  │ ~20%
#  │              │    (0.3)    │
#  └──────────────┴─────────────┘

# 1. Split main: left column (50%) | right column (50%)
tmux split-window -h -p 50 -t $SESSION

# 2. Work on right pane for Web/Admin/i18n
tmux select-pane -t $SESSION:0.1

# Web (40%)
tmux split-window -v -p 60

# Select remaining (bottom 60%)
tmux select-pane -t $SESSION:0.2

# Admin (40% of total → 66% of remaining)
tmux split-window -v -p 33

# Titles
tmux select-pane -t $SESSION:0.0 -T "smela API"
tmux select-pane -t $SESSION:0.1 -T "smela Web"
tmux select-pane -t $SESSION:0.2 -T "smela Admin"
tmux select-pane -t $SESSION:0.3 -T "i18n Sync"

# Commands
tmux send-keys -t $SESSION:0.0 "cd apps/api && bun run dev" Enter
tmux send-keys -t $SESSION:0.1 "cd apps/web && bun run dev" Enter
tmux send-keys -t $SESSION:0.2 "cd apps/admin && bun run dev" Enter
tmux send-keys -t $SESSION:0.3 "cd packages/i18n && bun run sync:watch" Enter

tmux attach-session -t $SESSION
