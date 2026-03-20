# Storybook

## ⚠️ Prerequisites

Before using Storybook, ensure that all dependencies are installed. Run the
following command to install the required packages:

```bash
pnpm install
```

## 📦 Setup

Storybook is already configured in this project. The `.storybook` folder
contains:

- `main.js`: Storybook settings, stories, and addons.
- `preview.jsx`: Global parameters and shared styles.
- `manager.js`: Custom Storybook UI theme.

## 🚀 Running Storybook

To start Storybook in development mode, run:

```bash
pnpm run stories
```

## 📘 Storybook Guidelines

> Stories should focus on showing the component’s different states—not
> reproducing full app flows, adding extra styles, or overengineering examples.

1. File naming: use the pattern `<Component>.stories.js`, where `<Component>` is
   the singular PascalCase component name, e.g. `Button.stories.js`
1. Keep examples simple. Avoid mock data, complex wrappers, or unnecessary logic
1. Don’t add separate `styles.scss` files in stories. Components must include
   their own styles internally
