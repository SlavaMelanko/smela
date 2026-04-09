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

# Panes layout:
#  ┌──────────────┬─────────────┐
#  │              │     Web     │ 40%
#  │  smela API   │    (0.2)    │
#  │    (0.0)     ├─────────────┤
#  │     80%      │    Admin    │ 40%
#  │              │    (0.3)    │
#  ├──────────────├─────────────┤
#  │   Drizzle    │  i18n Sync  │ ~15-20%
#  │  Studio(0.1) │    (0.4)    │
#  └──────────────┴─────────────┘

# 1. Split main: left column (50%) | right column (50%)
tmux split-window -h -p 50 -t $SESSION

# 2. Split left column: API (80%) | Drizzle Studio (15%)
tmux select-pane -t $SESSION:0.0
tmux split-window -v -p 15

# 3. Work on right pane for Web/Admin/i18n
tmux select-pane -t $SESSION:0.2

# Web (40%)
tmux split-window -v -p 60

# Select remaining (bottom 60%)
tmux select-pane -t $SESSION:0.3

# Admin (40% of total → 66% of remaining)
tmux split-window -v -p 33

# Titles
tmux select-pane -t $SESSION:0.0 -T "smela API"
tmux select-pane -t $SESSION:0.1 -T "Drizzle Studio"
tmux select-pane -t $SESSION:0.2 -T "smela Web"
tmux select-pane -t $SESSION:0.3 -T "smela Admin"
tmux select-pane -t $SESSION:0.4 -T "i18n Sync"

# Commands
tmux send-keys -t $SESSION:0.0 "cd apps/api && bun run dev" Enter
tmux send-keys -t $SESSION:0.1 "cd apps/api && bun run db:ui" Enter
tmux send-keys -t $SESSION:0.2 "cd apps/web && bun run dev" Enter
tmux send-keys -t $SESSION:0.3 "cd apps/admin && bun run dev" Enter
tmux send-keys -t $SESSION:0.4 "cd packages/i18n && bun run sync:watch" Enter

tmux attach-session -t $SESSION
