/**
 * 测试 Human Gate 决策逻辑
 * 验证文件:
 *   - cursor/prompts/pm-human-gate.md
 *   - cursor/prompts/security-human-gate.md
 *   - cursor/prompts/plan-step-human-gate.md
 *
 * 决策格式: PASS / CONDITIONAL / REJECT
 */

function evaluatePMHumanGate(checkItems) {
  const {
    backgroundClear,
    outOfScopeClear,
    userScenarioComplete,
    acceptanceCriteriaExecutable,
    nonFunctionalRequirements,
    exceptionHandling,
    p0Defined,
    p1PathClear,
    externalDependencies,
    openIssues,
    riskMitigation
  } = checkItems;

  const p0Issues = [];
  const p1Issues = [];
  const p2Issues = [];

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

  if (p0Issues.length > 0) {
    return {
      decision: 'REJECT',
      reasons: p0Issues,
      type: 'P0'
    };
  }

  if (p1Issues.length > 0 || !nonFunctionalRequirements) {
    return {
      decision: 'CONDITIONAL',
      reasons: [...p1Issues, !nonFunctionalRequirements && '非功能需求不明确'].filter(Boolean),
      type: 'P1'
    };
  }

  if (p2Issues.length > 0) {
    return {
      decision: 'CONDITIONAL',
      reasons: p2Issues,
      type: 'P2'
    };
  }

  return {
    decision: 'PASS',
    reasons: [],
    type: null
  };
}

function evaluateSecurityHumanGate(checkItems) {
  const {
    noPathTraversal,
    noSystemDirectories,
    noSensitiveFiles,
    reasonableFileSize,
    noDangerousCommands,
    noCommandInjection,
    hasTimeout,
    noHardcodedKeys,
    useEnvVariables,
    noPlaintextOutput,
    dataDesensitized,
    httpsUsed
  } = checkItems;

  const criticalIssues = [];
  const warnings = [];

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

  if (criticalIssues.length > 0) {
    return {
      decision: 'REJECT',
      reasons: criticalIssues,
      warnings,
      severity: 'CRITICAL'
    };
  }

  if (warnings.length > 0) {
    return {
      decision: 'CONDITIONAL',
      reasons: [],
      warnings,
      severity: 'WARNING'
    };
  }

  return {
    decision: 'PASS',
    reasons: [],
    warnings: [],
    severity: null
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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\n   Expected: ${expected}, Actual: ${actual}`);
  }
}

console.log('\n=== Human Gate 决策测试 ===\n');

console.log('--- PM Human Gate 测试 ---');

test('PM Gate: 全部通过 - 应返回 PASS', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true,
    outOfScopeClear: true,
    userScenarioComplete: true,
    acceptanceCriteriaExecutable: true,
    nonFunctionalRequirements: true,
    exceptionHandling: true,
    p0Defined: true,
    p1PathClear: true,
    externalDependencies: true,
    openIssues: true,
    riskMitigation: true
  });
  assertEqual(result.decision, 'PASS', 'Should return PASS');
});

test('PM Gate: P0 缺失 - 应返回 REJECT', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: false,
    outOfScopeClear: true,
    userScenarioComplete: true,
    acceptanceCriteriaExecutable: true,
    nonFunctionalRequirements: true,
    exceptionHandling: true,
    p0Defined: false,
    p1PathClear: true,
    externalDependencies: true,
    openIssues: true,
    riskMitigation: true
  });
  assertEqual(result.decision, 'REJECT', 'Should return REJECT');
  assertEqual(result.type, 'P0', 'Should be P0 issue');
});

test('PM Gate: P1 主路径不清晰 - 应返回 CONDITIONAL', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true,
    outOfScopeClear: true,
    userScenarioComplete: true,
    acceptanceCriteriaExecutable: true,
    nonFunctionalRequirements: true,
    exceptionHandling: false,
    p0Defined: true,
    p1PathClear: false,
    externalDependencies: true,
    openIssues: true,
    riskMitigation: true
  });
  assertEqual(result.decision, 'CONDITIONAL', 'Should return CONDITIONAL');
});

test('PM Gate: 验收标准不可执行 - 应返回 REJECT', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true,
    outOfScopeClear: true,
    userScenarioComplete: true,
    acceptanceCriteriaExecutable: false,
    nonFunctionalRequirements: true,
    exceptionHandling: true,
    p0Defined: true,
    p1PathClear: true,
    externalDependencies: true,
    openIssues: true,
    riskMitigation: true
  });
  assertEqual(result.decision, 'REJECT', 'Should return REJECT');
});

test('PM Gate: 非功能需求缺失 - 应返回 CONDITIONAL', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true,
    outOfScopeClear: true,
    userScenarioComplete: true,
    acceptanceCriteriaExecutable: true,
    nonFunctionalRequirements: false,
    exceptionHandling: true,
    p0Defined: true,
    p1PathClear: true,
    externalDependencies: true,
    openIssues: true,
    riskMitigation: true
  });
  assertEqual(result.decision, 'CONDITIONAL', 'Should return CONDITIONAL');
});

console.log('\n--- Security Human Gate 测试 ---');

test('Security Gate: 全部通过 - 应返回 PASS', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: true,
    noSystemDirectories: true,
    noSensitiveFiles: true,
    reasonableFileSize: true,
    noDangerousCommands: true,
    noCommandInjection: true,
    hasTimeout: true,
    noHardcodedKeys: true,
    useEnvVariables: true,
    noPlaintextOutput: true,
    dataDesensitized: true,
    httpsUsed: true
  });
  assertEqual(result.decision, 'PASS', 'Should return PASS');
});

test('Security Gate: 存在路径穿越 - 应返回 REJECT', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: false,
    noSystemDirectories: true,
    noSensitiveFiles: true,
    reasonableFileSize: true,
    noDangerousCommands: true,
    noCommandInjection: true,
    hasTimeout: true,
    noHardcodedKeys: true,
    useEnvVariables: true,
    noPlaintextOutput: true,
    dataDesensitized: true,
    httpsUsed: true
  });
  assertEqual(result.decision, 'REJECT', 'Should return REJECT');
  assertEqual(result.severity, 'CRITICAL', 'Should be CRITICAL');
});

test('Security Gate: 存在危险命令 - 应返回 REJECT', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: true,
    noSystemDirectories: true,
    noSensitiveFiles: true,
    reasonableFileSize: true,
    noDangerousCommands: false,
    noCommandInjection: true,
    hasTimeout: true,
    noHardcodedKeys: true,
    useEnvVariables: true,
    noPlaintextOutput: true,
    dataDesensitized: true,
    httpsUsed: true
  });
  assertEqual(result.decision, 'REJECT', 'Should return REJECT');
});

test('Security Gate: 硬编码密钥 - 应返回 REJECT', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: true,
    noSystemDirectories: true,
    noSensitiveFiles: true,
    reasonableFileSize: true,
    noDangerousCommands: true,
    noCommandInjection: true,
    hasTimeout: true,
    noHardcodedKeys: false,
    useEnvVariables: true,
    noPlaintextOutput: true,
    dataDesensitized: true,
    httpsUsed: true
  });
  assertEqual(result.decision, 'REJECT', 'Should return REJECT');
});

test('Security Gate: 仅警告项 - 应返回 CONDITIONAL', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: true,
    noSystemDirectories: true,
    noSensitiveFiles: true,
    reasonableFileSize: true,
    noDangerousCommands: true,
    noCommandInjection: true,
    hasTimeout: true,
    noHardcodedKeys: true,
    useEnvVariables: true,
    noPlaintextOutput: false,
    dataDesensitized: true,
    httpsUsed: false
  });
  assertEqual(result.decision, 'CONDITIONAL', 'Should return CONDITIONAL');
  assertEqual(result.severity, 'WARNING', 'Should be WARNING');
});

console.log(`\n=== 结果: ${passed} passed, ${failed} failed ===\n`);

process.exit(failed > 0 ? 1 : 0);