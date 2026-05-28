/**
 * 测试路径安全验证
 * 验证文件: cursor/rules/security-rules.md
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function validateFilePath(path, size = 0) {
  const normalizedPath = path.replace(/\\/g, '/').replace(/\/+/g, '/');
  const isPathTraversal = /\.\./.test(normalizedPath);
  const isSystemPathAbsolute = /^\/(etc|root|sys|proc)\//.test(normalizedPath);
  const isSystemPathRelative = /\.\.\/(etc|root|sys|proc)\//.test(normalizedPath);
  const isSensitive = /credentials|\.(env|pem|key)$/.test(path);
  const isTooLarge = size > MAX_FILE_SIZE;

  return {
    blocked: isPathTraversal || isSystemPathAbsolute || isSystemPathRelative || isSensitive || isTooLarge,
    reasons: [
      isPathTraversal && 'Path traversal detected',
      isSystemPathAbsolute && 'Absolute system path detected',
      isSystemPathRelative && 'Relative system path detected',
      isSensitive && 'Sensitive file extension detected',
      isTooLarge && 'File too large'
    ].filter(Boolean)
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

console.log('\n=== 路径安全验证测试 ===\n');

test('Case 1: 正常路径 - 应放行', () => {
  const result = validateFilePath('/packages/frontend/src/App.tsx');
  assertBlock(result.blocked, false, 'Should not be blocked');
});

test('Case 2: 正常路径 - 应放行', () => {
  const result = validateFilePath('packages/backend/src/index.js');
  assertBlock(result.blocked, false, 'Should not be blocked');
});

test('Case 3: 路径穿越 - ../etc - 应拦截', () => {
  const result = validateFilePath('/packages/../../../etc/passwd');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 4: 多级路径穿越 - 应拦截', () => {
  const result = validateFilePath('a/b/../../../etc/passwd');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 5: 绝对系统路径 /etc - 应拦截', () => {
  const result = validateFilePath('/etc/passwd');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 6: 绝对系统路径 /root - 应拦截', () => {
  const result = validateFilePath('/root/.ssh/id_rsa');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 7: 相对系统路径 ../etc - 应拦截', () => {
  const result = validateFilePath('../etc/passwd');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 8: 敏感文件 .env - 应拦截', () => {
  const result = validateFilePath('/project/.env');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 9: 敏感文件 .pem - 应拦截', () => {
  const result = validateFilePath('keys/certificate.pem');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 10: 敏感文件 credentials.json - 应拦截', () => {
  const result = validateFilePath('config/credentials.json');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 11: 敏感文件 .key - 应拦截', () => {
  const result = validateFilePath('secrets/private.key');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 12: Windows 路径穿越 - 应拦截', () => {
  const result = validateFilePath('..\\..\\..\\windows\\system32\\config');
  assertBlock(result.blocked, true, 'Should be blocked');
});

test('Case 13: 路径中包含点但非穿越 - 应放行', () => {
  const result = validateFilePath('/packages/frontend.v2/src/App.tsx');
  assertBlock(result.blocked, false, 'Should not be blocked');
});

test('Case 14: 文件大小超限 - 应拦截', () => {
  const result = validateFilePath('/packages/frontend/src/bundle.js', 20 * 1024 * 1024);
  assertBlock(result.blocked, true, 'Should be blocked for size');
});

test('Case 15: 编码路径 %2f - 应放行 (特殊字符非..)', () => {
  const result = validateFilePath('/path/to%2ffile');
  assertBlock(result.blocked, false, 'Should not be blocked');
});

console.log(`\n=== 结果: ${passed} passed, ${failed} failed ===\n`);

process.exit(failed > 0 ? 1 : 0);