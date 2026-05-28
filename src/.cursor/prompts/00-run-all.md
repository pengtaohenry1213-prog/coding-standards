# 总控 Agent Prompt

本 prompt 负责从 step 自动完成整个开发流程（Human Gate → Plan → 开发 → 测试 → 审查 → Human Gate → 验收）。遵循 CO-STAR 框架的 Mode A 格式。

---

## 1. Context（背景）

本项目是 **AI 工程化开发项目**，采用 Human Gate 双审机制和 Plan 中间层架构。所有 Step 执行由总控 Agent 统一调度，按拓扑排序顺序执行各 Agent。

**Agent 角色**：
- Planner：任务规划者
- Frontend Developer：前端开发者
- Backend Developer：后端开发者
- Test Engineer：测试工程师
- Reviewer：代码审查者

---

## 2. Objective（目标）

从 `docs/steps/step{N}.md` 自动完成完整开发生命周期：

- Human Gate 1 审查（PMO + Security）
- Planner 生成 Plan
- 按拓扑排序执行 Plan（Frontend / Backend / Test / Fix Agent）
- 实测测试并生成报告
- Reviewer 审查
- Human Gate 2 审查（PMO + Security）
- 生成可追溯的 Git 历史

---

## 3. Input（输入）

| 输入 | 说明 |
|------|------|
| step 文件 | `docs/steps/step{N}.md` |
| Plan 模板 | `.cursor/prompts/plan-template.md` |
| Human Gate 规范 | `.cursor/prompts/pm-human-gate.md`、`security-human-gate.md` |
| Agent 规范 | `.cursor/prompts/01-planner.md`、`03-backend.md`、`04-test.md`、`05-reviewer.md` |

---

## 4. Process（执行流程）

### 0. Human Gate 1（执行前审查）

**PMO + Security Human Gate 评审**

执行 `pm-human-gate.md` 和 `security-human-gate.md`：

| 检查项 | 说明 |
|--------|------|
| 安全扫描 | 匹配 security-rules 所有禁令 |
| 合规校验 | 权限、脱敏、审计、等保 |
| 质量校验 | 可执行、可验收、可回溯 |

**决策结果**：PASS / CONDITIONAL / REJECT

> 如果 REJECT，停止执行，返回修正。

---

### 1. Planner — 生成 Plan

- 读取 stepN.md
- 生成 Plan
- 写入：`.cursor/plans/stepN-plan.md`

---

### 2. 执行 Plan（核心阶段）

- 读取 Plan 文件 `.cursor/plans/stepN-plan.md`
- 遍历 Plan 中 todos
- 先执行无依赖的 todo
- 有依赖的 todo → 等依赖完成再执行
- 并行执行时保证依赖顺序
- 根据 todo.type 自动分配 Agent（Frontend / Backend / Test / Fix）

#### 分派规则

| todo 类型 | 执行 Agent |
|----------|-----------|
| frontend | Frontend Agent |
| backend  | Backend Agent |
| test     | Test Agent |
| bug      | Fix Agent |

#### 执行步骤

对每个 todo：

1. 检查 depends_on 是否完成
2. 分配 Agent（根据 todo.type）
3. 执行任务
4. 修改代码
5. 写日志
6. 提交 git

```bash
git add .
git commit -m "{type}(stepN): 完成 {todo-id}"
```

---

### 3. Test Agent（实测验证）

**强制要求：必须执行实测测试并生成报告**

- 根据 step.md 中的测试用例表，逐个执行实测测试
- 每个用例必须执行实际命令（curl、npm test 等）
- 将测试报告写入 Plan 文件的 `## 测试报告` section

---

### 4. Reviewer Agent

- 审查所有变更
- 对照 acceptance 验收
- 检查是否全部完成
- 如果有失败 → 回到对应 Agent 修复，继续执行

---

### 5. Human Gate 2（执行后审查）

**PMO + Security Human Gate 复审**

| 检查项 | 说明 |
|--------|------|
| 结果校验 | 是否符合预期、无漏洞、无敏感数据 |
| 日志校验 | 操作已记录、可追溯 |

**决策结果**：PASS / CONDITIONAL / REJECT

> 如果 REJECT，执行回滚并修复。

---

### 6. 失败机制（闭环）

如果 Review 不通过：

- 回到对应 Agent（Frontend / Backend / Test / Fix）修复
- 重新执行 Review
- **最大重试次数**: 3 次
- **超时机制**: 单次 Review 不超过 5 分钟
- 超过限制 → 标记失败，人工介入

> 必须闭环：直到 Review 通过或达到重试上限

---

### 7. 验收阶段

- 对照 acceptance
- 确认全部完成

---

### 8. 最终提交（必须执行）

```bash
git add .
git commit -m "feat(stepN): 全部完成 + 验收通过"
```

---

## 5. Output（输出物）

- `.cursor/plans/stepN-plan.md` — Plan 文件
- `## 测试报告` section — 实测测试报告
- Git commit 历史

---

## 6. Log Format（日志格式）

所有 Agent 执行日志必须使用以下格式：

```
### HH:MM - [agent: {agent-type}]

- 操作：
- 文件：
- 执行：
- 结果：
```

**Agent 类型标识**：

| 类型 | 说明 |
|------|------|
| `planner` | Planner Agent |
| `frontend` | Frontend Agent |
| `backend` | Backend Agent |
| `test` | Test Agent |
| `reviewer` | Reviewer Agent |
| `default` | 未分类操作 |

---

## 7. Git Commit（Git 提交规范）

### 提交格式

```
<type>(stepN): <description>
```

### Commit 类型规范

| 类型 | 使用场景 |
|------|----------|
| `feat` | frontend / backend 功能 |
| `fix`  | bug 修复 |
| `test` | 测试相关 |

### 分支命名

```
feat/step{N}-{short-description}
fix/step{N}-{short-description}
```

---

## 8. Hard Rules（强制规则）

- **不允许跳步骤**
- **Human Gate 双审必须执行**
- **Plan 必须写入 `.cursor/plans/`**
- **每一步必须有日志**
- **所有 todo 必须完成**
- **每个 todo 必须独立 commit**
- **测试必须实测**：必须有实际执行的命令和输出
- **测试报告必须写入 Plan 文件**

---

## 附录：Agent 调度机制

### 调用方式

| Agent | 调用命令 | 说明 |
|-------|----------|------|
| Planner | `/planner stepN` | 生成 Plan |
| Frontend | `/frontend stepN` | 执行 frontend todos |
| Backend | `/backend stepN` | 执行 backend todos |
| Test | `/test stepN` | 执行测试并生成报告 |
| Reviewer | `/reviewer stepN` | 审查并验证 acceptance |

### 依赖管理

```yaml
# Plan 中的 todos 结构
todos:
  - id: todo-1
    type: frontend
    depends_on: []  # 无依赖，立即执行
  - id: todo-2
    type: backend
    depends_on: [todo-1]  # 依赖 todo-1
  - id: todo-3
    type: test
    depends_on: [todo-1, todo-2]  # 依赖多个
```

### 拓扑排序实现（Kahn's Algorithm）

```javascript
// 拓扑排序实现 - 生成 todo 执行顺序
function topologicalSort(todos) {
  const inDegree = new Map();
  const graph = new Map();

  // 初始化入度和邻接表
  todos.forEach(todo => {
    inDegree.set(todo.id, (todo.depends_on || []).length);
    graph.set(todo.id, []);
  });

  // 构建有向图（依赖关系）
  todos.forEach(todo => {
    (todo.depends_on || []).forEach(dep => {
      if (graph.has(dep)) {
        graph.get(dep).push(todo.id);
      }
    });
  });

  // Kahn's Algorithm: 从入度为 0 的节点开始
  const queue = [...todos.filter(t => inDegree.get(t.id) === 0)];
  const sorted = [];

  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);

    // 减少相邻节点的入度
    (graph.get(current.id) || []).forEach(neighbor => {
      const newDegree = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        const neighborTodo = todos.find(t => t.id === neighbor);
        if (neighborTodo) queue.push(neighborTodo);
      }
    });
  }

  // 检查是否有环（循环依赖）
  if (sorted.length !== todos.length) {
    console.error('检测到循环依赖，无法完成拓扑排序');
    return todos; // 返回原顺序
  }

  return sorted;
}
```

### CI 集成（终极形态）

```
push → 自动测试 → 自动验收 → 自动反馈
```
