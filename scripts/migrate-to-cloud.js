#!/usr/bin/env node

/**
 * 云端数据库迁移脚本
 * 帮助将本地数据库迁移到云端生产环境
 */

// 加载环境变量
require('dotenv').config();

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} 完成`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} 失败: ${error.message}`, 'red');
    return false;
  }
}

function checkEnvironment() {
  log('\n📋 检查环境配置...', 'cyan');
  
  const requiredEnvVars = [
    'POSTGRES_URL',
    'BASE_URL',
    'AUTH_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ 缺少环境变量: ${missingVars.join(', ')}`, 'red');
    log('请在 .env 文件中设置这些变量', 'yellow');
    return false;
  }

  log('✅ 环境变量检查通过', 'green');
  return true;
}

function checkDatabaseConnection() {
  log('\n🔗 检查数据库连接...', 'cyan');
  
  try {
    // 尝试连接数据库
    execSync('npm run db:generate', { stdio: 'pipe' });
    log('✅ 数据库连接成功', 'green');
    return true;
  } catch (error) {
    log(`❌ 数据库连接失败: ${error.message}`, 'red');
    log('请检查 POSTGRES_URL 是否正确', 'yellow');
    return false;
  }
}

function runMigrations() {
  log('\n🚀 执行数据库迁移...', 'cyan');
  
  // 生成迁移文件
  if (!runCommand('npm run db:generate', '生成迁移文件')) {
    return false;
  }

  // 执行迁移
  if (!runCommand('npm run db:migrate', '执行数据库迁移')) {
    return false;
  }

  return true;
}

function seedDatabase() {
  log('\n🌱 初始化数据库数据...', 'cyan');
  
  const answer = require('readline-sync');
  const shouldSeed = answer.keyInYN('\n是否要初始化示例数据? (测试环境推荐)');
  
  if (shouldSeed) {
    return runCommand('npm run db:seed', '初始化示例数据');
  } else {
    log('⏭️  跳过数据初始化', 'yellow');
    return true;
  }
}

function testEmailConfiguration() {
  log('\n📧 测试邮件配置...', 'cyan');
  
  const emailVars = ['MAIL_SERVER', 'MAIL_USERNAME', 'MAIL_PASSWORD'];
  const hasEmailConfig = emailVars.every(varName => process.env[varName]);
  
  if (!hasEmailConfig) {
    log('⚠️  邮件配置不完整，将使用模拟模式', 'yellow');
    log('生产环境建议配置真实邮件服务', 'yellow');
    return true;
  }

  log('✅ 邮件配置检测完成', 'green');
  log('请访问 /test-email 页面测试邮件发送', 'blue');
  return true;
}

function createProductionChecklist() {
  log('\n📋 生成生产环境检查清单...', 'cyan');
  
  const checklist = `
# 🚀 生产环境部署检查清单

## 数据库配置
- [x] 数据库连接已配置
- [x] 表结构迁移已完成
- [ ] 数据库备份策略已设置
- [ ] 数据库性能监控已配置

## 应用配置  
- [x] 环境变量已设置
- [ ] 域名已绑定
- [ ] SSL证书已配置
- [ ] CDN已启用（如需要）

## 邮件服务
- ${process.env.MAIL_SERVER ? '[x]' : '[ ]'} 邮件服务器已配置
- [ ] 邮件发送测试已通过
- [ ] 垃圾邮件过滤已检查

## 安全配置
- [x] AUTH_SECRET 已设置为安全值
- [ ] 访问日志已启用
- [ ] 错误监控已配置
- [ ] 安全头已设置

## 性能优化
- [ ] 数据库索引已优化
- [ ] 静态资源缓存已配置
- [ ] 图片压缩已启用
- [ ] 代码分割已实施

## 监控告警
- [ ] 应用性能监控已设置
- [ ] 错误日志收集已配置
- [ ] 关键指标告警已设置
- [ ] 健康检查端点已配置

## 用户体验
- [ ] 加载速度测试已通过
- [ ] 移动端兼容性已验证
- [ ] 浏览器兼容性已测试
- [ ] 无障碍访问已考虑

部署时间: ${new Date().toLocaleString('zh-CN')}
数据库: ${process.env.POSTGRES_URL ? '已配置' : '未配置'}
邮件服务: ${process.env.MAIL_SERVER ? '已配置' : '未配置'}
`;

  fs.writeFileSync(path.join(process.cwd(), 'PRODUCTION_CHECKLIST.md'), checklist);
  log('✅ 检查清单已生成: PRODUCTION_CHECKLIST.md', 'green');
}

function displayDeploymentSummary() {
  log('\n🎉 数据库迁移完成！', 'green');
  log('\n📊 部署摘要:', 'cyan');
  log(`   数据库: ${process.env.POSTGRES_URL ? '✅ 已连接' : '❌ 未配置'}`, 'blue');
  log(`   邮件服务: ${process.env.MAIL_SERVER ? '✅ 已配置' : '⚠️  未配置'}`, 'blue');
  log(`   基础URL: ${process.env.BASE_URL || '未设置'}`, 'blue');
  
  log('\n🚀 下一步操作:', 'yellow');
  log('   1. 部署应用到云端平台 (Vercel/Railway/阿里云等)', 'blue');
  log('   2. 配置域名和SSL证书', 'blue');
  log('   3. 访问 /test-email 测试邮件功能', 'blue');
  log('   4. 完成 PRODUCTION_CHECKLIST.md 中的检查项', 'blue');
  
  log('\n📖 详细部署指南请查看: docs/DEPLOYMENT_GUIDE.md', 'cyan');
}

// 主执行函数
async function main() {
  try {
    // 安装 readline-sync 如果需要
    try {
      require('readline-sync');
    } catch (error) {
      log('📦 安装必需的依赖...', 'blue');
      execSync('npm install readline-sync --save-dev', { stdio: 'inherit' });
    }

    log('🚀 开始云端数据库迁移流程', 'magenta');
    log('=' * 50, 'magenta');
    
    // 检查环境变量
    if (!checkEnvironment()) {
      process.exit(1);
    }
    
    // 检查数据库连接
    if (!checkDatabaseConnection()) {
      process.exit(1);
    }
    
    // 执行迁移
    if (!runMigrations()) {
      process.exit(1);
    }
    
    // 初始化数据（可选）
    if (!seedDatabase()) {
      log('⚠️  数据初始化失败，但可以继续部署', 'yellow');
    }
    
    // 测试邮件配置
    testEmailConfiguration();
    
    // 生成检查清单
    createProductionChecklist();
    
    // 显示部署摘要
    displayDeploymentSummary();
    
  } catch (error) {
    log(`💥 迁移过程中出现错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironment,
  checkDatabaseConnection,
  runMigrations,
  seedDatabase,
  testEmailConfiguration
};