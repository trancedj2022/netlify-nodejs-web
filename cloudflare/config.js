const fs = require('fs');
const path = require('path');

// Cloudflare Tunnels 配置
const cloudflareConfig = {
  // 从环境变量获取隧道域名和认证信息
  argoDomain: process.env.ARGO_DOMAIN || 'my-poetry-app',
  argoAuth: process.env.ARGO_AUTH || '',
  // 添加端口配置
  argoPort: process.env.ARGO_PORT || 3000,
  
  // 隧道配置
  tunnelConfig: {
    'tunnel-name': process.env.ARGO_DOMAIN || 'my-poetry-app',
    'credentials-file': path.join(__dirname, 'credentials.json'),
    'url': `http://localhost:${process.env.ARGO_PORT || 3000}`,
    'logfile': path.join(__dirname, 'cloudflared.log')
  }
};

// 如果提供了 ARGO_AUTH 环境变量，创建凭证文件
if (process.env.ARGO_AUTH) {
  try {
    // 检查是否是 JSON 格式
    if (process.env.ARGO_AUTH.startsWith('{')) {
      fs.writeFileSync(
        path.join(__dirname, 'credentials.json'),
        process.env.ARGO_AUTH
      );
    } else {
      // 假设是 token 格式
      fs.writeFileSync(
        path.join(__dirname, 'credentials.json'),
        JSON.stringify({ 
          AccountTag: process.env.ARGO_AUTH.split(':')[0],
          TunnelSecret: process.env.ARGO_AUTH.split(':')[1],
          TunnelID: process.env.ARGO_DOMAIN
        })
      );
    }
    console.log('Cloudflare 凭证文件已创建');
  } catch (error) {
    console.error('创建 Cloudflare 凭证文件时出错:', error);
  }
}

module.exports = cloudflareConfig;