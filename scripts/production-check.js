#!/usr/bin/env node

/**
 * 生产环境健康检查脚本
 * 检查应用的各项配置和服务是否正常
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

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

function checkEnvironmentVariables() {
  log('\n🔧 检查环境变量配置...', 'cyan');
  
  const requiredVars = {
    'POSTGRES_URL': '数据库连接',
    'BASE_URL': '应用基础URL',
    'AUTH_SECRET': '认证密钥'
  };

  const optionalVars = {
    'MAIL_SERVER': '邮件服务器',
    'MAIL_USERNAME': '邮件用户名',
    'MAIL_PASSWORD': '邮件密码',
    'NODE_ENV': '环境类型'
  };

  let allGood = true;

  // 检查必需变量
  Object.entries(requiredVars).forEach(([varName, description]) => {
    if (process.env[varName]) {
      log(`   ✅ ${description}: 已配置`, 'green');
    } else {
      log(`   ❌ ${description}: 未配置`, 'red');
      allGood = false;
    }
  });

  // 检查可选变量
  Object.entries(optionalVars).forEach(([varName, description]) => {
    if (process.env[varName]) {
      log(`   ✅ ${description}: 已配置`, 'green');
    } else {
      log(`   ⚠️  ${description}: 未配置`, 'yellow');
    }
  });

  return allGood;
}

function checkDatabaseConnection() {
  log('\n🗄️ 检查数据库连接...', 'cyan');
  
  try {
    execSync('npm run db:generate', { stdio: 'pipe' });
    log('   ✅ 数据库连接正常', 'green');
    return true;
  } catch (error) {
    log('   ❌ 数据库连接失败', 'red');
    log(`   错误信息: ${error.message}`, 'red');
    return false;
  }
}

function checkEmailConfiguration() {
  log('\n📧 检查邮件配置...', 'cyan');
  
  const emailVars = ['MAIL_SERVER', 'MAIL_USERNAME', 'MAIL_PASSWORD'];
  const hasEmailConfig = emailVars.every(varName => process.env[varName]);
  
  if (hasEmailConfig) {
    log('   ✅ 邮件服务已配置', 'green');
    log('   💡 建议访问 /test-email 页面测试邮件发送', 'blue');
    return true;
  } else {
    log('   ⚠️  邮件服务未完整配置', 'yellow');
    log('   📝 系统将使用模拟模式发送邮件', 'yellow');
    return false;
  }
}

function checkApplicationHealth() {
  log('\n🏥 检查应用健康状态...', 'cyan');
  
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    log('   ❌ BASE_URL 未设置，无法检查应用健康状态', 'red');
    return false;
  }

  return new Promise((resolve) => {
    const isHttps = baseUrl.startsWith('https://');
    const lib = isHttps ? https : http;
    const url = new URL(baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/',
      method: 'GET',
      timeout: 10000
    };

    const req = lib.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 307) {
        log('   ✅ 应用响应正常', 'green');
        log(`   📊 状态码: ${res.statusCode}`, 'blue');
        resolve(true);
      } else {
        log(`   ⚠️  应用响应异常，状态码: ${res.statusCode}`, 'yellow');
        resolve(false);
      }
    });

    req.on('error', (error) => {
      log('   ❌ 应用连接失败', 'red');
      log(`   错误信息: ${error.message}`, 'red');
      resolve(false);
    });

    req.on('timeout', () => {
      log('   ❌ 应用响应超时', 'red');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

function checkSSLCertificate() {
  log('\n🔒 检查SSL证书...', 'cyan');
  
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl || !baseUrl.startsWith('https://')) {
    log('   ⚠️  未使用HTTPS，建议在生产环境启用SSL', 'yellow');
    return false;
  }

  return new Promise((resolve) => {
    const url = new URL(baseUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      method: 'HEAD',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      const cert = res.connection.getPeerCertificate();
      if (cert && cert.valid_to) {
        const expiryDate = new Date(cert.valid_to);
        const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry > 30) {
          log(`   ✅ SSL证书有效，${daysUntilExpiry}天后到期`, 'green');
        } else if (daysUntilExpiry > 0) {
          log(`   ⚠️  SSL证书即将到期，${daysUntilExpiry}天后到期`, 'yellow');
        } else {
          log('   ❌ SSL证书已过期', 'red');
        }
        resolve(daysUntilExpiry > 0);
      } else {
        log('   ❌ 无法获取SSL证书信息', 'red');
        resolve(false);
      }
    });

    req.on('error', (error) => {
      log('   ❌ SSL检查失败', 'red');
      log(`   错误信息: ${error.message}`, 'red');
      resolve(false);
    });

    req.on('timeout', () => {
      log('   ❌ SSL检查超时', 'red');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

function checkSecurityHeaders() {
  log('\n🛡️ 检查安全头配置...', 'cyan');
  
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    log('   ❌ 无法检查安全头，BASE_URL未设置', 'red');
    return false;
  }

  return new Promise((resolve) => {
    const isHttps = baseUrl.startsWith('https://');
    const lib = isHttps ? https : http;
    const url = new URL(baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/',
      method: 'HEAD',
      timeout: 10000
    };

    const req = lib.request(options, (res) => {
      const securityHeaders = {
        'x-frame-options': 'X-Frame-Options',
        'x-content-type-options': 'X-Content-Type-Options',
        'x-xss-protection': 'X-XSS-Protection',
        'strict-transport-security': 'Strict-Transport-Security',
        'content-security-policy': 'Content-Security-Policy'
      };

      let secureHeaders = 0;
      Object.entries(securityHeaders).forEach(([header, displayName]) => {
        if (res.headers[header]) {
          log(`   ✅ ${displayName}: 已设置`, 'green');
          secureHeaders++;
        } else {
          log(`   ⚠️  ${displayName}: 未设置`, 'yellow');
        }
      });

      const isSecure = secureHeaders >= 3;
      if (isSecure) {
        log(`   ✅ 安全头配置良好 (${secureHeaders}/5)`, 'green');
      } else {
        log(`   ⚠️  建议配置更多安全头 (${secureHeaders}/5)`, 'yellow');
      }
      
      resolve(isSecure);
    });

    req.on('error', (error) => {
      log('   ❌ 安全头检查失败', 'red');
      log(`   错误信息: ${error.message}`, 'red');
      resolve(false);
    });

    req.on('timeout', () => {
      log('   ❌ 安全头检查超时', 'red');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

function generateHealthReport(results) {
  log('\n📊 生产环境健康报告', 'magenta');
  log('=' * 50, 'magenta');
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const healthScore = Math.round((passedChecks / totalChecks) * 100);
  
  log(`\n🏥 总体健康评分: ${healthScore}%`, healthScore >= 80 ? 'green' : healthScore >= 60 ? 'yellow' : 'red');
  log(`📈 通过检查: ${passedChecks}/${totalChecks}`, 'blue');
  
  // 详细结果
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`   ${status} ${check}`, color);
  });
  
  // 建议
  log('\n💡 改进建议:', 'cyan');
  
  if (!results['环境变量']) {
    log('   • 配置缺失的环境变量', 'yellow');
  }
  
  if (!results['数据库连接']) {
    log('   • 检查数据库连接配置', 'yellow');
  }
  
  if (!results['邮件配置']) {
    log('   • 配置邮件服务提高功能完整性', 'yellow');
  }
  
  if (!results['SSL证书']) {
    log('   • 启用HTTPS和SSL证书', 'yellow');
  }
  
  if (!results['安全头']) {
    log('   • 配置安全HTTP头提高安全性', 'yellow');
  }
  
  if (healthScore >= 80) {
    log('\n🎉 恭喜！您的应用已准备好为用户提供服务！', 'green');
  } else if (healthScore >= 60) {
    log('\n⚠️  应用基本可用，建议优化上述问题', 'yellow');
  } else {
    log('\n❌ 应用存在重要问题，请优先解决', 'red');
  }
  
  return healthScore;
}

async function main() {
  log('🔍 开始生产环境健康检查', 'magenta');
  log('=' * 50, 'magenta');
  
  const results = {};
  
  // 执行各项检查
  results['环境变量'] = checkEnvironmentVariables();
  results['数据库连接'] = checkDatabaseConnection();
  results['邮件配置'] = checkEmailConfiguration();
  results['应用健康'] = await checkApplicationHealth();
  results['SSL证书'] = await checkSSLCertificate();
  results['安全头'] = await checkSecurityHeaders();
  
  // 生成报告
  const healthScore = generateHealthReport(results);
  
  // 退出码
  process.exit(healthScore >= 60 ? 0 : 1);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    log(`💥 健康检查过程中出现错误: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  checkEnvironmentVariables,
  checkDatabaseConnection,
  checkEmailConfiguration,
  checkApplicationHealth,
  checkSSLCertificate,
  checkSecurityHeaders
};