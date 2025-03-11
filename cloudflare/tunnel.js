const { spawn } = require('child_process');
const path = require('path');
const config = require('./config');
const fs = require('fs');

// 检查是否安装了 cloudflared
function checkCloudflared() {
  try {
    const result = spawn('cloudflared', ['--version'], { shell: true });
    return new Promise((resolve) => {
      result.on('close', (code) => {
        resolve(code === 0);
      });
    });
  } catch (error) {
    return Promise.resolve(false);
  }
}

// 启动 Cloudflare 隧道
async function startTunnel() {
  const isInstalled = await checkCloudflared();
  
  if (!isInstalled) {
    console.error('未找到 cloudflared。请先安装 Cloudflare Tunnel CLI: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
    return;
  }
  
  if (!config.argoAuth) {
    console.error('未设置 ARGO_AUTH 环境变量。无法启动隧道。');
    return;
  }
  
  // 构建命令行参数
  const args = ['tunnel', '--config', path.join(__dirname, 'config.yml'), 'run'];
  
  // 创建配置文件
  const configYml = `
tunnel: ${config.argoDomain}
credentials-file: ${path.join(__dirname, 'credentials.json')}
ingress:
  - hostname: ${config.argoDomain}.trycloudflare.com
    service: http://localhost:${config.argoPort}
  - service: http_status:404
`;

  fs.writeFileSync(path.join(__dirname, 'config.yml'), configYml);
  console.log('已创建隧道配置文件');
  
  console.log('正在启动 Cloudflare 隧道...');
  console.log(`隧道名称: ${config.argoDomain}`);
  console.log(`本地端口: ${config.argoPort}`);
  
  const tunnel = spawn('cloudflared', args, { 
    shell: true,
    env: { ...process.env }
  });
  
  tunnel.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Cloudflare Tunnel] ${output}`);
    
    // 检测成功连接的消息
    if (output.includes('Connection registered')) {
      console.log('\n========================================');
      console.log(`隧道已成功建立！您可以通过以下地址访问：`);
      console.log(`https://${config.argoDomain}.trycloudflare.com`);
      console.log('========================================\n');
    }
  });
  
  tunnel.stderr.on('data', (data) => {
    console.error(`[Cloudflare Tunnel Error] ${data.toString().trim()}`);
  });
  
  tunnel.on('close', (code) => {
    console.log(`Cloudflare 隧道已关闭，退出码: ${code}`);
    if (code !== 0) {
      console.error('隧道异常关闭，请检查网络连接和认证信息');
    }
  });
  
  return tunnel;
}

module.exports = { startTunnel };

// 如果直接运行此脚本，启动隧道
if (require.main === module) {
  startTunnel();
}