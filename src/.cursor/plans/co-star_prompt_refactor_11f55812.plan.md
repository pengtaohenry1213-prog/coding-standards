---
name: CO-STAR Prompt Refactor
overview: 将 .cursor/prompts/ 下的 23 个 .md 文件按 CO-STAR 框架重构，采用"混合方案"：保留现有工作流结构，增补 CO-STAR 中缺失且有价值的要素（C/S/T/A），统一 Response Format 格式。
todos:
  - id: new-base
    content: 新建 00-CO-STAR-base.md 基础规范文件
    status: completed
  - id: unify-format
    content: 统一 Response Format 为模式 A（执行型）和模式 B（Gate 审核型）
    status: pending
  - id: group1
    content: 改写执行核心文件：run-step.md, 00-run-all.md, steps-dev.md
    status: completed
  - id: group2
    content: 改写 Agent 执行文件：generate-plan.md, execute-plan.md, 01-planner.md, 03-backend.md, 05-reviewer.md
    status: completed
  - id: group3
    content: 改写 Gate 审核文件：human-gate.md, pm-human-gate.md, security-human-gate.md, tech-lead-human-gate.md, test-human-gate.md, pmo-human-gate-prompt.md（统一决策格式）
    status: completed
  - id: group4
    content: 改写规划模板文件：requirement-to-step.md, plan-template.md, step-template.md
    status: completed
  - id: group5
    content: 改写其他文件：04-test.md, plan-step-human-gate.md, security-hard-rules.prompt.md, other-templates.md, pm-plan-prompt.md
    status: completed
  - id: update-readme
    content: 更新 README.md 反映新文档结构
    status: completed
isProject: false
---

## 总体策略

采用 **"CO-STAR 混合方案"**：

- 保留现有工作流结构（步骤、日志、决策表、Git 提交格式）— 这些是高度定制化的执行指令
- 增补 CO-STAR 中缺失且有价值的要素：
  - **C (Context)** — 补充统一的背景章节
  - **S (Style)** — 新增代码风格指南章节
  - **T (Tone)** — 新增沟通语调章节
  - **A (Audience)** — 统一 AI Agent 角色定义
- **统一 Response Format** — 所有 prompt 文件采用一致的章节格式

## 第一步：制定统一的 Prompt 基础模板

新增一个 `00-CO-STAR-base.md` 文件作为所有 prompt 的基础规范，定义：

- `## Context` — 项目背景信息
- `## Objective` — 任务目标
- `## Style` — 代码风格指南（引用 SOP 文档）
- `## Tone` — 沟通语调（正式/简洁/直接）
- `## Audience` — AI Agent 角色定位
- `## Response Format` — 统一的输出格式（章节编号、日志格式、Git 提交格式）

## 第二步：统一 Response Format 格式

将现有 3 种 Response Format 统一为 2 种模式：

### 模式 A：执行型 Prompt（用于 execute-plan.md, 03-backend.md, 04-test.md, 05-reviewer.md 等）

使用数字编号章节：

```
## 1. Context（背景）
## 2. Objective（目标）
## 3. Input（输入）
## 4. Process（执行流程）
## 5. Output（输出物）
## 6. Log Format（日志格式）
## 7. Git Commit（Git 提交格式）
## 8. Hard Rules（强制规则）
```

### 模式 B：Gate 审核型 Prompt（用于所有 human-gate.md 文件）

使用统一模板：

```
## 1. Context（触发时机 + 审核背景）
## 2. Objective（审核目标）
## 3. Checklist（审核清单，按维度分组）
## 4. Decision（决策格式：PASS / CONDITIONAL / REJECT）
## 5. Decision Record（决策记录模板）
## 6. Closure（闭环要求）
## 7. Prohibitions（禁止事项）
```

**注意：** Decision 统一为 PASS / CONDITIONAL / REJECT（目前 test-human-gate 用 FAILED，pmo-human-gate 用 WARNING，tech-lead 用 APPROVED — 统一改为 PASS/REJECTED/CONDITIONAL 或 PASS/CONDITIONAL/REJECT）

## 第三步：逐文件改写

### 组 1：执行核心文件（3 个）

1. **[run-step.md](v2/apps/workflow-dashboard/.cursor/prompts/run-step.md)** — 改为模式 A，统一 7 个章节
2. **[00-run-all.md](v2/apps/workflow-dashboard/.cursor/prompts/00-run-all.md)** — 改为模式 A，作为主控制器增加 Style/Tone 章节
3. **[steps-dev.md](v2/apps/workflow-dashboard/.cursor/prompts/steps-dev.md)** — 改为模式 A，统一章节格式

### 组 2：Agent 执行文件（5 个）

1. **[generate-plan.md](v2/apps/workflow-dashboard/.cursor/prompts/generate-plan.md)** — 改为模式 A
2. **[execute-plan.md](v2/apps/workflow-dashboard/.cursor/prompts/execute-plan.md)** — 改为模式 A
3. **[01-planner.md](v2/apps/workflow-dashboard/.cursor/prompts/01-planner.md)** — 改为模式 A
4. **[03-backend.md](v2/apps/workflow-dashboard/.cursor/prompts/03-backend.md)** — 改为模式 A
5. **[05-reviewer.md](v2/apps/workflow-dashboard/.cursor/prompts/05-reviewer.md)** — 改为模式 A

### 组 3：Gate 审核文件（6 个）

1. **[human-gate.md](v2/apps/workflow-dashboard/.cursor/prompts/human-gate.md)** — 改为模式 B，统一为核心原则定义
2. **[pm-human-gate.md](v2/apps/workflow-dashboard/.cursor/prompts/pm-human-gate.md)** — 改为模式 B，决策改为 PASS/CONDITIONAL/REJECT
3. **[security-human-gate.md](v2/apps/workflow-dashboard/.cursor/prompts/security-human-gate.md)** — 改为模式 B
4. **[tech-lead-human-gate.md](v2/apps/workflow-dashboard/.cursor/prompts/tech-lead-human-gate.md)** — 改为模式 B，决策改为 PASS/CONDITIONAL/REJECT（从 APPROVED/REJECTED/CONDITIONAL 统一）
5. **[test-human-gate.md](v2/apps/workflow-dashboard/.cursor/prompts/test-human-gate.md)** — 改为模式 B，决策改为 PASS/CONDITIONAL/REJECT（从 PASSED/FAILED/CONDITIONAL 统一）
6. **[pmo-human-gate-prompt.md](v2/apps/workflow-dashboard/.cursor/prompts/pmo-human-gate-prompt.md)** — 改为模式 B，决策改为 PASS/CONDITIONAL/REJECT（从 PASSED/REJECTED/WARNING 统一）

### 组 4：规划与模板文件（3 个）

1. **[requirement-to-step.md](v2/apps/workflow-dashboard/.cursor/prompts/requirement-to-step.md)** — 改为模式 A
2. **[plan-template.md](v2/apps/workflow-dashboard/.cursor/prompts/plan-template.md)** — 改为模式 A，统一章节编号
3. **[step-template.md](v2/apps/workflow-dashboard/.cursor/prompts/step-template.md)** — 改为模式 A，保留 7 节结构但加上 CO-STAR 标签

### 组 5：其他文件（5 个）

1. **[04-test.md](v2/apps/workflow-dashboard/.cursor/prompts/04-test.md)** — 改为模式 A
2. **[plan-step-human-gate.md](v2/apps/workflow-dashboard/.cursor/prompts/plan-step-human-gate.md)** — 改为模式 B
3. **[security-hard-rules.prompt.md](v2/apps/workflow-dashboard/.cursor/prompts/security-hard-rules.prompt.md)** — 保持现有简洁格式，增加 Context 和 Objective
4. **[other-templates.md](v2/apps/workflow-dashboard/.cursor/prompts/other-templates.md)** — 改为模式 A（元模板目录）
5. **[pm-plan-prompt.md](v2/apps/workflow-dashboard/.cursor/prompts/pm-plan-prompt.md)** — 改为模式 A
6. **[背景.md](v2/apps/workflow-dashboard/.cursor/prompts/背景.md)** — 保留，作为概念性背景文档，无需 CO-STAR 化

## 第四步：新增基础规范文件

1. **新建 `00-CO-STAR-base.md`** — 作为所有 prompt 的基础规范，包含：
  - CO-STAR 六要素的完整定义
    - 统一的日志格式规范
    - 统一的 Git 提交规范
    - 统一的决策格式规范（PASS / CONDITIONAL / REJECT）
    - 统一的硬规则规范

## 第五步：更新 `README.md`

更新 `README.md` 以反映新的文档结构。

---

## 决策格式统一化

将所有 Human Gate 的决策结果从 3 种不一致的格式统一为：


| 原格式                               | 统一为                         |
| --------------------------------- | --------------------------- |
| PASSED / CONDITIONAL / FAILED     | PASS / CONDITIONAL / REJECT |
| APPROVED / REJECTED / CONDITIONAL | PASS / CONDITIONAL / REJECT |
| PASSED / REJECTED / WARNING       | PASS / CONDITIONAL / REJECT |


---

## 不使用 CO-STAR 的原因

以下文件**不适合** CO-STAR 框架：

- `背景.md` — 概念性说明文档，叙事风格
- `security-hard-rules.prompt.md` — 极度简洁的规则清单，CO-STAR 化反而增加冗余
- `human-gate.md` — 只有 10 行的哲学定义文档
- `step-template.md` — 7 节结构模板，每个节本身就是 CO-STAR 的某种要素
- `plan-template.md` — 阶段规划模板，结构已经合理

