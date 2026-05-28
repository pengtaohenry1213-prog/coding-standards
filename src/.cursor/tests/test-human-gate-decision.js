/**
 * Human Gate 决策逻辑测试
 * 验证决策格式: PASS / CONDITIONAL / REJECT
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

console.log('\n=== Human Gate 决策格式测试 ===\n');

console.log('--- PM Human Gate 决策测试 ---\n');

test('PM: 全部通过 → PASS', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true, outOfScopeClear: true, userScenarioComplete: true,
    acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true,
    exceptionHandling: true, p0Defined: true, p1PathClear: true,
    externalDependencies: true, openIssues: true, riskMitigation: true
  });
  assertEqual(result.decision, 'PASS', 'Decision');
  assertEqual(result.type, null, 'Type');
});

test('PM: 背景目标不清晰 → REJECT (P0)', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: false, outOfScopeClear: true, userScenarioComplete: true,
    acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true,
    exceptionHandling: true, p0Defined: true, p1PathClear: true,
    externalDependencies: true, openIssues: true, riskMitigation: true
  });
  assertEqual(result.decision, 'REJECT', 'Decision');
  assertEqual(result.type, 'P0', 'Type');
  assertEqual(result.reasons.includes('背景与目标不清晰'), true, 'Reason');
});

test('PM: 验收标准不可执行 → REJECT (P0)', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true, outOfScopeClear: true, userScenarioComplete: true,
    acceptanceCriteriaExecutable: false, nonFunctionalRequirements: true,
    exceptionHandling: true, p0Defined: true, p1PathClear: true,
    externalDependencies: true, openIssues: true, riskMitigation: true
  });
  assertEqual(result.decision, 'REJECT', 'Decision');
  assertEqual(result.type, 'P0', 'Type');
});

test('PM: P0 缺失 → REJECT (P0)', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true, outOfScopeClear: true, userScenarioComplete: true,
    acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true,
    exceptionHandling: true, p0Defined: false, p1PathClear: true,
    externalDependencies: true, openIssues: true, riskMitigation: true
  });
  assertEqual(result.decision, 'REJECT', 'Decision');
  assertEqual(result.type, 'P0', 'Type');
});

test('PM: P1 主路径不清晰 → CONDITIONAL (P1)', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true, outOfScopeClear: true, userScenarioComplete: true,
    acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true,
    exceptionHandling: false, p0Defined: true, p1PathClear: false,
    externalDependencies: true, openIssues: true, riskMitigation: true
  });
  assertEqual(result.decision, 'CONDITIONAL', 'Decision');
  assertEqual(result.type, 'P1', 'Type');
});

test('PM: 非功能需求缺失 → CONDITIONAL (P1)', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true, outOfScopeClear: true, userScenarioComplete: true,
    acceptanceCriteriaExecutable: true, nonFunctionalRequirements: false,
    exceptionHandling: true, p0Defined: true, p1PathClear: true,
    externalDependencies: true, openIssues: true, riskMitigation: true
  });
  assertEqual(result.decision, 'CONDITIONAL', 'Decision');
  assertEqual(result.type, 'P1', 'Type');
});

test('PM: Out of Scope 未明确 → CONDITIONAL (P2)', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true, outOfScopeClear: false, userScenarioComplete: true,
    acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true,
    exceptionHandling: true, p0Defined: true, p1PathClear: true,
    externalDependencies: true, openIssues: true, riskMitigation: true
  });
  assertEqual(result.decision, 'CONDITIONAL', 'Decision');
  assertEqual(result.type, 'P2', 'Type');
});

test('PM: 多个 P1 问题 → CONDITIONAL (P1)', () => {
  const result = evaluatePMHumanGate({
    backgroundClear: true, outOfScopeClear: true, userScenarioComplete: false,
    acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true,
    exceptionHandling: false, p0Defined: true, p1PathClear: false,
    externalDependencies: true, openIssues: true, riskMitigation: true
  });
  assertEqual(result.decision, 'CONDITIONAL', 'Decision');
  assertEqual(result.type, 'P1', 'Type');
  assertEqual(result.reasons.length >= 2, true, 'Multiple P1 reasons');
});

console.log('\n--- Security Human Gate 决策测试 ---\n');

test('Security: 全部通过 → PASS', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: true, noSystemDirectories: true, noSensitiveFiles: true,
    reasonableFileSize: true, noDangerousCommands: true, noCommandInjection: true,
    hasTimeout: true, noHardcodedKeys: true, useEnvVariables: true,
    noPlaintextOutput: true, dataDesensitized: true, httpsUsed: true
  });
  assertEqual(result.decision, 'PASS', 'Decision');
  assertEqual(result.severity, null, 'Severity');
});

test('Security: 路径穿越 → REJECT (CRITICAL)', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: false, noSystemDirectories: true, noSensitiveFiles: true,
    reasonableFileSize: true, noDangerousCommands: true, noCommandInjection: true,
    hasTimeout: true, noHardcodedKeys: true, useEnvVariables: true,
    noPlaintextOutput: true, dataDesensitized: true, httpsUsed: true
  });
  assertEqual(result.decision, 'REJECT', 'Decision');
  assertEqual(result.severity, 'CRITICAL', 'Severity');
  assertEqual(result.reasons.includes('存在路径穿越风险'), true, 'Reason');
});

test('Security: 危险命令 → REJECT (CRITICAL)', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: true, noSystemDirectories: true, noSensitiveFiles: true,
    reasonableFileSize: true, noDangerousCommands: false, noCommandInjection: true,
    hasTimeout: true, noHardcodedKeys: true, useEnvVariables: true,
    noPlaintextOutput: true, dataDesensitized: true, httpsUsed: true
  });
  assertEqual(result.decision, 'REJECT', 'Decision');
  assertEqual(result.severity, 'CRITICAL', 'Severity');
});

test('Security: 硬编码密钥 → REJECT (CRITICAL)', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: true, noSystemDirectories: true, noSensitiveFiles: true,
    reasonableFileSize: true, noDangerousCommands: true, noCommandInjection: true,
    hasTimeout: true, noHardcodedKeys: false, useEnvVariables: true,
    noPlaintextOutput: true, dataDesensitized: true, httpsUsed: true
  });
  assertEqual(result.decision, 'REJECT', 'Decision');
  assertEqual(result.severity, 'CRITICAL', 'Severity');
});

test('Security: 多个严重问题 → REJECT (CRITICAL)', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: false, noSystemDirectories: false, noSensitiveFiles: true,
    reasonableFileSize: true, noDangerousCommands: false, noCommandInjection: true,
    hasTimeout: true, noHardcodedKeys: false, useEnvVariables: true,
    noPlaintextOutput: true, dataDesensitized: true, httpsUsed: true
  });
  assertEqual(result.decision, 'REJECT', 'Decision');
  assertEqual(result.severity, 'CRITICAL', 'Severity');
  assertEqual(result.reasons.length >= 3, true, 'Multiple critical reasons');
});

test('Security: 仅警告项 (日志明文) → CONDITIONAL (WARNING)', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: true, noSystemDirectories: true, noSensitiveFiles: true,
    reasonableFileSize: true, noDangerousCommands: true, noCommandInjection: true,
    hasTimeout: true, noHardcodedKeys: true, useEnvVariables: true,
    noPlaintextOutput: false, dataDesensitized: true, httpsUsed: false
  });
  assertEqual(result.decision, 'CONDITIONAL', 'Decision');
  assertEqual(result.severity, 'WARNING', 'Severity');
  assertEqual(result.warnings.length >= 1, true, 'Has warnings');
});

test('Security: 仅 HTTPS 未使用 → CONDITIONAL (WARNING)', () => {
  const result = evaluateSecurityHumanGate({
    noPathTraversal: true, noSystemDirectories: true, noSensitiveFiles: true,
    reasonableFileSize: true, noDangerousCommands: true, noCommandInjection: true,
    hasTimeout: true, noHardcodedKeys: true, useEnvVariables: true,
    noPlaintextOutput: true, dataDesensitized: true, httpsUsed: false
  });
  assertEqual(result.decision, 'CONDITIONAL', 'Decision');
  assertEqual(result.severity, 'WARNING', 'Severity');
  assertEqual(result.warnings.includes('敏感接口未使用 HTTPS'), true, 'Warning message');
});

console.log('\n--- Human Gate 组合测试 ---\n');

test('HG1: PM PASS + Security PASS → HG1 PASS', () => {
  const pm = evaluatePMHumanGate({ backgroundClear: true, outOfScopeClear: true, userScenarioComplete: true, acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true, exceptionHandling: true, p0Defined: true, p1PathClear: true, externalDependencies: true, openIssues: true, riskMitigation: true });
  const sec = evaluateSecurityHumanGate({ noPathTraversal: true, noSystemDirectories: true, noSensitiveFiles: true, reasonableFileSize: true, noDangerousCommands: true, noCommandInjection: true, hasTimeout: true, noHardcodedKeys: true, useEnvVariables: true, noPlaintextOutput: true, dataDesensitized: true, httpsUsed: true });
  const hg1 = pm.decision === 'PASS' && sec.decision === 'PASS' ? 'PASS' : 'REJECT';
  assertEqual(hg1, 'PASS', 'HG1 Result');
});

test('HG1: PM REJECT → HG1 REJECT', () => {
  const pm = evaluatePMHumanGate({ backgroundClear: false, outOfScopeClear: true, userScenarioComplete: true, acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true, exceptionHandling: true, p0Defined: true, p1PathClear: true, externalDependencies: true, openIssues: true, riskMitigation: true });
  const sec = evaluateSecurityHumanGate({ noPathTraversal: true, noSystemDirectories: true, noSensitiveFiles: true, reasonableFileSize: true, noDangerousCommands: true, noCommandInjection: true, hasTimeout: true, noHardcodedKeys: true, useEnvVariables: true, noPlaintextOutput: true, dataDesensitized: true, httpsUsed: true });
  const hg1 = pm.decision === 'PASS' && sec.decision === 'PASS' ? 'PASS' : 'REJECT';
  assertEqual(hg1, 'REJECT', 'HG1 Result');
});

test('HG1: Security REJECT → HG1 REJECT', () => {
  const pm = evaluatePMHumanGate({ backgroundClear: true, outOfScopeClear: true, userScenarioComplete: true, acceptanceCriteriaExecutable: true, nonFunctionalRequirements: true, exceptionHandling: true, p0Defined: true, p1PathClear: true, externalDependencies: true, openIssues: true, riskMitigation: true });
  const sec = evaluateSecurityHumanGate({ noPathTraversal: false, noSystemDirectories: true, noSensitiveFiles: true, reasonableFileSize: true, noDangerousCommands: true, noCommandInjection: true, hasTimeout: true, noHardcodedKeys: true, useEnvVariables: true, noPlaintextOutput: true, dataDesensitized: true, httpsUsed: true });
  const hg1 = pm.decision === 'PASS' && sec.decision === 'PASS' ? 'PASS' : 'REJECT';
  assertEqual(hg1, 'REJECT', 'HG1 Result');
});

console.log('\n=== 结果: ' + passed + ' passed, ' + failed + ' failed ===\n');

if (failed > 0) process.exit(1);