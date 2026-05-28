# AI 代码工具 + Step 驱动开发 + 多 Agent 协作

## 核心定位

基于 AI 代码工具（Cursor）构建的自动化开发系统，通过 **Step 驱动开发** + **多 Agent 自动执行** + **Human Gate 双审** + **自验证闭环**，实现高效项目开发。

---

## CO-STAR Prompt 框架

本目录下的所有 prompt 文件遵循 **CO-STAR 框架**：

| 要素 | 说明 |
|------|------|
| **C - Context** | 背景信息，帮助 AI 理解当前环境 |
| **O - Objective** | 明确的任务目标和成功标准 |
| **S - Style** | 代码风格和输出风格 |
| **T - Tone** | 沟通语调（简洁、直接、专业） |
| **A - Audience** | AI Agent 角色定位 |
| **R - Response Format** | 统一的输出格式 |

详见 `00-CO-STAR-base.md`。

---

## 统一响应格式

### 模式 A：执行型 Prompt

用于 Planner、Frontend、Backend、Test、Reviewer 等 Agent。

```
## 1. Context（背景）
## 2. Objective（目标）
## 3. Input（输入）
## 4. Process（执行流程）
## 5. Output（输出物）
## 6. Log Format（日志格式）
## 7. Git Commit（Git 提交规范）
## 8. Hard Rules（强制规则）
```

### 模式 B：Gate 审核型 Prompt

用于 Human Gate 审核流程。

```
## 1. Context（背景）
## 2. Objective（审核目标）
## 3. Checklist（审核清单）
## 4. Decision（决策格式）
## 5. Decision Record（决策记录）
## 6. Closure（闭环要求）
## 7. Prohibitions（禁止事项）
```

---

## 统一决策格式

所有 Human Gate 审核统一使用以下决策结果：

| 决策 | 含义 | 后续动作 |
|------|------|----------|
| **PASS** | 所有检查项通过，可继续执行 | 进入下一环节 |
| **CONDITIONAL** | 存在非关键问题，需记录整改措施 | 记录整改要求后继续，限期闭环 |
| **REJECT** | 存在关键阻塞问题 | 必须修复后方可继续 |

---

## 系统规范

- Spec Coding 文档规范
- Human Gate 评审规范
- AI 代码工具规范

---

## 核心模板体系

系统聚焦 **规划、执行、排查、复盘** 4 类核心场景：

| 序号 | 场景 | 模板 |
|------|------|------|
| 1 | 做整体规划 | `plan-template.md` |
| 2 | 写单步任务 | `step-template.md` |
| 3 | 需求不清晰 | 需求澄清模板 |
| 4 | 写技术方案 | 技术方案设计模板 |
| 5 | 排查问题失败 | 故障排查模板 |
| 6 | 对比方案优劣 | 多方案对比模板 |
| 7 | 代码规范审查 | 代码审查模板 |
| 8 | 项目总结优化 | 项目复盘模板 |

---

## 运行模式

### 1. 一键运行（全自动模式）

一次性完成全流程自动执行，无需人工干预：

```bash
/run-all step1
```

**AI 自动完成**：Human Gate 1 → 生成 Plan → 分工执行 → 编写代码 → 自动化测试 → 代码审查 → Human Gate 2 → 验收

### 2. 调试模式（单步精准调试）

针对指定模块单独执行，方便开发调试：

```bash
/planner step1    # 规划模块
/frontend step1   # 前端模块
/backend step1    # 后端模块
/test step1       # 测试模块
/reviewer step1   # 审查模块
```

---

## Human Gate 双 Gate 流程

```
┌─────────────────────────────────────────────────────────────┐
│  PM 制定 Plan + Step                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Human Gate 1（执行前）                                       │
│  PMO + Security 评审                                         │
│  - 安全扫描、权限校验、脱敏审计                                  │
│  - 质量校验：可执行、可验收、可回溯                               │
│  结果：PASS / CONDITIONAL / REJECT                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  执行 Step → 生成产物                                         │
│  Planner → Frontend → Backend → Test → Reviewer             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Human Gate 2（执行后）                                       │
│  PMO + Security 复审                                        │
│  - 结果校验：无漏洞、无敏感数据                                  │
│  - 日志校验：操作已记录、可追溯                                  │
│  结果：PASS / CONDITIONAL / REJECT                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Prompts 文件清单

### 基础规范

| 文件 | 说明 |
|------|------|
| `00-CO-STAR-base.md` | CO-STAR 框架基础规范（所有 prompt 的规范源头） |
| `00-run-all.md` | AI Tech Lead — 总控 Agent |
| `run-step.md` | 自动化开发 Agent — 单步执行 |
| `steps-dev.md` | 开发路线（通用模板） |

### Agent 执行文件

| 文件 | 角色 | 说明 |
|------|------|------|
| `01-planner.md` | Planner Agent | 生成 Plan |
| `generate-plan.md` | Planner Agent | 生成 Plan（备选格式） |
| `execute-plan.md` | 执行 Agent | 执行 Plan |
| `03-backend.md` | Backend Agent | 后端开发 |
| `04-test.md` | Test Agent | 测试验证 |
| `05-reviewer.md` | Reviewer Agent | 代码审查 |

### Human Gate 审核文件

| 文件 | 角色 | 说明 |
|------|------|------|
| `human-gate.md` | Human Gate 哲学 | 核心要素定义 |
| `pm-human-gate.md` | PM Human Gate | 需求评审 |
| `pmo-human-gate-prompt.md` | PMO Human Gate | 项目管理评审 |
| `security-human-gate.md` | Security Human Gate | 安全评审 |
| `tech-lead-human-gate.md` | Tech Lead Human Gate | 技术评审 |
| `test-human-gate.md` | Test Human Gate | 测试评审 |
| `plan-step-human-gate.md` | 组合 Gate | Plan → Step 双 Gate |

### 规划与模板文件

| 文件 | 说明 |
|------|------|
| `requirement-to-step.md` | 需求 → Step 转换流程 |
| `plan-template.md` | Plan 模板（项目整体规划） |
| `step-template.md` | Step 模板（单步任务执行） |
| `pm-plan-prompt.md` | PM Agent — 项目经理 |
| `other-templates.md` | 其他模板速查 |
| `security-hard-rules.prompt.md` | 安全硬规则 |

### 概念性文档

| 文件 | 说明 |
|------|------|
| `背景.md` | 系统背景和概念说明 |

---

## 核心价值

```
本系统 = Step 驱动开发 + 多 Agent 自动执行 + Human Gate 双审 + 自验证闭环
```
