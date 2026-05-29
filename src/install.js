const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const projectRoot = process.cwd();
// 包内的规范文件目录
const packageRoot = __dirname;
// 缓存文件路径（记录上次同步的版本和时间）
const cachePath = path.join(projectRoot, '.node_modules/.standards-cache.json');

// 读取当前包的版本号
const packageJson = require(path.join(packageRoot, '../package.json'));
const currentVersion = packageJson.version;

console.log('🔧 正在检查团队编码规范...');

// 检查是否需要同步
function needSync() {
  // 如果缓存文件不存在，需要同步
  if (!fs.existsSync(cachePath)) return true;
  
  try {
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    // 如果版本号变化，需要同步
    if (cache.version !== currentVersion) return true;
    // 如果距离上次同步超过24小时，强制同步一次
    if (Date.now() - cache.lastSync > 24 * 60 * 60 * 1000) return true;
    return false;
  } catch (e) {
    return true;
  }
}

// 执行同步
function sync() {
  console.log(`📦 同步规范版本 v${currentVersion}...`);

  // 1. 复制.cursor目录
  const cursorSrc = path.join(packageRoot, '.cursor');
  const cursorDest = path.join(projectRoot, '.cursor');
  if (fs.existsSync(cursorSrc)) {
    fs.cpSync(cursorSrc, cursorDest, { recursive: true, force: true });
    console.log('✅ .cursor 规范已同步');
  }

  // 2. 复制.githooks目录
  const hooksSrc = path.join(packageRoot, '.githooks');
  const hooksDest = path.join(projectRoot, '.githooks');
  if (fs.existsSync(hooksSrc)) {
    fs.cpSync(hooksSrc, hooksDest, { recursive: true, force: true });
    execSync('git config core.hooksPath .githooks', { cwd: projectRoot });
    console.log('✅ Git钩子已配置');
  }

  // 3. 更新.gitignore
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const gitignoreRules = [
    '# 自动生成的规范文件，不要手动修改',
    '.cursor/',
    '.githooks/'
  ];

  let gitignoreContent = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }

  gitignoreRules.forEach(rule => {
    if (!gitignoreContent.includes(rule)) {
      gitignoreContent += '\n' + rule;
    }
  });

  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ .gitignore 已更新');

  // 4. 写入缓存
  fs.writeFileSync(cachePath, JSON.stringify({
    version: currentVersion,
    lastSync: Date.now()
  }, null, 2));

  console.log('\n🎉 团队编码规范同步完成！');
}

// 主逻辑
if (needSync()) {
  sync();
} else {
  console.log('✅ 规范已是最新版本，无需同步');
}

module.exports = { sync };