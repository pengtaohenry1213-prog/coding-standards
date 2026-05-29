const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const projectRoot = process.cwd();
// 包内的规范文件目录
const packageRoot = __dirname;
// 缓存文件路径（存放在node_modules内部，不会被提交）
const cachePath = path.join(projectRoot, 'node_modules', '.standards-cache.json');

// 读取当前包的版本号
const packageJson = require(path.join(packageRoot, '../package.json'));
const currentVersion = packageJson.version;

console.log('\n🔧 正在检查团队编码规范...');

/**
 * 检查是否需要同步规范
 * @returns {boolean}
 */
function needSync() {
  // 如果缓存文件不存在，必须同步
  if (!fs.existsSync(cachePath)) return true;

  try {
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    // 版本号变化，必须同步
    if (cache.version !== currentVersion) return true;
    // 超过24小时强制同步一次（防止缓存异常）
    if (Date.now() - cache.lastSync > 24 * 60 * 60 * 1000) return true;
    return false;
  } catch (e) {
    // 缓存文件损坏，重新同步
    return true;
  }
}

/**
 * 执行规范同步
 */
function syncStandards() {
  console.log(`📦 正在同步规范版本 v${currentVersion}...\n`);

  // 1. 同步.cursor目录
  const cursorSrc = path.join(packageRoot, '.cursor');
  const cursorDest = path.join(projectRoot, '.cursor');
  if (fs.existsSync(cursorSrc)) {
    fs.cpSync(cursorSrc, cursorDest, { recursive: true, force: true });
    console.log('✅ .cursor 规范已同步');
  }

  // 2. 同步.git hooks目录
  const hooksSrc = path.join(packageRoot, '.githooks');
  const hooksDest = path.join(projectRoot, '.githooks');
  if (fs.existsSync(hooksSrc)) {
    fs.cpSync(hooksSrc, hooksDest, { recursive: true, force: true });
    // 自动给所有钩子添加执行权限
    fs.readdirSync(hooksDest).forEach(file => {
      const filePath = path.join(hooksDest, file);
      if (fs.statSync(filePath).isFile()) {
        fs.chmodSync(filePath, 0o755);
      }
    });
    // 配置Git钩子路径
    execSync('git config core.hooksPath .githooks', { cwd: projectRoot });
    console.log('✅ Git钩子已配置并添加执行权限');
  }

  // 3. 更新.gitignore规则
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const gitignoreRules = [
    '# ========================================',
    '# 自动生成的规范文件，不要手动修改',
    '# ========================================',
    '.cursor/',
    '.githooks/'
  ];

  let gitignoreContent = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }

  // 只添加不存在的规则
  gitignoreRules.forEach(rule => {
    if (!gitignoreContent.includes(rule)) {
      gitignoreContent += '\n' + rule;
    }
  });

  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ .gitignore 规则已更新');

  // 4. 写入缓存
  fs.writeFileSync(cachePath, JSON.stringify({
    version: currentVersion,
    lastSync: Date.now()
  }, null, 2));

  console.log('\n🎉 团队编码规范同步完成！\n');
}

// 主逻辑
if (needSync()) {
  syncStandards();
} else {
  console.log('✅ 规范已是最新版本，无需同步\n');
}

// 导出同步函数，供业务项目手动调用
module.exports = {
  sync: syncStandards
};