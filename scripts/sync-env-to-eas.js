const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 同步本地.env文件到EAS secrets...');

// 检查.env文件是否存在
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env文件不存在，请先创建.env文件');
  console.log('💡 可以复制env.example文件: cp env.example .env');
  process.exit(1);
}

// 读取.env文件
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

// 解析环境变量
const envVars = {};
envLines.forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=');
      envVars[key.trim()] = value.trim();
    }
  }
});

console.log(`📋 找到 ${Object.keys(envVars).length} 个环境变量:`);
Object.keys(envVars).forEach(key => {
  const value = envVars[key];
  const displayValue = value.length > 20 ? `${value.substring(0, 20)}...` : value;
  console.log(`   ${key}: ${displayValue}`);
});

// 检查EAS CLI是否可用
try {
  execSync('eas --version', { stdio: 'pipe' });
} catch (error) {
  console.log('❌ EAS CLI未安装或不可用');
  console.log('💡 请运行: npm install -g eas-cli');
  process.exit(1);
}

// 检查是否登录EAS
try {
  const whoami = execSync('eas whoami', { encoding: 'utf8' });
  console.log(`✅ 已登录EAS账户: ${whoami.trim()}`);
} catch (error) {
  console.log('❌ 未登录EAS账户');
  console.log('💡 请运行: eas login');
  process.exit(1);
}

// 同步环境变量到EAS
console.log('\n🔄 开始同步环境变量...');
let successCount = 0;
let errorCount = 0;

Object.entries(envVars).forEach(([key, value]) => {
  try {
    // 检查secret是否已存在
    try {
      execSync(`eas secret:view --scope project --name ${key}`, { stdio: 'pipe' });
      console.log(`   🔄 更新 ${key}...`);
      // 删除旧的secret
      execSync(`eas secret:delete --scope project --name ${key}`, { stdio: 'pipe' });
    } catch (error) {
      console.log(`   ➕ 创建 ${key}...`);
    }
    
    // 创建新的secret
    execSync(`eas secret:create --scope project --name ${key} --value "${value}"`, { stdio: 'pipe' });
    console.log(`   ✅ ${key} 同步成功`);
    successCount++;
  } catch (error) {
    console.log(`   ❌ ${key} 同步失败: ${error.message}`);
    errorCount++;
  }
});

console.log('\n📊 同步结果:');
console.log(`   ✅ 成功: ${successCount}`);
console.log(`   ❌ 失败: ${errorCount}`);

if (errorCount === 0) {
  console.log('\n🎉 所有环境变量已成功同步到EAS!');
  console.log('💡 现在可以运行: npm run build:production');
} else {
  console.log('\n⚠️ 部分环境变量同步失败，请检查错误信息');
  process.exit(1);
} 