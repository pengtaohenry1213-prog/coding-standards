const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const projectRoot = process.cwd();
// 包内的规范文件目录
const packageRoot = __dirname;

console.log('🔧 正在同步团队编码规范...');

// 1. 复制.cursor目录到项目根目录
const cursorSrc = path.join(packageRoot, '.cursor');
const cursorDest = path.join(projectRoot, '.cursor');
if (fs.existsSync(cursorSrc)) {
  fs.cpSync(cursorSrc, cursorDest, { recursive: true, force: true });
  console.log('✅ .cursor 规范已同步');
}

// 2. 复制.githooks目录到项目根目录
const hooksSrc = path.join(packageRoot, '.githooks');
const hooksDest = path.join(projectRoot, '.githooks');
if (fs.existsSync(hooksSrc)) {
  fs.cpSync(hooksSrc, hooksDest, { recursive: true, force: true });
  // 自动设置Git钩子路径
  execSync('git config core.hooksPath .githooks', { cwd: projectRoot });
  console.log('✅ Git钩子已配置');
}

// 3. 自动添加.gitignore规则
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

// 只添加不存在的规则
gitignoreRules.forEach(rule => {
  if (!gitignoreContent.includes(rule)) {
    gitignoreContent += '\n' + rule;
  }
});

fs.writeFileSync(gitignorePath, gitignoreContent);
console.log('✅ .gitignore 已更新');

console.log('\n🎉 团队编码规范同步完成！');