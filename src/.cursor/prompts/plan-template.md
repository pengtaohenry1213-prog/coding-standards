# Plan 模板（项目/功能整体规划）

本模板用于生成项目或功能的整体规划 Plan。遵循 CO-STAR 框架的 Mode A 格式。

---

## 1. Context（背景）

Plan 是连接"需求"和"执行"的中间层。对应 `steps-dev.md` 的"开发阶段核心目标"，Plan 负责定义"怎么做、做成什么样"。

---

## 2. Objective（目标）

生成结构化的项目/功能整体规划 Plan，输出到 `.cursor/plans/step{N}-plan.md`。

---

## 3. Input（输入）

| 输入 | 说明 |
|------|------|
| stepN.md | 当前 step 的规格文档 |
| steps-dev.md | 开发阶段划分参考 |

---

## 4. Process（执行流程）

1. 读取 stepN.md，明确任务目标
2. 按 Plan 模板生成 `.cursor/plans/step{N}-plan.md`
3. 包含 todos、files、acceptance

---

## 5. Output（输出物）

### Plan 核心目标

（对应 steps-dev.md 的"开发阶段核心目标"，一句话说明本 Plan 要达成的最终结果）

### 阶段划分

参考 steps-dev.md 的 4 个阶段逻辑：

| 阶段序号 | 阶段名称 | 阶段依赖 | 阶段产出物 | 预估耗时 |
|----------|----------|----------|------------|----------|
| Stage 1 | | | | |
| Stage 2 | | | | |
| Stage 3 | | | | |
| Stage 4 | | | | |

### 关键依赖与风险

（列出影响 Plan 落地的核心依赖、潜在风险及应对方案）

### 验收标准

（明确 Plan 完成的判定条件，需可量化、可验证）

### Todos（Plan 内包含）

```yaml
todos:
  - id: todo-1
    type: frontend / backend / test / fix
    content: 具体任务描述
    depends_on: []
  - id: todo-2
    type: frontend / backend / test / fix
    content: 具体任务描述
    depends_on: [todo-1]
```

### Files（涉及文件）

| 文件 | 操作类型 | 说明 |
|------|----------|------|
| src/xxx.ts | 新增 / 修改 | 功能说明 |

### Acceptance（验收标准）

| 验收项 | 验证方式 | 状态 |
|--------|----------|------|
| | | |

---

## 6. Log Format（日志格式）

```
### HH:MM - [agent: planner]

- 操作：生成 Plan
- 文件：.cursor/plans/step{N}-plan.md
- 执行：读取 stepN.md → 生成 Plan
- 结果：完成
```

---

## 7. Git Commit（Git 提交规范）

```
feat(step{N}): 生成 Plan
```

---

## 8. Hard Rules（强制规则）

- **Plan 必须写入 `.cursor/plans/`**
- **每个 todo 必须标明 type**
- **acceptance 必须覆盖 stepN.md 中的验收点**
- **不允许省略任何字段**
