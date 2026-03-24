# API

Layered monolithic REST API with authentication and RBAC, focused on security and modularity.

|                                                                            |                                                                     Latest Release                                                                      |                                                                                                    Build Status                                                                                                     |                                                                                 Code Quality                                                                                 |                                                                             Code Coverage                                                                              |
| :------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  ![dev](https://img.shields.io/badge/%2F_dev-blue?style=flat&logo=GitHub)  |                                                                                                                                                         | [![Ubuntu](https://img.shields.io/github/actions/workflow/status/SlavaMelanko/smela/api-ci-ubuntu.yml?branch=dev&label=ubuntu&logo=ubuntu)](https://github.com/SlavaMelanko/smela/actions/workflows/api-ci-ubuntu.yml)  | [![Codacy](https://img.shields.io/codacy/grade/e50177e068694eefb2e4e83b6859c8b8/dev?logo=codacy&label=codacy)](https://app.codacy.com/gh/SlavaMelanko/smela/dashboard)  | [![codecov](https://codecov.io/github/SlavaMelanko/smela/branch/dev/graph/badge.svg?token=LDY1C7havD&flag=api&label=Coverage)](https://codecov.io/github/SlavaMelanko/smela)  |
| ![main](https://img.shields.io/badge/%2F_main-blue?style=flat&logo=GitHub) | [![GitHub Release](https://img.shields.io/github/v/release/SlavaMelanko/smela?filter=api/*&label=release)](https://github.com/SlavaMelanko/smela/releases?q=api) | [![Ubuntu](https://img.shields.io/github/actions/workflow/status/SlavaMelanko/smela/api-ci-ubuntu.yml?branch=main&label=ubuntu&logo=ubuntu)](https://github.com/SlavaMelanko/smela/actions/workflows/api-ci-ubuntu.yml) | [![Codacy](https://img.shields.io/codacy/grade/e50177e068694eefb2e4e83b6859c8b8/main?logo=codacy&label=codacy)](https://app.codacy.com/gh/SlavaMelanko/smela/dashboard) | [![codecov](https://codecov.io/github/SlavaMelanko/smela/branch/main/graph/badge.svg?token=LDY1C7havD&flag=api&label=Coverage)](https://codecov.io/github/SlavaMelanko/smela) |

## 📋 Prerequisites

- [Git](https://git-scm.com/) version control
- [Docker](https://www.docker.com/) for running PostgreSQL
- [Bun](https://bun.sh/) runtime (latest version)
- Email service account ([Resend](https://resend.com/) for production, [Ethereal](https://ethereal.email/) for development)

## 🛠️ Build and Run

### 1. Install dependencies

```zsh
bun install
```

### 2. Environment setup

See [`.env.example`](.env.example) to configure required variables.

### 3. Database setup

Start the development PostgreSQL container:

```zsh
bun run db:dev:up
```

Run all database setup steps at once (generate → migrate → seed):

```zsh
bun run db:init
```

Or look at [`package.json`](package.json) for individual steps.

### 4. Start development server

```zsh
bun run dev
```

Server will start on <http://localhost:3000> by default.

## 🔌 API Endpoints

See [Postman collection](postman.json) for detailed API endpoints.
