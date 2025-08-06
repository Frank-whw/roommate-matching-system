#!/usr/bin/env node

/**
 * Vercel 部署设置助手
 * 帮助生成必要的配置和检查部署准备情况
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel 部署设置助手');
console.log('========================');

// 生成 AUTH_SECRET
function generateAuthSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// 读取当前 .env 文件
function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    return envVars;
  }
  return {};
}

// 生成 Vercel 环境变量配置
function generateVercelEnvConfig() {
  const envVars = readEnvFile();
  const authSecret = generateAuthSecret();
  
  console.log('\n📋 Vercel 环境变量配置');
  console.log('请在 Vercel Dashboard → Settings → Environment Variables 中添加以下变量:\n');
  
  const requiredVars = {
    'POSTGRES_URL': envVars.POSTGRES_URL || 'postgresql://user:password@host:5432/database',
    'AUTH_SECRET': authSecret,
    'BASE_URL': 'https://your-app.vercel.app',
    'MAIL_SERVER': envVars.MAIL_SERVER || 'smtp.qq.com',
    'MAIL_PORT': envVars.MAIL_PORT || '587',
    'MAIL_USERNAME': envVars.MAIL_USERNAME || 'your@email.com',
    'MAIL_PASSWORD': envVars.MAIL_PASSWORD || 'your-auth-code',
    'MAIL_FROM_NAME': envVars.MAIL_FROM_NAME || 'RoomieSync',
    'MAIL_FROM_ADDRESS': envVars.MAIL_FROM_ADDRESS || 'your@email.com'
  };
  
  Object.entries(requiredVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('\n⚠️  重要提醒:');
  console.log('1. 🔑 AUTH_SECRET 已自动生成，请使用上面显示的值');
  console.log('2. 🌐 BASE_URL 请替换为您的实际 Vercel 域名');
  console.log('3. 📧 邮件相关配置请使用您的真实邮箱信息');
  console.log('4. 🗄️  POSTGRES_URL 请使用您的数据库连接字符串');
  
  return { requiredVars, authSecret };
}

// 检查本地配置
function checkLocalConfig() {
  console.log('\n🔍 检查本地配置');
  console.log('==================');
  
  const envVars = readEnvFile();
  const requiredKeys = [
    'POSTGRES_URL', 'AUTH_SECRET', 'BASE_URL',
    'MAIL_SERVER', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD',
    'MAIL_FROM_NAME', 'MAIL_FROM_ADDRESS'
  ];
  
  let allPresent = true;
  
  requiredKeys.forEach(key => {
    if (envVars[key]) {
      console.log(`✅ ${key}: 已设置`);
    } else {
      console.log(`❌ ${key}: 未设置`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log('\n🎉 本地配置完整！');
  } else {
    console.log('\n⚠️  本地配置不完整，但这不影响 Vercel 部署');
    console.log('   Vercel 将使用在控制台中设置的环境变量');
  }
  
  return allPresent;
}

// 生成部署检查清单
function generateDeploymentChecklist() {
  console.log('\n📋 Vercel 部署检查清单');
  console.log('========================');
  console.log('□ 1. 代码已推送到 GitHub');
  console.log('□ 2. 在 Vercel 中创建了新项目');
  console.log('□ 3. 已设置所有必需的环境变量');
  console.log('□ 4. 数据库已创建并可访问');
  console.log('□ 5. 邮箱服务已配置并获取授权码');
  console.log('□ 6. BASE_URL 已设置为正确的域名');
  console.log('□ 7. 部署成功且无错误');
  console.log('□ 8. 测试注册和登录功能');
  
  console.log('\n🔗 有用的链接:');
  console.log('- Vercel Dashboard: https://vercel.com/dashboard');
  console.log('- Supabase: https://supabase.com');
  console.log('- Neon: https://neon.tech');
}

// 主函数
function main() {
  try {
    // 检查本地配置
    checkLocalConfig();
    
    // 生成 Vercel 配置
    const { authSecret } = generateVercelEnvConfig();
    
    // 生成检查清单
    generateDeploymentChecklist();
    
    console.log('\n💡 提示:');
    console.log('- 运行 `npm run check:env` 检查环境变量');
    console.log('- 查看 VERCEL_DEPLOY_GUIDE.md 获取详细部署指南');
    console.log('- 遇到问题请参考 VERCEL_TROUBLESHOOTING.md');
    
  } catch (error) {
    console.error('❌ 设置过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  generateAuthSecret,
  readEnvFile,
  generateVercelEnvConfig,
  checkLocalConfig
};