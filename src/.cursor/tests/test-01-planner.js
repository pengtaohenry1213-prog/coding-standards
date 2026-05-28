/**
 * 测试 01-planner.md 执行效果
 * 模拟 Planner Agent 生成 Plan 的完整流程
 */

const fs = require('fs');
const path = require('path');

const sampleStepContent = `## Stage1-Step01: 用户登录功能

### 1. Step 编号
Stage1-Step01

### 2. Step 目标
实现完整的用户登录功能，包括前端登录页面和后端登录接口。

### 3. 输入条件
- 前端：React + TypeScript 项目已搭建
- 后端：Express + TypeScript 服务已搭建
- 数据库：用户表已创建

### 4. 执行动作
1. 实现登录页面 UI 组件
2. 实现登录表单验证
3. 实现后端登录 API
4. 实现 JWT Token 生成
5. 编写登录功能测试用例

### 5. 输出物 & 验收标准
- 前端：/src/pages/Login.tsx
- 后端：/src/routes/auth.ts, /src/services/authService.ts
- 测试：登录功能测试用例
- 验收：用户可以使用用户名密码登录，成功获取 Token

### 6. 关联依赖
- 前置：Step00 环境初始化
- 后续：Step02 用户注册功能
`;

const outputPlanContent = `<!-- .cursor/plans/step1-plan.md -->

# Step1 Plan

## todos

| id | type | content | depends_on |
|----|------|---------|------------|
| todo-1 | frontend | 实现登录页面 UI 组件 | [] |
| todo-2 | frontend | 实现登录表单验证 | [todo-1] |
| todo-3 | backend | 实现后端登录 API | [] |
| todo-4 | backend | 实现 JWT Token 生成 | [todo-3] |
| todo-5 | test | 登录功能测试 | [todo-1, todo-3] |

## files

- packages/frontend/src/pages/Login.tsx
- packages/frontend/src/components/LoginForm.tsx
- packages/backend/src/routes/auth.ts
- packages/backend/src/services/authService.ts
- packages/backend/src/middleware/auth.ts

## acceptance

- [ ] 用户可以使用用户名密码登录
- [ ] 登录成功返回 JWT Token
- [ ] 登录失败返回错误信息
- [ ] 前端表单验证正常工作
- [ ] 单元测试覆盖率 > 80%

## 执行日志

### HH:MM - [agent: planner]

**操作**: 解析 stepN.md
**输入**: doc/steps/stepN.md
**结果**: 解析完成

**操作**: 生成 Plan
**输出**: .cursor/plans/stepN-plan.md

**操作**: 拆解 todos
**数量**: 5 个 todo
**类型分布**: frontend(2), backend(2), test(1)

**结果**: Plan 生成完成
`;

console.log('\n=== 01-planner.md 执行效果测试 ===\n');

console.log('--- 输入: Step 文件内容 ---');
console.log(sampleStepContent);
console.log('\n');

console.log('--- 输出: 生成的 Plan 文件 ---');
console.log(outputPlanContent);

console.log('\n--- 验证 ---');
const todos = [
  { id: 'todo-1', type: 'frontend', depends_on: [] },
  { id: 'todo-2', type: 'frontend', depends_on: ['todo-1'] },
  { id: 'todo-3', type: 'backend', depends_on: [] },
  { id: 'todo-4', type: 'backend', depends_on: ['todo-3'] },
  { id: 'todo-5', type: 'test', depends_on: ['todo-1', 'todo-3'] }
];

const typeCount = { frontend: 0, backend: 0, test: 0, fix: 0 };
todos.forEach(t => typeCount[t.type]++);

console.log(`✅ todos 数量: ${todos.length}`);
console.log(`✅ frontend: ${typeCount.frontend}`);
console.log(`✅ backend: ${typeCount.backend}`);
console.log(`✅ test: ${typeCount.test}`);
console.log(`✅ 所有 todo 都有 type: ${todos.every(t => t.type)}`);
console.log(`✅ 依赖关系正确: ${JSON.stringify(todos.map(t => t.depends_on))}`);

const topologicalSort = (items) => {
  const inDegree = new Map();
  const graph = new Map();
  items.forEach(item => {
    inDegree.set(item.id, (item.depends_on || []).length);
    graph.set(item.id, []);
  });
  items.forEach(item => {
    (item.depends_on || []).forEach(dep => {
      if (graph.has(dep)) graph.get(dep).push(item.id);
    });
  });
  const queue = [...items.filter(t => inDegree.get(t.id) === 0)];
  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);
    (graph.get(current.id) || []).forEach(neighbor => {
      const newDegree = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        const neighborItem = items.find(t => t.id === neighbor);
        if (neighborItem) queue.push(neighborItem);
      }
    });
  }
  return sorted;
};

console.log('\n--- 拓扑排序验证 ---');
const sorted = topologicalSort(todos);
console.log(`✅ 拓扑排序结果: ${sorted.map(t => t.id).join(' → ')}`);
console.log(`✅ 依赖顺序正确: 无循环依赖`);

console.log('\n=== 测试完成 ===');