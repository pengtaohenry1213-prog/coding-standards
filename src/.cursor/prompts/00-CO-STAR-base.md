# CO-STAR Prompt 基础规范

本文档定义了所有 Cursor Agent Prompt 的 CO-STAR 框架规范，所有 prompt 文件应遵循本规范中的统一格式。

---

## CO-STAR 六要素

### C — Context（背景）

提供任务的业务背景、技术上下文和约束条件，帮助 AI Agent 理解当前所处的环境。

### O — Objective（目标）

清晰定义本次任务的具体目标和成功标准，避免模糊请求。

### S — Style（风格）

指定 AI Agent 的代码风格和输出风格，通过引用 SOP 文档确保一致性。

**引用规范：**

- 前端：`docs/AI工程化开发手册/前端工程化 SOP（Vue3 + TS + Vben Admin）.md`
- 后端：`docs/AI工程化开发手册/后端工程化 SOP（Node.js + NestJS）.md`
- 数据库：`docs/AI工程化开发手册/数据库设计规范（AI 工程化版）.md`
- 安全：`docs/AI工程化开发手册/安全工程规范（AI 工程化版）.md`
- 测试：`docs/AI工程化开发手册/AI安全审查清单.md`

### T — Tone（语调）

设置 AI Agent 的沟通风格。本项目统一采用：

- **简洁**：直击要点，避免冗余描述
- **直接**：明确指示，不拐弯抹角
- **专业**：使用技术术语，但不故作高深

### A — Audience（受众）

明确 AI Agent 的角色定位：

- **Planner**：任务规划者，负责将需求拆解为可执行的 Plan
- **Frontend Developer**：前端开发者，负责 UI 实现
- **Backend Developer**：后端开发者，负责 API 和业务逻辑
- **Test Engineer**：测试工程师，负责验证功能正确性
- **Reviewer**：代码审查者，负责质量把关
- **Human Gate Reviewer**：Human Gate 审核者，负责关键节点的决策把关

### R — Response Format（响应格式）

所有 prompt 输出必须遵循统一格式。

---

## 统一响应格式

### 模式 A：执行型 Prompt

用于 Planner、Frontend、Backend、Test、Reviewer 等 Agent。

```markdown
## 1. Context（背景）
描述当前任务的背景信息。

## 2. Objective（目标）
明确本次任务的目标。

## 3. Input（输入）
描述执行所需输入。

## 4. Process（执行流程）
详细的执行步骤。

## 5. Output（输出物）
描述预期的输出产物。

## 6. Log Format（日志格式）
日志格式定义。

## 7. Git Commit（Git 提交规范）
Git 提交格式规范。

## 8. Hard Rules（强制规则）
必须遵守的硬规则。
```

### 模式 B：Gate 审核型 Prompt

用于 Human Gate 审核流程。

```
## 1. Context（背景）
描述审核的背景和触发时机。

## 2. Objective（审核目标）
明确审核的目标和标准。

## 3. Checklist（审核清单）
按维度分组的审核检查项。

## 4. Decision（决策格式）
统一的决策格式和判定标准。

## 5. Decision Record（决策记录）
审核决策的记录模板。

## 6. Closure（闭环要求）
审核后的闭环要求。

## 7. Prohibitions（禁止事项）
明确禁止的行为。
```

---

## 统一日志格式

所有 Agent 执行日志必须使用以下格式：

```
### HH:MM - [agent: {agent-type}]

- 操作：
- 文件：
- 执行：
- 结果：
```

**Agent 类型标识：**

- `planner` — Planner Agent
- `frontend` — Frontend Agent
- `backend` — Backend Agent
- `test` — Test Agent
- `reviewer` — Reviewer Agent
- `default` — 未分类操作

---

## 统一 Git 提交规范

### 提交格式

```ts
<type>(stepN): <description>

<optional body>
```

### 提交类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(step1): 完成 todo-1` |
| `fix` | 缺陷修复 | `fix(step2): 修复 todo-3` |
| `test` | 测试相关 | `test(step1): 补充 todo-2 测试` |
| `refactor` | 重构 | `refactor(step3): 重构 todo-1` |
| `docs` | 文档更新 | `docs(step1): 更新 README` |
| `chore` | 构建/工具 | `chore(step1): 更新依赖` |

### 分支命名

```ts
feat/step{N}-{short-description}
fix/step{N}-{short-description}
```

---

## 统一决策格式

所有 Human Gate 审核统一使用以下决策结果：

| 决策 | 含义 | 后续动作 |
|------|------|----------|
| **PASS** | 所有检查项通过，可继续执行 | 进入下一环节 |
| **CONDITIONAL** | 存在非关键问题，需记录整改措施 | 记录整改要求后继续，限期闭环 |
| **REJECT** | 存在关键阻塞问题 | 必须修复后方可继续 |

### 决策记录模板

```markdown
## 审核决策记录

| 字段 | 内容 |
|------|------|
| 审核类型 | |
| 提交时间 | |
| 决策结果 | PASS / CONDITIONAL / REJECT |
| 决策依据 | |
| 整改要求（如有） | |
| 整改期限（如有） | |
| 审核人 | |
```

---

## 统一硬规则

### 文件操作禁令

- 禁止删除未在 Plan 中声明的文件
- 禁止修改项目根目录外的文件
- 禁止创建可执行文件（.exe, .dmg 等）

### 命令执行禁令

- 禁止执行未在 Plan 中声明的 shell 命令
- 禁止使用危险命令：`rm -rf /`, `dd`, `mkfs`, `chmod 777`, `sudo` 等
- 禁止执行破坏性数据库操作

### 代码安全强制

- 禁止硬编码密钥、Token、密码
- 禁止在代码中写入敏感信息
- 禁止引入未经过安全审查的依赖

### 数据安全强制

- 禁止在日志中输出用户敏感信息
- 禁止将敏感数据写入本地文件
- API 响应必须经过脱敏处理

### 失败处理

- 任何执行失败必须记录错误原因
- 不允许静默失败或跳过错误
- 失败后必须尝试自动恢复或回滚

---

## Todo 类型定义

所有 Todo 必须指定以下类型之一：

| Type | 说明 | 对应 Agent |
|------|------|-----------|
| `frontend` | 前端 UI 开发 | Frontend Agent |
| `backend` | 后端 API 开发 | Backend Agent |
| `test` | 测试用例编写/执行 | Test Agent |
| `fix` | 缺陷修复 | 对应原模块 Agent |
| `refactor` | 重构 | 对应原模块 Agent |
| `docs` | 文档更新 | Planner Agent |

---

## Human Gate 流程

### 双 Gate 机制

所有 Step 执行必须经过双 Human Gate 审核：

```bash
需求评审
    ↓
Human Gate 1（执行前审查）
    ↓
执行：Planner → Frontend → Backend → Test → Reviewer
    ↓
Human Gate 2（执行后验收）
    ↓
Git 提交
```

### Gate 职责划分

| Gate | 审核者 | 审核重点 |
|------|--------|----------|
| Gate 1 | PM + Security | 需求完整性 + 安全合规 |
| Gate 2 | PM + Tech Lead | 验收标准 + 质量把关 |

---

*本文档为所有 prompt 文件的基础规范，请遵循本规范中的统一格式和定义。*
