# Web

React SPA with a solid, well-designed architecture for a smooth user experience.

|                                                                            |                                                                                                       Latest Release                                                                                                        |                                                                                                      Build Status                                                                                                       |                                                                                                     Quality Gate                                                                                                      |                                                                                 Code Coverage                                                                                 |
| :------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  ![dev](https://img.shields.io/badge/%2F_dev-blue?style=flat&logo=GitHub)  |                                                                                                                                                                                                                             | [![Ubuntu](https://img.shields.io/github/actions/workflow/status/SlavaMelanko/smela/web-ci-ubuntu.yml?branch=dev&label=ubuntu&logo=ubuntu)](https://github.com/SlavaMelanko/smela/actions/workflows/web-ci-ubuntu.yml)  | [![sonar](https://img.shields.io/sonar/quality_gate/SlavaMelanko_smela?server=https%3A%2F%2Fsonarcloud.io&branch=dev&logo=sonarqubecloud&label=sonar)](https://sonarcloud.io/summary/new_code?id=SlavaMelanko_smela)  | [![codecov](https://codecov.io/github/SlavaMelanko/smela/branch/dev/graph/badge.svg?token=LDY1C7havD&flag=web&label=Coverage)](https://codecov.io/github/SlavaMelanko/smela)  |
| ![main](https://img.shields.io/badge/%2F_main-blue?style=flat&logo=GitHub) | [![GitHub Release](https://img.shields.io/github/v/release/SlavaMelanko/smela?filter=web%2F*&display_name=release&style=flat&logo=rocket&logoColor=white&color=blue)](https://github.com/SlavaMelanko/smela/releases?q=web) | [![Ubuntu](https://img.shields.io/github/actions/workflow/status/SlavaMelanko/smela/web-ci-ubuntu.yml?branch=main&label=ubuntu&logo=ubuntu)](https://github.com/SlavaMelanko/smela/actions/workflows/web-ci-ubuntu.yml) | [![sonar](https://img.shields.io/sonar/quality_gate/SlavaMelanko_smela?server=https%3A%2F%2Fsonarcloud.io&branch=main&logo=sonarqubecloud&label=sonar)](https://sonarcloud.io/summary/new_code?id=SlavaMelanko_smela) | [![codecov](https://codecov.io/github/SlavaMelanko/smela/branch/main/graph/badge.svg?token=LDY1C7havD&flag=web&label=Coverage)](https://codecov.io/github/SlavaMelanko/smela) |

## 📋 Prerequisites

- [Git](https://git-scm.com/) version control
- [Bun](https://bun.sh/) runtime (latest version)

See [CI workflow](../../.github/workflows/web-ci-ubuntu.yml) for more details.

## 🛠️ Build and Run

### 1. Install dependencies

```zsh
bun install
```

### 2. Environment setup

See [`.env.example`](.env.example) to configure required variables.

### 3. Start development server

```zsh
bun run dev
```

Open your browser and navigate to <http://localhost:5173>.
