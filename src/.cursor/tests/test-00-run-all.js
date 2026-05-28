/**
 * 测试 00-run-all.md 执行效果
 * 模拟 AI Tech Lead 完整执行流程
 */

console.log('\n=== 00-run-all.md 执行效果测试 ===\n');

const todos = [
  { id: 'todo-1', type: 'frontend', content: '实现登录页面 UI 组件', depends_on: [] },
  { id: 'todo-2', type: 'frontend', content: '实现登录表单验证', depends_on: ['todo-1'] },
  { id: 'todo-3', type: 'backend', content: '实现后端登录 API', depends_on: [] },
  { id: 'todo-4', type: 'backend', content: '实现 JWT Token 生成', depends_on: ['todo-3'] },
  { id: 'todo-5', type: 'test', content: '登录功能测试', depends_on: ['todo-1', 'todo-3'] }
];

const acceptance = [
  '用户可以使用用户名密码登录',
  '登录成功返回 JWT Token',
  '登录失败返回错误信息',
  '前端表单验证正常工作',
  '单元测试覆盖率 > 80%'
];

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

console.log('--- Step 0: Human Gate 1 (执行前审查) ---\n');
console.log('检查项:');
console.log('  ✅ 安全扫描: 匹配 security-rules 所有禁令');
console.log('  ✅ 合规校验: 权限、脱敏、审计、等保');
console.log('  ✅ 质量校验: 可执行、可验收、可回溯');
console.log('结果: PASS\n');

console.log('--- Step 1: Planner - 生成 Plan ---\n');
const sorted = topologicalSort(todos);
console.log('读取 doc/steps/stepN.md');
console.log('生成 .cursor/plans/stepN-plan.md');
console.log('拓扑排序结果:', sorted.map(t => t.id).join(' → '));
console.log('结果: Plan 生成完成\n');

console.log('--- Step 2: 执行 Plan ---\n');
const agentMap = {
  frontend: 'Frontend Agent',
  backend: 'Backend Agent',
  test: 'Test Agent',
  fix: 'Fix Agent'
};

const executed = [];
const maxRetries = 3;

sorted.forEach(todo => {
  console.log(`[Agent: ${agentMap[todo.type]}]`);
  console.log(`  执行 todo: ${todo.id} - ${todo.content}`);
  if (todo.depends_on.length > 0) {
    console.log(`  依赖: ${todo.depends_on.join(', ')}`);
  }
  executed.push({ ...todo, status: 'done' });
  console.log(`  git commit: feat(step1): 完成 ${todo.id}`);
  console.log('');
});

console.log('--- Step 3: Test Agent ---\n');
console.log('执行实测测试:');
console.log('  TC-001: 用户登录成功 → PASS');
console.log('  TC-002: 用户名错误 → PASS');
console.log('  TC-003: 密码错误 → PASS');
console.log('  TC-004: Token 过期 → PASS');
console.log('生成测试报告到 Plan 文件\n');

console.log('--- Step 4: Reviewer Agent ---\n');
let allTodosDone = executed.every(t => t.status === 'done');
let allAcceptanceMet = acceptance.length > 0;
console.log(`  ✅ todos 完成: ${allTodosDone}`);
console.log(`  ✅ acceptance 满足: ${allAcceptanceMet}`);
console.log(`  ✅ 代码质量: 无明显问题`);
console.log(`  ✅ Git 提交: 所有变更已提交`);
console.log('结果: Review 通过\n');

console.log('--- Step 5: Human Gate 2 (执行后审查) ---\n');
console.log('检查项:');
console.log('  ✅ 结果校验: 符合预期、无漏洞、无敏感数据');
console.log('  ✅ 日志校验: 操作已记录、可追溯');
console.log('结果: PASS\n');

console.log('--- Step 6: 最终提交 ---\n');
console.log('git commit -m "feat(step1): 全部完成 + 验收通过"\n');

console.log('=== 执行流程测试完成 ===\n');

console.log('--- 流程图摘要 ---\n');
console.log('Human Gate 1 (PASS)');
console.log('       ↓');
console.log('Planner 生成 Plan');
console.log('       ↓');
console.log('Frontend Agent → Backend Agent → Test Agent');
console.log('       ↓');
console.log('Reviewer Agent');
console.log('       ↓');
console.log('Human Gate 2 (PASS)');
console.log('       ↓');
console.log('最终提交');