#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 用于诊断 Vercel 部署问题
 */

const requiredEnvVars = [
  'POSTGRES_URL',
  'AUTH_SECRET',
  'BASE_URL',
  'MAIL_SERVER',
  'MAIL_PORT',
  'MAIL_USERNAME',
  'MAIL_PASSWORD',
  'MAIL_FROM_NAME',
  'MAIL_FROM_ADDRESS'
];

const optionalEnvVars = [
  'NODE_ENV',
  'VERCEL',
  'VERCEL_URL'
];

console.log('🔍 检查环境变量配置...');
console.log('================================');

let missingRequired = [];
let presentRequired = [];

// 检查必需的环境变量
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    presentRequired.push(varName);
    console.log(`✅ ${varName}: 已设置`);
  } else {
    missingRequired.push(varName);
    console.log(`❌ ${varName}: 未设置`);
  }
});

console.log('\n可选环境变量:');
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${process.env[varName]}`);
  } else {
    console.log(`⚪ ${varName}: 未设置`);
  }
});

console.log('\n================================');
console.log(`✅ 已设置的必需变量: ${presentRequired.length}/${requiredEnvVars.length}`);

if (missingRequired.length > 0) {
  console.log(`❌ 缺失的必需变量: ${missingRequired.join(', ')}`);
  console.log('\n🚨 部署可能失败！请在 Vercel 控制台中设置以下环境变量:');
  missingRequired.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  process.exit(1);
} else {
  console.log('🎉 所有必需的环境变量都已设置！');
}

// 检查数据库连接
if (process.env.POSTGRES_URL) {
  console.log('\n🔗 数据库连接检查:');
  try {
    const url = new URL(process.env.POSTGRES_URL);
    console.log(`✅ 数据库主机: ${url.hostname}`);
    console.log(`✅ 数据库端口: ${url.port || '5432'}`);
    console.log(`✅ 数据库名称: ${url.pathname.slice(1)}`);
    console.log(`✅ 用户名: ${url.username}`);
  } catch (error) {
    console.log(`❌ 数据库 URL 格式错误: ${error.message}`);
  }
}

console.log('\n📋 Vercel 部署检查清单:');
console.log('1. ✅ 环境变量已在 Vercel 项目设置中配置');
console.log('2. ⚠️  确保数据库允许来自 Vercel 的连接');
console.log('3. ⚠️  检查 AUTH_SECRET 是否为强随机字符串');
console.log('4. ⚠️  确保邮件服务配置正确');
console.log('5. ⚠️  BASE_URL 应设置为您的 Vercel 域名');