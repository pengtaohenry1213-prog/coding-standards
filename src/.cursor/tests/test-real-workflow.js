/**
 * 实际开发流程测试 - 使用真实的 step2-plan 数据
 * 基于 cursor/plans/step2-plan_732aaf94.plan.md
 */

function evaluatePMHumanGate(checkItems) {
  const {
    backgroundClear, outOfScopeClear, userScenarioComplete,
    acceptanceCriteriaExecutable, nonFunctionalRequirements,
    exceptionHandling, p0Defined, p1PathClear,
    externalDependencies, openIssues, riskMitigation
  } = checkItems;

  const p0Issues = [], p1Issues = [], p2Issues = [];

  if (!backgroundClear) p0Issues.push('背景与目标不清晰');
  if (!outOfScopeClear) p2Issues.push('Out of Scope 未明确');
  if (!userScenarioComplete) p1Issues.push('用户场景定义不完整');
  if (!acceptanceCriteriaExecutable) p0Issues.push('验收标准不可执行');
  if (!exceptionHandling) p1Issues.push('异常与边界场景未覆盖');
  if (!p0Defined) p0Issues.push('P0 缺失');
  if (!p1PathClear) p1Issues.push('P1 主路径不清晰');
  if (!externalDependencies) p2Issues.push('外部依赖未识别');
  if (!openIssues) p2Issues.push('开放问题无责任人');
  if (!riskMitigation) p2Issues.push('风险无应对方案');

  if (p0Issues.length > 0) return { decision: 'REJECT', reasons: p0Issues, type: 'P0' };
  if (p1Issues.length > 0 || !nonFunctionalRequirements) {
    return { decision: 'CONDITIONAL', reasons: [...p1Issues, !nonFunctionalRequirements && '非功能需求不明确'].filter(Boolean), type: 'P1' };
  }
  if (p2Issues.length > 0) return { decision: 'CONDITIONAL', reasons: p2Issues, type: 'P2' };
  return { decision: 'PASS', reasons: [], type: null };
}

function evaluateSecurityHumanGate(checkItems) {
  const {
    noPathTraversal, noSystemDirectories, noSensitiveFiles, reasonableFileSize,
    noDangerousCommands, noCommandInjection, hasTimeout,
    noHardcodedKeys, useEnvVariables, noPlaintextOutput,
    dataDesensitized, httpsUsed
  } = checkItems;

  const criticalIssues = [], warnings = [];

  if (!noPathTraversal) criticalIssues.push('存在路径穿越风险');
  if (!noSystemDirectories) criticalIssues.push('尝试访问系统目录');
  if (!noSensitiveFiles) criticalIssues.push('可能覆盖敏感文件');
  if (!reasonableFileSize) criticalIssues.push('文件大小异常');
  if (!noDangerousCommands) criticalIssues.push('存在危险命令');
  if (!noCommandInjection) criticalIssues.push('存在命令注入风险');
  if (!noHardcodedKeys) criticalIssues.push('存在硬编码密钥');
  if (!noPlaintextOutput) warnings.push('日志可能输出敏感信息');
  if (!dataDesensitized) warnings.push('敏感数据未脱敏');
  if (!httpsUsed) warnings.push('敏感接口未使用 HTTPS');

  if (criticalIssues.length > 0) return { decision: 'REJECT', reasons: criticalIssues, warnings, severity: 'CRITICAL' };
  if (warnings.length > 0) return { decision: 'CONDITIONAL', reasons: [], warnings, severity: 'WARNING' };
  return { decision: 'PASS', reasons: [], warnings: [], severity: null };
}

function validateFilePath(path, size = 0) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const normalizedPath = path.replace(/\\/g, '/').replace(/\/+/g, '/');
  const isPathTraversal = /\.\./.test(normalizedPath);
  const isSystemPathAbsolute = /^\/(etc|root|sys|proc)\//.test(normalizedPath);
  const isSystemPathRelative = /\.\.\/(etc|root|sys|proc)\//.test(normalizedPath);
  const isSensitive = /credentials|\.(env|pem|key)$/.test(path);
  const isTooLarge = size > MAX_FILE_SIZE;

  return {
    blocked: isPathTraversal || isSystemPathAbsolute || isSystemPathRelative || isSensitive || isTooLarge,
    reasons: [isPathTraversal && 'Path traversal detected', isSystemPathAbsolute && 'Absolute system path', isSystemPathRelative && 'Relative system path', isSensitive && 'Sensitive file', isTooLarge && 'File too large'].filter(Boolean)
  };
}

function validateCommand(command) {
  const dangerousPatterns = [
    { pattern: /rm\s+-rf/, reason: 'rm -rf detected' },
    { pattern: /\bdd\s+/, reason: 'dd command' },
    { pattern: /mkfs/, reason: 'mkfs detected' },
    { pattern: /chmod\s+777/, reason: 'chmod 777' },
    { pattern: /^sudo\s*$/, reason: 'sudo without command' },
    { pattern: /;\s*rm/, reason: 'semicolon rm' },
    { pattern: /&&\s*rm/, reason: '&& rm' },
    { pattern: /\|\s*rm/, reason: 'pipe rm' },
    { pattern: /`.*rm/, reason: 'backtick rm' },
    { pattern: /\$\(.*rm/, reason: '$() rm' }
  ];

  const warnings = [];
  for (const { pattern, reason } of dangerousPatterns) {
    if (pattern.test(command)) warnings.push(reason);
  }
  return { blocked: warnings.length > 0, warnings };
}

function validatePlanStructure(plan) {
  const VALID_TYPES = ['frontend', 'backend', 'test', 'fix'];
  const errors = [];

  if (!plan.todos || !Array.isArray(plan.todos)) {
    errors.push('todos 必须是数组');
    return { valid: false, errors };
  }
  if (plan.todos.length === 0) errors.push('todos 不能为空');

  plan.todos.forEach((todo, index) => {
    if (!todo.id) errors.push(`todos[${index}] 缺少 id`);
    if (!todo.type) errors.push(`todos[${index}] 缺少 type`);
    else if (!VALID_TYPES.includes(todo.type)) errors.push(`todos[${index}].type 必须是 ${VALID_TYPES.join('|')} 之一`);
    if (!todo.content && !todo.desc) errors.push(`todos[${index}] 缺少 content 或 desc`);
    if (todo.depends_on && !Array.isArray(todo.depends_on)) errors.push(`todos[${index}].depends_on 必须是数组`);
  });

  if (!plan.files || !Array.isArray(plan.files)) errors.push('files 必须是数组');
  if (!plan.acceptance || !Array.isArray(plan.acceptance)) errors.push('acceptance 必须是数组');

  return { valid: errors.length === 0, errors };
}

function topologicalSort(items) {
  const inDegree = new Map(), graph = new Map();
  items.forEach(item => {
    inDegree.set(item.id, (item.depends_on || []).length);
    graph.set(item.id, []);
  });
  items.forEach(item => {
    (item.depends_on || []).forEach(dep => {
      if (graph.has(dep)) graph.get(dep).push(item.id);
    });
  });
  const queue = [...items.filter(t => inDegree.get(t.id) === 0)], sorted = [];
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
}

console.log('\n=== 实际开发流程测试 (step2-plan) ===\n');

const realPlan = {
  name: 'step2-plan',
  overview: '开发独立可复用的 FileUpload.vue 组件，支持PDF/Word上传、校验、解析调用',
  todos: [
    { id: 'create-api-file', type: 'frontend', content: '创建 API 封装 (api/file.ts)', status: 'completed', depends_on: [] },
    { id: 'create-file-upload', type: 'frontend', content: '创建 FileUpload.vue 组件', status: 'completed', depends_on: ['create-api-file'] },
    { id: 'create-tests', type: 'test', content: '创建单元测试', status: 'completed', depends_on: ['create-file-upload'] },
    { id: 'run-tests', type: 'test', content: '运行测试验证', status: 'completed', depends_on: ['create-tests'] }
  ],
  files: [
    'packages/frontend/src/api/file.ts',
    'packages/frontend/src/components/FileUpload.vue',
    'packages/frontend/src/__tests__/FileUpload.test.ts'
  ],
  acceptance: [
    '仅接受 .pdf 和 .docx 文件',
    '文件大小 >10MB 时拒绝并提示',
    '上传进度实时显示',
    '成功/失败显示对应图标',
    '解析结果通过 emit 传递给父组件',
    '所有单元测试通过'
  ]
};

console.log('--- Step 0: Human Gate 1 (执行前审查) ---\n');

const pmResult = evaluatePMHumanGate({
  backgroundClear: true, outOfScopeClear: true, userScenarioComplete: true,
  acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true,
  exceptionHandling: true, p0Defined: true, p1PathClear: true,
  externalDependencies: true, openIssues: true, riskMitigation: true
});

const securityResult = evaluateSecurityHumanGate({
  noPathTraversal: true, noSystemDirectories: true, noSensitiveFiles: true,
  reasonableFileSize: true, noDangerousCommands: true, noCommandInjection: true,
  hasTimeout: true, noHardcodedKeys: true, useEnvVariables: true,
  noPlaintextOutput: true, dataDesensitized: true, httpsUsed: true
});

console.log(`PM Gate: ${pmResult.decision}`);
console.log(`Security Gate: ${securityResult.decision}`);
console.log(`→ Human Gate 1: ${pmResult.decision === 'PASS' && securityResult.decision === 'PASS' ? '✅ PASS' : '❌ REJECT'}\n`);

console.log('--- Step 1: Plan 结构验证 ---\n');

const planValidation = validatePlanStructure({
  todos: realPlan.todos.map(t => ({ id: t.id, type: t.type, content: t.content, depends_on: t.depends_on })),
  files: realPlan.files,
  acceptance: realPlan.acceptance
});

console.log(`Plan 结构: ${planValidation.valid ? '✅ 通过' : '❌ 失败'}`);
if (!planValidation.valid) console.log('错误:', planValidation.errors);

console.log('\n--- Step 2: 拓扑排序 ---\n');
const sorted = topologicalSort(realPlan.todos.map(t => ({ id: t.id, depends_on: t.depends_on })));
console.log(`执行顺序: ${sorted.map(t => t.id).join(' → ')}`);

console.log('\n--- Step 3: 文件安全检查 ---\n');
let fileSecurityPassed = true;
realPlan.files.forEach(file => {
  const result = validateFilePath(file);
  console.log(`${result.blocked ? '❌' : '✅'} ${file}`);
  if (result.blocked) fileSecurityPassed = false;
});

console.log('\n--- Step 4: 命令安全检查 ---\n');
['git status', 'git add .', 'git commit -m "feat(step2): 完成 create-api-file"'].forEach(cmd => {
  const result = validateCommand(cmd);
  console.log(`${result.blocked ? '❌' : '✅'} ${cmd}`);
});

console.log('\n--- Step 5: Review 结果 ---\n');
const allTodosCompleted = realPlan.todos.every(t => t.status === 'completed');
console.log(`todos 完成: ${allTodosCompleted ? '✅' : '❌'}`);
console.log(`acceptance: ✅ 已定义`);

console.log('\n--- Step 6: Human Gate 2 ---\n');
console.log(`Security Gate: ${securityResult.decision}`);
console.log(`→ Human Gate 2: ${securityResult.decision === 'PASS' ? '✅ PASS' : '❌ REJECT'}\n`);

console.log('=== 总结 ===\n');
console.log('| 阶段 | 结果 |');
console.log('|------|------|');
console.log(`| Human Gate 1 | ${pmResult.decision === 'PASS' && securityResult.decision === 'PASS' ? '✅' : '❌'} |`);
console.log(`| Plan 结构 | ${planValidation.valid ? '✅' : '❌'} |`);
console.log(`| 拓扑排序 | ✅ |`);
console.log(`| 文件安全 | ${fileSecurityPassed ? '✅' : '❌'} |`);
console.log(`| todos 完成 | ${allTodosCompleted ? '✅' : '❌'} |`);
console.log(`| Human Gate 2 | ${securityResult.decision === 'PASS' ? '✅' : '❌'} |`);

const allPassed = pmResult.decision === 'PASS' && securityResult.decision === 'PASS' && planValidation.valid && fileSecurityPassed && allTodosCompleted;
console.log(`\n最终: ${allPassed ? '✅ 全部通过' : '❌ 存在问题'}`);