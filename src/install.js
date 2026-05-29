const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 可靠获取业务项目根目录
 */
function getProjectRoot() {
  let currentDir = __dirname;
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = require(packageJsonPath);
        if (pkg.name !== '@pengtaohenry1213-prog/coding-standards') {
          return currentDir;
        }
      } catch (e) {}
    }
    currentDir = path.dirname(currentDir);
  }
  return process.cwd();
}

const projectRoot = getProjectRoot();
const packageRoot = __dirname;
const cacheDir = path.join(projectRoot, 'node_modules');
const cachePath = path.join(cacheDir, '.standards-cache.json');
const packageJson = require(path.join(packageRoot, '../package.json'));
const currentVersion = packageJson.version;

/**
 * 检查是否需要同步
 */
function needSync() {
  if (!fs.existsSync(cachePath)) return true;
  try {
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (cache.version !== currentVersion) return true;
    if (Date.now() - cache.lastSync > 24 * 60 * 1000) return true;
    return false;
  } catch (e) {
    return true;
  }
}

/**
 * 执行同步（静默模式：正常无输出，仅报错抛异常）
 */
function syncStandards(silent = true) {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // 同步 .cursor
    const cursorSrc = path.join(packageRoot, '.cursor');
    const cursorDest = path.join(projectRoot, '.cursor');
    if (fs.existsSync(cursorSrc)) {
      fs.cpSync(cursorSrc, cursorDest, { recursive: true, force: true });
    }

    // 同步 .githooks + 授权
    const hooksSrc = path.join(packageRoot, '.githooks');
    const hooksDest = path.join(projectRoot, '.githooks');
    if (fs.existsSync(hooksSrc)) {
      fs.cpSync(hooksSrc, hooksDest, { recursive: true, force: true });
      fs.readdirSync(hooksDest).forEach(file => {
        const filePath = path.join(hooksDest, file);
        if (fs.statSync(filePath).isFile()) {
          fs.chmodSync(filePath, 0o755);
        }
      });
      execSync('git config core.hooksPath .githooks', { cwd: projectRoot, stdio: 'ignore' });
    }

    // 同步 .gitignore 规则
    const gitignorePath = path.join(projectRoot, '.gitignore');
    const gitignoreRules = [
      '# 自动生成的规范文件，不要手动修改',
      '.cursor/',
      '.githooks/'
    ];
    let gitignoreContent = fs.existsSync(gitignorePath)
      ? fs.readFileSync(gitignorePath, 'utf8')
      : '';
    gitignoreRules.forEach(rule => {
      if (!gitignoreContent.includes(rule)) {
        gitignoreContent += '\n' + rule;
      }
    });
    fs.writeFileSync(gitignorePath, gitignoreContent);

    // 写入缓存
    fs.writeFileSync(cachePath, JSON.stringify({
      version: currentVersion,
      lastSync: Date.now()
    }, null, 2));

    if (!silent) console.log(`✅ 规范已同步至 v${currentVersion}`);
    return true;
  } catch (err) {
    console.error('❌ 规范同步失败：', err.message);
    throw err;
  }
}

// 对外暴露方法，供 Git 钩子调用
function autoSync() {
  if (needSync()) {
    return syncStandards(true);
  }
  return false;
}

// 导出入口
module.exports = { autoSync, syncStandards };

// 命令行直接调用（备用，手动同步用）
if (require.main === module) {
  syncStandards(false);
}