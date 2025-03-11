const fs = require('fs');
const path = require('path');

// Cloudflare Tunnels 配置
const cloudflareConfig = {
  // 从环境变量获取隧道域名和认证信息
  argoDomain: process.env.ARGO_DOMAIN || '',
  argoAuth: process.env.ARGO_AUTH || '',
  argoPort: process.env.ARGO_PORT || 3000,
};

// 如果提供了 ARGO_AUTH 环境变量，创建凭证文件
if (cloudflareConfig.argoAuth) {
  try {
    const credentialsPath = path.join(__dirname, 'credentials.json');
    
    // 检查是否是 JSON 格式
    if (cloudflareConfig.argoAuth.trim().startsWith('{')) {
      fs.writeFileSync(credentialsPath, cloudflareConfig.argoAuth);
      console.log('已使用JSON格式创建Cloudflare凭证文件');
    } else {
      // 尝试解析token格式
      try {
        const parts = cloudflareConfig.argoAuth.split(':');
        if (parts.length >= 2) {
          const credentials = {
            AccountTag: parts[0],
            TunnelSecret: parts[1],
            TunnelID: cloudflareConfig.argoDomain
          };
          fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
          console.log('已使用Token格式创建Cloudflare凭证文件');
        } else {
          // 假设是完整的凭证字符串
          fs.writeFileSync(credentialsPath, cloudflareConfig.argoAuth);
          console.log('已使用原始格式创建Cloudflare凭证文件');
        }
      } catch (parseError) {
        console.error('解析ARGO_AUTH时出错:', parseError);
        // 作为后备，直接写入原始内容
        fs.writeFileSync(credentialsPath, cloudflareConfig.argoAuth);
      }
    }
    
    // 检查文件是否成功创建
    if (fs.existsSync(credentialsPath)) {
      const stats = fs.statSync(credentialsPath);
      if (stats.size > 0) {
        console.log(`凭证文件已创建，大小: ${stats.size} 字节`);
      } else {
        console.error('警告: 凭证文件已创建但为空');
      }
    } else {
      console.error('错误: 凭证文件创建失败');
    }
  } catch (error) {
    console.error('创建Cloudflare凭证文件时出错:', error);
  }
}

module.exports = cloudflareConfig;
