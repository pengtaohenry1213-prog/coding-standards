# 开发路线（通用模板）

本文档是**通用产品实现步骤与 Agent 执行指南**，由 TechLead 维护，可适配任意前后端一体化项目。遵循 CO-STAR 框架的 Mode A 格式。

---

## 1. Context（背景）

本项目采用 **Plan 中间层** 架构，核心逻辑是"先规划再执行"，让"做什么"和"怎么做"解耦。每次执行 step 前，先用 Plan 模式生成 `.cursor/plans/step{N}-plan.md`，再由 Agent 执行。

**阶段划分**：
- workflow-dashboard 管理：init ~ initialization
- Cursor 管理：development ~ iteration

---

## 2. Objective（目标）

提供通用的产品实现步骤和 Agent 执行指南：

- 定义生命周期阶段划分
- 定义 Agent 执行方案（Plan 中间层）
- 定义通用开发阶段划分
- 提供执行进度追踪模板

---

## 3. Input（输入）

| 输入 | 说明 |
|------|------|
| step 文件 | `docs/steps/step{N}.md` |
| Plan 模板 | `.cursor/prompts/plan-template.md` |

---

## 4. Process（执行流程）

### 生命周期阶段划分

| 阶段 ID | 阶段名称 | 管理位置 | 说明 |
|---------|----------|----------|------|
| init | 立项 | workflow-dashboard | 提案生成、市场分析、可行性评估 |
| requirement | 需求 | workflow-dashboard | 需求补充、差距分析、PRD |
| architecture | 架构 | workflow-dashboard | 系统架构设计、AI模块设计 |
| initialization | 初始化 | **交接点** | 项目脚手架 + Cursor Rules 配置 |
| development | 开发 | Cursor | 前端组件、后端 API 开发 |
| testing | 测试 | Cursor | AI测试设计、单元测试、集成测试 |
| acceptance | 验收 | Cursor | 验收报告生成、review、导出 |
| packaging | 打包 | Cursor | Dockerfile、部署脚本、构建验证 |
| deployment | 部署 | Cursor | 多环境部署、本地调试 |
| operation | 运维 | Cursor | 日志分析、监控告警、热更新 |
| iteration | 迭代 | Cursor | 需求收集、优化、开发 |

> **workflow-dashboard 管理 init ~ initialization**，**Cursor 管理 development ~ iteration**

---

### Agent 执行方案（Plan 中间层）

#### 通用工作流（适配所有 step）

| 顺序 | 步骤 | 通用说明 |
| --- | --- | --- |
| 1 | 读取规格 | 读取 `docs/steps/step{N}.md`，明确当前 step 的**任务目标、约束、验收标准** |
| 2 | 生成 Plan | 按 Plan 模板生成 `.cursor/plans/step{N}-plan.md`，包含 todos + 文件清单 + 验收标准 |
| 3 | 执行 Plan | Agent 模式按 todos 顺序执行代码/配置，全程对齐 Plan 内容 |
| 4 | 验收闭环 | 对照 Plan 中的验收标准逐项验证，通过后更新进度追踪表 |

#### Plan 中间层的通用价值

- **规格与执行解耦**：`step{N}.md` 定义「做什么」，`step{N}-plan.md` 定义「怎么做、做成什么样」
- **减少执行偏差**：todos 作为执行路线图，避免遗漏步骤或误解需求
- **可追溯性**：Plan 文件存档，便于回溯"当时为什么这么实现"（比对话记录更清晰）

---

### 通用开发阶段划分

#### 阶段划分与通用依赖逻辑

| 阶段 | 核心目标 | 通用依赖逻辑 |
| --- | --- | --- |
| 第零阶段：项目初始化 | 搭建基础工程结构 | 所有开发的前置，完成工程化配置（如 monorepo、公共包、基础环境） |
| 第一阶段：基础搭建 | 前后端基础项目初始化 | 前后端可同期执行，互不依赖，完成框架、路由、中间件、测试基础等核心配置 |
| 第二阶段：核心功能链路 | 实现端到端核心业务逻辑 | 遵循「后端 API 优先」原则（避免前端 Mock 返工），后端完成后再开发对应前端功能 |
| 第三阶段：集成 + 优化 | 联调与稳定性保障 | 所有组件/API 就位后整合，补充异常处理、配置管理、第三方服务接入等 |

#### 阶段排序的通用原则

1. 「项目初始化」先于一切：工程结构是所有开发的前提，后续阶段均依赖此阶段配置
2. 「后端 API 先行」：前端直接调用真实接口，避免 Mock 与真实数据格式不一致的返工
3. 「前后端基础同期」：前端/后端基础搭建无依赖关系，可并行推进
4. 「整合优化后置」：所有核心功能完成后再整合，减少反复调整

---

### 各阶段通用模板

#### 第零阶段：项目初始化（通用模板）

| step | 通用任务目标 | 项目专属配置（示例） |
| --- | --- | --- |
| step0 | 搭建工程化基础结构 | 如：pnpm workspace 配置、shared 包、环境变量基础 |

> 专属说明：step0 详情参见 `docs/steps/step0.md`（项目专属）

#### 第一阶段：基础搭建（通用模板）

| step | 通用任务目标 | 项目专属配置（示例） |
| --- | --- | --- |
| step1 | 前端基础项目初始化 | 如：Vue3+TS+Vite / React+TS+Webpack 基础配置（路由、状态管理、请求封装） |
| step{N} | 测试框架基础设施搭建 | 如：Vitest/Jest（前端）、Jest/Mocha（后端）单元测试配置 |
| step{M} | 后端基础项目初始化 | 如：Express/NestJS/Koa + TypeScript 基础结构与中间件 |

#### 第二阶段：核心功能链路（通用模板）

| step | 通用任务目标 | 项目专属配置（示例） |
| --- | --- | --- |
| step{X} | 后端核心 API 开发 | 如：业务核心接口（上传、检索、对话等）、核心服务实现 |
| step{Y} | 前端核心组件/函数开发 | 如：对应后端 API 的 UI 组件、请求封装、交互效果实现 |

#### 第三阶段：集成 + 优化（通用模板）

| step | 通用任务目标 | 项目专属配置（示例） |
| --- | --- | --- |
| step{Z} | 前后端组件/接口整合 | 如：前端组件整合到页面、端到端联调 |
| step{A} | 稳定性/扩展性优化 | 如：异常处理、日志、配置管理、第三方服务接入、历史数据管理 |

---

## 5. Output（输出物）

- 执行进度追踪表（状态更新）
- Plan 文件（`.cursor/plans/step{N}-plan.md`）

---

## 6. 执行进度追踪表（模板）

| step | 状态 | 角色分类 | 负责人 | Plan 文件路径 | 完成日期 |
| --- | --- | --- | --- | --- | --- |
| step{N} | ✅ 完成/🔄 进行中/⬜ 待开始 | 参考「角色对应规则」| xxx | `.cursor/plans/step{N}-plan.md` | yyyy-mm-dd |

### 状态/角色通用说明

- **状态说明**：✅ 已完成、🔄 进行中、⬜ 待开始（执行完 step 后即时更新）
- **角色通用分类**（可扩展）：

| 角色分类 | 通用职责 |
| --- | --- |
| Backend | 后端 API/服务/中间件开发 |
| Frontend | 前端基础配置/工具函数开发 |
| Frontend（UI） | 前端组件/页面/交互效果开发 |
| Frontend（集成） | 前后端联调/组件整合 |
| DevOps | 工程化/环境/部署配置 |
