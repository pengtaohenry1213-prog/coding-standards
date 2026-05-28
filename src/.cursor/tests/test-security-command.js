/**
 * 测试命令执行安全验证
 * 验证文件: cursor/rules/security-rules.md
 */

function validateCommand(command) {
  const dangerousPatterns = [
    { pattern: /rm\s+-rf/, reason: 'rm -rf detected' },
    { pattern: /\bdd\b/, reason: 'dd command detected' },
    { pattern: /mkfs/, reason: 'mkfs detected' },
    { pattern: /chmod\s+777/, reason: 'chmod 777 detected' },
    { pattern: /^sudo\s*$/, reason: 'sudo without command detected' },
    { pattern: /;\s*rm/, reason: 'command injection (semicolon rm)' },
    { pattern: /&&\s*rm/, reason: 'command injection (&& rm)' },
    { pattern: /\|\s*rm/, reason: 'command injection (pipe rm)' },
    { pattern: /`.*rm/, reason: 'command injection (backtick rm)' },
    { pattern: /\$\(.*rm/, reason: 'command injection ($() rm)' }
  ];

  const warnings = [];
  for (const { pattern, reason } of dangerousPatterns) {
    if (pattern.test(command)) {
      warnings.push(reason);
    }
  }

  return {
    blocked: warnings.length > 0,
    warnings
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

function assertBlock(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\n   Expected blocked: ${expected}, Actual: ${actual}`);
  }
}

console.log('\n=== 命令执行安全验证测试 ===\n');

test('Case 1: 正常命令 git status - 应放行', () => {
  const result = validateCommand('git status');
  assertBlock(result.blocked, false, 'Should not be blocked');
});

test('Case 2: 正常命令 npm install - 应放行', () => {
  const result = validateCommand('npm install express');
  assertBlock(result.blocked, false, 'Should not be blocked');
});

test('Case 3: 正常命令 git commit - 应放行', () => {
  const result = validateCommand('git commit -m "fix: resolve issue"');
  assertBlock(result.blocked, false, 'Should not be blocked');
});

test('Case 4: 危险命令 rm -rf / - 应拦截', () => {
  const result = validateCommand('rm -rf /');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 5: 危险命令 rm -rf with wildcard - 应拦截', () => {
  const result = validateCommand('rm -rf /tmp/*');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 6: 危险命令 dd - 应拦截', () => {
  const result = validateCommand('dd if=/dev/zero of=/dev/sda');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 7: 危险命令 mkfs - 应拦截', () => {
  const result = validateCommand('mkfs.ext4 /dev/sdb1');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 8: 危险命令 chmod 777 - 应拦截', () => {
  const result = validateCommand('chmod 777 /some/path');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 9: 危险命令 sudo - 应拦截', () => {
  const result = validateCommand('sudo');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 10: 命令注入 ;rm - 应拦截', () => {
  const result = validateCommand('git commit -m "test"; rm -rf /');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 11: 命令注入 &&rm - 应拦截', () => {
  const result = validateCommand('git commit -m "test" && rm -rf /');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 12: 命令注入 |rm - 应拦截', () => {
  const result = validateCommand('echo "test" | rm -rf /');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 13: 命令注入 `rm` - 应拦截', () => {
  const result = validateCommand('`rm -rf /`');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 14: 命令注入 $(rm) - 应拦截', () => {
  const result = validateCommand('$(rm -rf /)');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 15: 包含危险字符串 - 应拦截 (过度防御)', () => {
  const result = validateCommand('echo "rm -rf is dangerous"');
  assertBlock(result.blocked, true, 'Should be blocked (pattern matches)');
});

test('Case 16: 包含rm但非危险 - 应放行', () => {
  const result = validateCommand('git log --oneline | grep "rm"');
  assertBlock(result.blocked, false, 'Should not be blocked');
});

console.log(`\n=== 结果: ${passed} passed, ${failed} failed ===\n`);

process.exit(failed > 0 ? 1 : 0);