# Step 执行总控 Prompt

本 prompt 负责从 step 直接完成开发全过程。遵循 CO-STAR 框架的 Mode A 格式。

---

## 1. Context（背景）

本项目采用 **Plan 中间层** 架构，执行前需先生成 Plan，再由 Agent 按 Plan 执行。step 文件（`docs/steps/step{N}.md`）由 architecture 阶段预生成，Cursor 打开项目目录后读取并执行。

Human Gate 双审机制贯穿整个执行流程，确保开发质量和安全合规。

**适用阶段**：development ~ iteration 阶段（init ~ initialization 阶段由 workflow-dashboard 管理）。

---

## 2. Objective（目标）

从 `docs/steps/step{N}.md` 自动完成以下流程：

- Human Gate 1 审查（按 step 类型决定是否执行）
- 生成 Plan → 执行 Plan → 实测测试 → 验收
- Human Gate 2 审查（按 step 类型决定是否执行）
- 最终 Git 提交
- 循环执行下一个 step

---

## 3. Input（输入）

| 输入 | 说明 |
|------|------|
| step 文件 | `docs/steps/step{N}.md`（项目目录内，预生成） |
| Plan 模板 | `.cursor/prompts/plan-template.md` |
| Human Gate 规范 | `.cursor/prompts/pm-human-gate.md`、`.cursor/prompts/security-human-gate.md` |

---

## 4. Process（执行流程）

### Step 0：Human Gate 1（执行前审查）

#### 根据 step 类型决定是否执行

| step 类型 | 是否执行 HG1 | 说明 |
|-----------|--------------|------|
| init ~ initialization 阶段 | 跳过 | 由 workflow-dashboard 管理，已有人工审批 |
| development ~ iteration 阶段 | 执行 | Cursor 执行时需要人工确认 |
| 测试/验收阶段 | 执行 | 需要 PMO + Security 复审 |

#### 执行 HG1 时

执行 `pm-human-gate.md` 和 `security-human-gate.md`：

| 检查项 | 说明 |
|--------|------|
| PMO 评审 | 需求完整性、验收标准、优先级 |
| Security 扫描 | 安全规则匹配、敏感数据检查 |

#### 决策结果

| 决策 | 含义 | 后续动作 |
|------|------|----------|
| **PASS** | 审查通过，可继续执行 | 进入 Step 1 |
| **CONDITIONAL** | 非核心项未达标 | 记录整改项，继续执行 |
| **REJECT** | 阻塞，必须修复 | 立即停止，等待人工签字确认 |

#### REJECT 硬性约束

- REJECT = 立即停止，不允许执行任何后续步骤
- 必须等待人工介入并签字确认
- 人工确认后，在 Plan 文件中记录：

```markdown
## Human Gate 1 确认记录

| 项目 | 内容 |
|------|------|
| 决策 | PASS |
| 签字确认 | [人工签字] |
| 整改说明 | ... |
| 确认时间 | YYYY-MM-DD HH:mm |
```

---

### Step 1：生成 Plan

- 读取 stepN.md
- 生成 Plan（参考 `.cursor/prompts/plan-template.md`）
- 保存到：`.cursor/plans/stepN-plan.md`

---

### Step 2：执行 Plan

- 读取刚生成的 Plan
- 按 todos 执行（使用 Kahn's Algorithm 进行拓扑排序）
- 修改代码
- 记录日志

---

### Step 3：实测测试（强制，必须执行）

**重要：不允许只填写"✓"或"通过"，必须有实际执行的命令和输出**

- 根据 step.md 中的测试用例表，逐个执行实测测试
- 每个用例必须执行实际命令（curl、npm test 等）
- 记录每个用例的：命令、预期结果、实际结果、状态
- 将测试报告写入 Plan 文件的 `## 测试报告` section

**实测测试示例**：

```bash
# 1. 启动服务
cd packages/backend && npm run dev &

# 2. 等待服务就绪
sleep 3

# 3. 执行 API 测试
curl -X POST http://localhost:3000/api/xxx \
  -H "Content-Type: application/json" \
  -d '{"question": "测试", "answer": "测试回复"}'

# 4. 验证返回结果
```

---

### Step 4：验收

- 对照 acceptance
- 检查测试报告中的所有用例是否 PASS
- 检查是否全部完成

---

### Step 5：Human Gate 2（执行后复审）

#### 根据 step 类型决定是否执行

| step 类型 | 是否执行 HG2 | 说明 |
|-----------|--------------|------|
| init ~ initialization 阶段 | 跳过 | 由 workflow-dashboard 管理 |
| development ~ testing 阶段 | 执行 | 需要复审确保质量 |
| acceptance 阶段 | 执行 | 验收需要最终确认 |
| packaging ~ iteration 阶段 | 跳过 | 部署运维阶段不需要双审 |

#### 执行 HG2 时

| 检查项 | 说明 |
|--------|------|
| PMO 复审 | 结果校验、日志校验 |
| Security 复审 | 无敏感数据泄露、无安全漏洞 |

#### 决策结果

| 决策 | 含义 | 后续动作 |
|------|------|----------|
| **PASS** | 复审通过 | 进入最终提交 |
| **REJECT** | 阻塞，需要修复 | 回滚或修复后重新审查 |

#### REJECT 处理

- 执行回滚或指定修复
- 重新执行 Step 3-4
- 重新通过 Human Gate 2

---

### Step 6：最终提交

- 更新 `docs/steps/` 中对应 step 的状态（标记为已完成）
- Plan 文件保存到 `.cursor/plans/stepN-plan.md`
- 完成后检查下一个 step 是否存在，存在则继续执行

```bash
git add .
git commit -m "feat(stepN): 全部完成 + 验收通过"
```

#### 循环执行

- step1 完成 → 检查 step2 是否存在
- step2 完成 → 检查 step3 是否存在
- 以此类推，直到所有 step 完成

---

## 5. Output（输出物）

- `.cursor/plans/stepN-plan.md` — Plan 文件
- `## 测试报告` section — 实测测试报告
- Git commit 历史

---

## 6. Log Format（日志格式）

```
### HH:MM - [agent: default]

- 操作：
- 文件：
- 执行：
- 结果：
```

---

## 7. Git Commit（Git 提交规范）

### 提交格式

```
<type>(stepN): <description>
```

### 提交类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(step1): 完成 todo-1 上传组件UI` |
| `fix` | 缺陷修复 | `fix(step1): 修复 todo-2 接口错误` |
| `test` | 测试相关 | `test(step1): 增加 todo-3 测试用例` |

### 分支命名

```
feat/step{N}-{short-description}
fix/step{N}-{short-description}
```

---

## 8. Hard Rules（强制规则）

- **不允许跳步骤**：必须按 Step 0 → 1 → 2 → 3 → 4 → 5 → 6 顺序执行
- **Human Gate 根据 step 类型决定**：开发阶段跳过，测试/验收阶段执行
- **REJECT = 阻塞**：Human Gate REJECT 时立即停止，等待人工签字
- **预生成模式**：stepN.md 由 architecture 阶段预生成，Cursor 只执行不生成
- **Plan 必须写入 `.cursor/plans/`**
- **每一步必须有日志**
- **所有 todo 必须完成**
- **测试必须实测**：必须有实际执行的命令和输出，不允许只填"✓"
- **测试报告必须完整**：Plan 文件必须包含 `## 测试报告` section
- **每个 todo 独立 commit**（开发分支）
- **最终提交必须通过 Human Gate 2**（如果需要）
- **循环执行**：完成当前 step 后自动检查下一个 step
