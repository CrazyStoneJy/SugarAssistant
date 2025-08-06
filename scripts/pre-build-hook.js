const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 构建前准备...');

// 检查是否有.env文件
const envPath = path.join(__dirname, '../.env');
const fs = require('fs');

if (fs.existsSync(envPath)) {
  console.log('📋 发现.env文件，同步环境变量到EAS...');
  
  try {
    // 运行环境变量同步脚本
    execSync('node scripts/sync-env-to-eas.js', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ 环境变量同步完成');
  } catch (error) {
    console.log('⚠️ 环境变量同步失败，但继续构建...');
    console.log('💡 请手动运行: node scripts/sync-env-to-eas.js');
  }
} else {
  console.log('⚠️ 未发现.env文件，跳过环境变量同步');
  console.log('💡 如需同步环境变量，请创建.env文件并运行: node scripts/sync-env-to-eas.js');
}

console.log('🎯 准备开始构建...'); 