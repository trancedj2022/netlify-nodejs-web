const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./config');

async function runCommand(command, args = []) {
  return new Promise((resolve) => {
    const process = spawn(command, args, { shell: true });
    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', (code) => {
      resolve({ code, output });
    });
  });
}

async function diagnose() {
  console.log('===== Cloudflare Tunnel 诊断工具 =====');
  
  // 检查环境变量
  console.log('\n1. 检查环境变量:');
  console.log(`ARGO_DOMAIN: ${process.env.ARGO_DOMAIN || '未设置'}`);
  console.log(`ARGO_PORT: ${process.env.ARGO_PORT || '未设置'}`);
  console.log(`ARGO_AUTH: ${process.env.ARGO_AUTH ? '已设置' : '未设置'}`);
  
  // 检查 cloudflared 是否安装
  console.log('\n2. 检查 cloudflared 安装:');
  const cloudflaredCheck = await runCommand('cloudflared', ['--version']);
  if (cloudflaredCheck.code === 0) {
    console.log(`cloudflared 已安装: ${cloudflaredCheck.output.trim()}`);
  } else {
    console.error('cloudflared 未安装或不在PATH中');
    console.log('请从 https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/ 下载并安装');
  }
  
  // 检查凭证文件
  console.log('\n3. 检查凭证文件:');
  const credentialsPath = path.join(__dirname, 'credentials.json');
  if (fs.existsSync(credentialsPath)) {
    const stats = fs.statSync(credentialsPath);
    console.log(`凭证文件存在，大小: ${stats.size} 字节`);
    
    // 尝试验证JSON格式
    try {
      const content = fs.readFileSync(credentialsPath, 'utf8');
      JSON.parse(content);
      console.log('凭证文件是有效的JSON格式');
    } catch (error) {
      console.error('凭证文件不是有效的JSON格式:', error.message);
    }
  } else {
    console.error('凭证文件不存在');
  }
  
  // 检查网络连接
  console.log('\n4. 检查网络连接:');
  const pingResult = await runCommand('ping', ['-n', '3', 'cloudflare.com']);
  console.log(pingResult.output);
  
  // 检查本地服务
  console.log('\n5. 检查本地服务:');
  const port = process.env.ARGO_PORT || 3000;
  const netstatResult = await runCommand('netstat', ['-ano', '|', 'findstr', `:${port}`]);
  if (netstatResult.output.trim()) {
    console.log(`端口 ${port} 已被占用，可能是您的应用正在运行:`);
    console.log(netstatResult.output);
  } else {
    console.error(`端口 ${port} 未被占用，您的应用可能未启动`);
  }
  
  console.log('\n===== 诊断完成 =====');
  console.log('如果您仍然遇到问题，请尝试以下步骤:');
  console.log('1. 确保您的 ARGO_AUTH 值正确');
  console.log('2. 检查您的网络是否允许出站连接到 Cloudflare');
  console.log('3. 尝试重新启动应用和隧道');
  console.log('4. 查看 Cloudflare 仪表板中的隧道状态');
}

// 运行诊断
diagnose();