/**
 * 拓扑排序算法 (Kahn's Algorithm) 详细测试
 */

function topologicalSort(todos) {
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
}

let passed = 0, failed = 0;

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

function assertEqual(actual, expected, msg) {
  if (actual !== expected) throw new Error(`${msg} - Expected: ${expected}, Actual: ${actual}`);
}

function assertTrue(actual, msg) {
  if (!actual) throw new Error(`${msg} - Expected truthy, Actual: ${actual}`);
}

console.log('\n=== 拓扑排序算法 (Kahn\'s Algorithm) 详细测试 ===\n');

console.log('--- 基础功能测试 ---\n');

test('Case 1: 空任务列表', () => {
  const result = topologicalSort([]);
  assertEqual(result.error, null, 'Error');
  assertEqual(result.sorted.length, 0, 'Length');
});

test('Case 2: 单任务无依赖', () => {
  const result = topologicalSort([{ id: 'A', depends_on: [] }]);
  assertEqual(result.error, null, 'Error');
  assertEqual(result.sorted[0].id, 'A', 'ID');
});

test('Case 3: 线性依赖链 A→B→C', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['A'] },
    { id: 'C', depends_on: ['B'] }
  ]);
  assertEqual(result.error, null, 'Error');
  assertEqual(result.sorted.length, 3, 'Length');
  assertEqual(result.sorted[0].id, 'A', 'First');
  assertEqual(result.sorted[1].id, 'B', 'Second');
  assertEqual(result.sorted[2].id, 'C', 'Third');
});

test('Case 4: 并行任务 (无依赖)', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: [] },
    { id: 'C', depends_on: [] }
  ]);
  assertEqual(result.error, null, 'Error');
  assertEqual(result.sorted.length, 3, 'Length');
  assertTrue(result.sorted.every(t => t.depends_on.length === 0), 'All have no dependencies');
});

test('Case 5: Y 型依赖 (A→B, A→C, B+C→D)', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['A'] },
    { id: 'C', depends_on: ['A'] },
    { id: 'D', depends_on: ['B', 'C'] }
  ]);
  assertEqual(result.error, null, 'Error');
  const aIdx = result.sorted.findIndex(t => t.id === 'A');
  const dIdx = result.sorted.findIndex(t => t.id === 'D');
  assertTrue(aIdx < dIdx, 'A before D');
});

console.log('\n--- 复杂依赖图测试 ---\n');

test('Case 6: 复杂依赖图 (真实的 step2-plan)', () => {
  const todos = [
    { id: 'create-api-file', depends_on: [] },
    { id: 'create-file-upload', depends_on: ['create-api-file'] },
    { id: 'create-tests', depends_on: ['create-file-upload'] },
    { id: 'run-tests', depends_on: ['create-tests'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Error');
  console.log(`   执行顺序: ${result.sorted.map(t => t.id).join(' → ')}`);
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('create-api-file') < idx('create-file-upload'), 'api before upload');
  assertTrue(idx('create-file-upload') < idx('create-tests'), 'upload before tests');
  assertTrue(idx('create-tests') < idx('run-tests'), 'create before run');
});

test('Case 7: 多层并行依赖', () => {
  const todos = [
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: [] },
    { id: 'C', depends_on: ['A'] },
    { id: 'D', depends_on: ['A'] },
    { id: 'E', depends_on: ['B', 'C'] },
    { id: 'F', depends_on: ['D', 'E'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Error');
  console.log(`   执行顺序: ${result.sorted.map(t => t.id).join(' → ')}`);
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('A') < idx('C'), 'A before C');
  assertTrue(idx('A') < idx('D'), 'A before D');
  assertTrue(idx('B') < idx('E'), 'B before E');
  assertTrue(idx('C') < idx('E'), 'C before E');
  assertTrue(idx('E') < idx('F'), 'E before F');
  assertTrue(idx('D') < idx('F'), 'D before F');
});

test('Case 8: 菱形依赖 A→B→D, A→C→D', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['A'] },
    { id: 'C', depends_on: ['A'] },
    { id: 'D', depends_on: ['B', 'C'] }
  ]);
  assertEqual(result.error, null, 'Error');
  console.log(`   执行顺序: ${result.sorted.map(t => t.id).join(' → ')}`);
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('A') < idx('B'), 'A before B');
  assertTrue(idx('A') < idx('C'), 'A before C');
  assertTrue(idx('B') < idx('D'), 'B before D');
  assertTrue(idx('C') < idx('D'), 'C before D');
});

console.log('\n--- 循环依赖检测测试 ---\n');

test('Case 9: 简单循环 A→B→C→A', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: ['C'] },
    { id: 'B', depends_on: ['A'] },
    { id: 'C', depends_on: ['B'] }
  ]);
  assertEqual(result.error, 'CIRCULAR_DEPENDENCY', 'Error type');
});

test('Case 10: 自依赖 A→A', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: ['A'] }
  ]);
  assertEqual(result.error, 'CIRCULAR_DEPENDENCY', 'Error type');
});

test('Case 11: 跨节点循环 B→C→B', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['C'] },
    { id: 'C', depends_on: ['B'] }
  ]);
  assertEqual(result.error, 'CIRCULAR_DEPENDENCY', 'Error type');
});

test('Case 12: 间接循环 A→B→C→D→B', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['D'] },
    { id: 'C', depends_on: ['B'] },
    { id: 'D', depends_on: ['C'] }
  ]);
  assertEqual(result.error, 'CIRCULAR_DEPENDENCY', 'Error type');
});

console.log('\n--- 边界情况测试 ---\n');

test('Case 13: 孤立节点 (无依赖也无被依赖)', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: [] },
    { id: 'C', depends_on: [] }
  ]);
  assertEqual(result.error, null, 'Error');
  assertEqual(result.sorted.length, 3, 'Length');
});

test('Case 14: 所有人依赖一个人 A→B, A→C, A→D', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['A'] },
    { id: 'C', depends_on: ['A'] },
    { id: 'D', depends_on: ['A'] }
  ]);
  assertEqual(result.error, null, 'Error');
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('A') < idx('B'), 'A before B');
  assertTrue(idx('A') < idx('C'), 'A before C');
  assertTrue(idx('A') < idx('D'), 'A before D');
});

test('Case 15: 一个人被所有人依赖 B→A, C→A, D→A', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['A'] },
    { id: 'C', depends_on: ['A'] },
    { id: 'D', depends_on: ['A'] }
  ]);
  assertEqual(result.error, null, 'Error');
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('A') < idx('B'), 'A before B');
  assertTrue(idx('A') < idx('C'), 'A before C');
  assertTrue(idx('A') < idx('D'), 'A before D');
});

test('Case 16: 依赖链分叉合并 A→B→C→E, A→D→E', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['A'] },
    { id: 'C', depends_on: ['B'] },
    { id: 'D', depends_on: ['A'] },
    { id: 'E', depends_on: ['C', 'D'] }
  ]);
  assertEqual(result.error, null, 'Error');
  console.log(`   执行顺序: ${result.sorted.map(t => t.id).join(' → ')}`);
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('A') < idx('E'), 'A before E');
  assertTrue(idx('B') < idx('C'), 'B before C');
  assertTrue(idx('C') < idx('E'), 'C before E');
  assertTrue(idx('D') < idx('E'), 'D before E');
});

test('Case 16: 依赖链分叉合并 A→B→C→E, A→D→E', () => {
  const result = topologicalSort([
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['A'] },
    { id: 'C', depends_on: ['B'] },
    { id: 'D', depends_on: ['A'] },
    { id: 'E', depends_on: ['C', 'D'] }
  ]);
  assertEqual(result.error, null, 'Error');
  console.log(`   执行顺序: ${result.sorted.map(t => t.id).join(' → ')}`);
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('A') < idx('E'), 'A before E');
  assertTrue(idx('B') < idx('C'), 'B before C');
  assertTrue(idx('C') < idx('E'), 'C before E');
  assertTrue(idx('D') < idx('E'), 'D before E');
});

console.log('\n--- 边界情况测试 (扩展) ---\n');

test('Case 17: 大型链式依赖 (50个节点)', () => {
  const todos = [];
  for (let i = 0; i < 50; i++) {
    todos.push({
      id: `task-${i}`,
      depends_on: i === 0 ? [] : [`task-${i-1}`]
    });
  }
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Error');
  assertEqual(result.sorted.length, 50, 'Length');
  assertEqual(result.sorted[0].id, 'task-0', 'First');
  assertEqual(result.sorted[49].id, 'task-49', 'Last');
});

test('Case 18: 星型依赖 (中心节点被所有人依赖)', () => {
  const todos = [];
  for (let i = 0; i < 20; i++) {
    todos.push({
      id: `leaf-${i}`,
      depends_on: ['center']
    });
  }
  todos.push({ id: 'center', depends_on: [] });
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Error');
  assertEqual(result.sorted[0].id, 'center', 'Center first');
});

test('Case 19: 反向星型依赖 (中心节点依赖所有人)', () => {
  const todos = [{ id: 'center', depends_on: [] }];
  for (let i = 0; i < 20; i++) {
    todos.push({
      id: `leaf-${i}`,
      depends_on: []
    });
    todos[0].depends_on.push(`leaf-${i}`);
  }
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Error');
  const centerIdx = result.sorted.findIndex(t => t.id === 'center');
  for (let i = 0; i < 20; i++) {
    const leafIdx = result.sorted.findIndex(t => t.id === `leaf-${i}`);
    assertTrue(leafIdx < centerIdx, `leaf-${i} before center`);
  }
});

test('Case 20: 不存在的依赖节点 (引用缺失 ID)', () => {
  const todos = [
    { id: 'A', depends_on: [] },
    { id: 'B', depends_on: ['non-existent-id'] },
    { id: 'C', depends_on: [] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, 'CIRCULAR_DEPENDENCY', 'Error type');
});

test('Case 21: 大量并行独立任务 (100个)', () => {
  const todos = [];
  for (let i = 0; i < 100; i++) {
    todos.push({ id: `task-${i}`, depends_on: [] });
  }
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Error');
  assertEqual(result.sorted.length, 100, 'Length');
});

test('Case 22: 依赖模糊的空数组处理', () => {
  const result = topologicalSort([{ id: 'A' }]);
  assertEqual(result.error, null, 'Error');
  assertEqual(result.sorted[0].id, 'A', 'First');
});

test('Case 23: 依赖为 null vs 空数组', () => {
  const todos = [
    { id: 'A', depends_on: null },
    { id: 'B', depends_on: [] },
    { id: 'C', depends_on: ['A'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Error');
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('A') < idx('C'), 'A before C');
  assertTrue(idx('B') < idx('C'), 'B before C');
});

test('Case 24: 依赖 undefined 处理', () => {
  const todos = [
    { id: 'A', depends_on: undefined },
    { id: 'B', depends_on: [] },
    { id: 'C', depends_on: ['A'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Error');
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('A') < idx('C'), 'A before C');
});

test('Case 25: 多层菱形依赖 (复杂图)', () => {
  const todos = [
    { id: 'A', depends_on: [] },
    { id: 'B1', depends_on: ['A'] },
    { id: 'B2', depends_on: ['A'] },
    { id: 'C1', depends_on: ['B1'] },
    { id: 'C2', depends_on: ['B1'] },
    { id: 'C3', depends_on: ['B2'] },
    { id: 'C4', depends_on: ['B2'] },
    { id: 'D', depends_on: ['C1', 'C2', 'C3', 'C4'] }
  ];
  const result = topologicalSort(todos);
  assertEqual(result.error, null, 'Error');
  const idx = (id) => result.sorted.findIndex(t => t.id === id);
  assertTrue(idx('A') < idx('D'), 'A before D');
  assertTrue(idx('B1') < idx('D'), 'B1 before D');
  assertTrue(idx('B2') < idx('D'), 'B2 before D');
});

console.log('\n=== 结果: ' + passed + ' passed, ' + failed + ' failed ===\n');

console.log('--- 算法说明 ---\n');
console.log('Kahn\'s Algorithm 拓扑排序步骤:');
console.log('1. 计算每个节点的入度 (depends_on 数量)');
console.log('2. 构建邻接表 (依赖关系图)');
console.log('3. 将所有入度为 0 的节点加入队列');
console.log('4. 取出队首节点，加入排序结果');
console.log('5. 减少相邻节点的入度，若入度变为 0 则加入队列');
console.log('6. 重复 4-5 直到队列为空');
console.log('7. 若排序结果节点数 < 总节点数，说明存在循环依赖');

if (failed > 0) process.exit(1);