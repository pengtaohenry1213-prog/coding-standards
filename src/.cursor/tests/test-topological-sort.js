/**
 * 测试拓扑排序算法 (Kahn's Algorithm)
 * 验证文件: cursor/prompts/00-run-all.md
 */

const topologicalSort = (todos) => {
  const inDegree = new Map();
  const graph = new Map();

  todos.forEach(todo => {
    inDegree.set(todo.id, (todo.depends_on || []).length);
    graph.set(todo.id, []);
  });

  todos.forEach(todo => {
    (todo.depends_on || []).forEach(dep => {
      if (graph.has(dep)) {
        graph.get(dep).push(todo.id);
      }
    });
  });

  const queue = [...todos.filter(t => inDegree.get(t.id) === 0)];
  const sorted = [];

  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);

    (graph.get(current.id) || []).forEach(neighbor => {
      const newDegree = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        const neighborTodo = todos.find(t => t.id === neighbor);
        if (neighborTodo) queue.push(neighborTodo);
      }
    });
  }

  if (sorted.length !== todos.length) {
    console.error('检测到循环依赖，无法完成拓扑排序');
    return { sorted: todos, error: 'CIRCULAR_DEPENDENCY' };
  }

  return { sorted, error: null };
};

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

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\n   Expected: ${JSON.stringify(expected)}\n   Actual: ${JSON.stringify(actual)}`);
  }
}

console.log('\n=== 拓扑排序测试 ===\n');

test('Case 1: 线性依赖链', () => {
  const todos = [
    { id: 'todo-1', depends_on: [] },
    { id: 'todo-2', depends_on: ['todo-1'] },
    { id: 'todo-3', depends_on: ['todo-2'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Should not have error');
  assertEqual(result.sorted[0].id, 'todo-1', 'First should be todo-1');
  assertEqual(result.sorted[2].id, 'todo-3', 'Last should be todo-3');
});

test('Case 2: 并行任务（无依赖）', () => {
  const todos = [
    { id: 'todo-1', depends_on: [] },
    { id: 'todo-2', depends_on: [] },
    { id: 'todo-3', depends_on: ['todo-1', 'todo-2'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Should not have error');
  assertEqual(result.sorted.length, 3, 'Should have 3 items');
  const lastItem = result.sorted[result.sorted.length - 1];
  assertEqual(lastItem.id, 'todo-3', 'todo-3 should be last');
});

test('Case 3: 复杂依赖图', () => {
  const todos = [
    { id: 'a', depends_on: [] },
    { id: 'b', depends_on: ['a'] },
    { id: 'c', depends_on: ['a'] },
    { id: 'd', depends_on: ['b', 'c'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Should not have error');
  const aIndex = result.sorted.findIndex(t => t.id === 'a');
  const bIndex = result.sorted.findIndex(t => t.id === 'b');
  const cIndex = result.sorted.findIndex(t => t.id === 'c');
  const dIndex = result.sorted.findIndex(t => t.id === 'd');
  assertEqual(aIndex < dIndex, true, 'a should be before d');
  assertEqual(bIndex < dIndex, true, 'b should be before d');
  assertEqual(cIndex < dIndex, true, 'c should be before d');
});

test('Case 4: 循环依赖检测', () => {
  const todos = [
    { id: 'a', depends_on: ['c'] },
    { id: 'b', depends_on: ['a'] },
    { id: 'c', depends_on: ['b'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, 'CIRCULAR_DEPENDENCY', 'Should detect circular dependency');
});

test('Case 5: 自依赖检测', () => {
  const todos = [
    { id: 'todo-1', depends_on: ['todo-1'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, 'CIRCULAR_DEPENDENCY', 'Should detect self dependency');
});

test('Case 6: 空任务列表', () => {
  const todos = [];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Should not have error');
  assertEqual(result.sorted.length, 0, 'Should be empty');
});

test('Case 7: 单任务无依赖', () => {
  const todos = [
    { id: 'todo-1', depends_on: [] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Should not have error');
  assertEqual(result.sorted[0].id, 'todo-1', 'Should be todo-1');
});

console.log(`\n=== 结果: ${passed} passed, ${failed} failed ===\n`);

process.exit(failed > 0 ? 1 : 0);