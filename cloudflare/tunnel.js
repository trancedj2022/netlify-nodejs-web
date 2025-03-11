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
  const args = ['tunnel', 'run'];
  
  // 添加隧道名称或 ID
  if (config.argoDomain) {
    args.push(config.argoDomain);
  }
  
  console.log('正在启动 Cloudflare 隧道...');
  console.log(`隧道名称: ${config.argoDomain}`);
  
  const tunnel = spawn('cloudflared', args, { 
    shell: true,
    env: { ...process.env }
  });
  
  tunnel.stdout.on('data', (data) => {
    console.log(`[Cloudflare Tunnel] ${data.toString().trim()}`);
  });
  
  tunnel.stderr.on('data', (data) => {
    console.error(`[Cloudflare Tunnel Error] ${data.toString().trim()}`);
  });
  
  tunnel.on('close', (code) => {
    console.log(`Cloudflare 隧道已关闭，退出码: ${code}`);
  });
  
  return tunnel;
}

module.exports = { startTunnel };

// 如果直接运行此脚本，启动隧道
if (require.main === module) {
  startTunnel();
}