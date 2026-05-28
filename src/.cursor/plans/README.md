# 🎯 任务目标

```plaintext
输入：stepN.md
↓
AI 自动：
1. 读取 stepN.md
2. 生成 plan
3. 写入 .cursor/plans/stepN-plan.md
4. 自动开始执行 todos
5. 记录执行日志
```

## 目录职责

| 路径 | 职责 |
|------|------|
| `.cursor/plans/` | AI 执行计划、正在进行的规划 |
| `doc/steps-dev.md` | 产品开发路线（长期有效） |
| `doc/steps/` | step 任务规格说明书 |

## Plan 文件命名规范

```
stepN-plan.md                    # step 执行计划（如 step1-plan.md）
{年月}-{简述}.plan.md            # 非 step 主题规划（如 2026-04-vite-migration.plan.md）
```

## Plan 文件结构模板

```yaml
---
name: stepN-任务简述
overview: 一句话描述任务目标
todos:
  - id: todo-1
    content: 具体任务描述
    status: pending
  - id: todo-2
    content: 具体任务描述
    status: pending
files:
  - packages/frontend/src/...
  - packages/backend/src/...
acceptance:
  - 验收标准1
  - 验收标准2
---

## 执行日志

### HH:MM - [agent: xxx]

**操作**: 简要描述
**文件**: affected files
**命令**: shell commands
**输出**: command output
**结果**: 完成/失败/跳过
**备注**: 关键发现

## 🧪 测试报告

### 测试环境

| 项目 | 值 |
|------|-----|
| 测试时间 | YYYY-MM-DD HH:MM |
| 测试人员 | Agent |
| 测试类型 | 实测验证 |

### 测试执行记录

#### TC-XXX: [测试场景]

**命令**:
```bash
curl -X POST http://localhost:3000/api/xxx ...
```

**预期结果**:
```json
{"success": true, ...}
```

**实际结果**:
```json
{"success": true, ...}
```

**状态**: ✅ PASS / ❌ FAIL

### 测试汇总

| 用例ID | 测试场景 | 状态 | 备注 |
|--------|---------|------|------|
| TC-001 | xxx | ✅ PASS | - |
| TC-002 | xxx | ❌ FAIL | 原因: xxx |

**总计**: X 通过 / Y 失败 / Z 跳过
```

---

## 详细执行日志格式说明

```
### HH:MM - [agent: <类型>]

**操作**: 简要描述
**文件**: affected files
**命令**: shell commands
**输出**: command output
**结果**: 完成/失败/跳过
**备注**: 关键发现
```

| 字段 | 说明 |
|------|------|
| HH:MM | 执行时间 |
| agent | 使用的 agent 类型：`fast` / `default` / `generalPurpose` |
| 操作 | 简要描述当前步骤 |
| 文件 | 读取/修改的文件 |
| 命令 | 执行的 shell 命令 |
| 输出 | 命令输出结果 |
| 结果 | `完成` / `失败` / `跳过` |
| 备注 | 踩坑记录、特殊决策等 |

## 工作流约定

1. **读取规格** → `doc/steps/stepN.md`
2. **生成 Plan** → Plan 模式生成 `.cursor/plans/stepN-plan.md`
3. **执行 Plan** → Agent 模式按 todos 执行
4. **验收闭环** → 对照验收标准确认完成

## 归档约定

- 所有 todos 完成后，可将 Plan 文件移至 `doc/steps/plans/` 或删除
- 不在 `.cursor/plans/` 中保留已完成的历史记录堆

## 强制约定

- 所有 `.cursor/plans/` 下的 plan 文件执行日志必须使用上述详细格式
- 日志按时间顺序记录，每步包含：时间、操作、执行内容（文件/命令）、结果
- 所有 `.cursor/plans/` 下的 plan 文件执行日志必须使用上述详细格式，并保存到 `doc/steps/plans/` 或删除

## 测试强制约定

1. **必须执行实测测试** - 不能只填写"✓"或"通过"，必须有实际执行的命令和输出
2. **测试报告必须完整** - Plan 文件必须包含 `## 🧪 测试报告` section
3. **每个用例都要验证** - step.md 中的每个测试用例都必须实际执行， 测试人员 Role 为 `Test Agent`
4. **失败必须记录** - FAIL 的用例必须说明原因
5. **测试报告内容要求**：
   - 测试环境（时间、人员、类型）
   - 每个用例的执行命令、预期结果、实际结果、状态
   - 测试汇总表格
