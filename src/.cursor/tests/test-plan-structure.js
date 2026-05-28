/**
 * 测试 Plan 文件结构验证
 * 验证文件:
 *   - cursor/prompts/01-planner.md
 *   - cursor/rules/planner.mdc
 *
 * Plan 必须包含:
 *   - todos (必须标注 type: frontend | backend | test | fix)
 *   - files
 *   - acceptance
 */

const VALID_TYPES = ['frontend', 'backend', 'test', 'fix'];

function validatePlanStructure(plan) {
  const errors = [];

  if (!plan.todos || !Array.isArray(plan.todos)) {
    errors.push('todos 必须是数组');
    return { valid: false, errors };
  }

  if (plan.todos.length === 0) {
    errors.push('todos 不能为空');
  }

  plan.todos.forEach((todo, index) => {
    if (!todo.id) {
      errors.push(`todos[${index}] 缺少 id`);
    }

    if (!todo.type) {
      errors.push(`todos[${index}] 缺少 type`);
    } else if (!VALID_TYPES.includes(todo.type)) {
      errors.push(`todos[${index}].type 必须是 ${VALID_TYPES.join('|')} 之一，当前值: ${todo.type}`);
    }

    if (!todo.content && !todo.desc) {
      errors.push(`todos[${index}] 缺少 content 或 desc`);
    }

    if (todo.depends_on && !Array.isArray(todo.depends_on)) {
      errors.push(`todos[${index}].depends_on 必须是数组`);
    }
  });

  if (!plan.files || !Array.isArray(plan.files)) {
    errors.push('files 必须是数组');
  }

  if (!plan.acceptance || !Array.isArray(plan.acceptance)) {
    errors.push('acceptance 必须是数组');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
  }
}

function assertValid(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\n   Expected valid: ${expected}, Actual: ${actual}`);
  }
}

console.log('\n=== Plan 结构验证测试 ===\n');

test('Case 1: 完整 Plan - 应通过', () => {
  const plan = {
    todos: [
      { id: 'todo-1', type: 'frontend', content: '实现登录页面', depends_on: [] },
      { id: 'todo-2', type: 'backend', content: '实现登录接口', depends_on: ['todo-1'] },
      { id: 'todo-3', type: 'test', content: '登录功能测试', depends_on: ['todo-1', 'todo-2'] }
    ],
    files: [
      'packages/frontend/src/pages/Login.tsx',
      'packages/backend/src/routes/auth.ts'
    ],
    acceptance: [
      '登录功能可用',
      '接口响应时间 < 500ms'
    ]
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, true, 'Should be valid');
});

test('Case 2: 缺少 todos - 应失败', () => {
  const plan = {
    files: [],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 3: todos 为空数组 - 应失败', () => {
  const plan = {
    todos: [],
    files: [],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 4: todo 缺少 type - 应失败', () => {
  const plan = {
    todos: [
      { id: 'todo-1', content: '实现登录页面' }
    ],
    files: [],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 5: todo type 错误 - 应失败', () => {
  const plan = {
    todos: [
      { id: 'todo-1', type: 'invalid', content: '实现登录页面' }
    ],
    files: [],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 6: todo 缺少 id - 应失败', () => {
  const plan = {
    todos: [
      { type: 'frontend', content: '实现登录页面' }
    ],
    files: [],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 7: todo 缺少 content/desc - 应失败', () => {
  const plan = {
    todos: [
      { id: 'todo-1', type: 'frontend' }
    ],
    files: [],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 8: depends_on 不是数组 - 应失败', () => {
  const plan = {
    todos: [
      { id: 'todo-1', type: 'frontend', content: '实现登录页面', depends_on: 'todo-2' }
    ],
    files: [],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 9: 缺少 files - 应失败', () => {
  const plan = {
    todos: [
      { id: 'todo-1', type: 'frontend', content: '实现登录页面' }
    ],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 10: 缺少 acceptance - 应失败', () => {
  const plan = {
    todos: [
      { id: 'todo-1', type: 'frontend', content: '实现登录页面' }
    ],
    files: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 11: 使用 desc 代替 content - 应通过', () => {
  const plan = {
    todos: [
      { id: 'todo-1', type: 'frontend', desc: '实现登录页面' }
    ],
    files: [],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, true, 'Should be valid');
});

test('Case 12: 多个错误 - 应收集所有错误', () => {
  const plan = {
    todos: [
      { id: 'todo-1', type: 'invalid' }
    ]
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, false, 'Should be invalid');
});

test('Case 13: 所有 type 类型 - 应通过', () => {
  const plan = {
    todos: [
      { id: 'todo-1', type: 'frontend', content: '前端任务' },
      { id: 'todo-2', type: 'backend', content: '后端任务' },
      { id: 'todo-3', type: 'test', content: '测试任务' },
      { id: 'todo-4', type: 'fix', content: '修复任务' }
    ],
    files: [],
    acceptance: []
  };
  const result = validatePlanStructure(plan);
  assertValid(result.valid, true, 'Should be valid');
});

console.log(`\n=== 结果: ${passed} passed, ${failed} failed ===\n`);

process.exit(failed > 0 ? 1 : 0);