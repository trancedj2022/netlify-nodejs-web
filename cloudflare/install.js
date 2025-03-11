const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn, exec } = require('child_process');
const os = require('os');

// 检测操作系统和架构
const platform = os.platform();
const arch = os.arch();

async function installCloudflared() {
  console.log('开始安装 Cloudflare Tunnel CLI (cloudflared)...');
  
  // 为Windows系统下载cloudflared
  if (platform === 'win32') {
    const downloadUrl = arch === 'x64' 
      ? 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe'
      : 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-386.exe';
    
    const binPath = path.join(__dirname, '..', 'bin');
    const exePath = path.join(binPath, 'cloudflared.exe');
    
    // 创建bin目录
    if (!fs.existsSync(binPath)) {
      fs.mkdirSync(binPath, { recursive: true });
    }
    
    console.log(`正在从 ${downloadUrl} 下载 cloudflared...`);
    
    // 下载文件
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(exePath);
      https.get(downloadUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`下载失败，状态码: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`cloudflared 已下载到 ${exePath}`);
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(exePath, () => {});
        reject(err);
      });
    });
    
    // 添加到PATH
    console.log('将 cloudflared 添加到当前环境...');
    process.env.PATH = `${binPath};${process.env.PATH}`;
    
    // 测试安装
    try {
      const { stdout } = await execPromise(`"${exePath}" --version`);
      console.log(`cloudflared 安装成功! 版本: ${stdout.trim()}`);
      console.log('\n要在其他命令提示符中使用 cloudflared，请将以下路径添加到系统环境变量:');
      console.log(binPath);
      return true;
    } catch (error) {
      console.error('安装后测试失败:', error);
      return false;
    }
  } else {
    console.log('非Windows系统，请参考以下链接手动安装 cloudflared:');
    console.log('https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
    return false;
  }
}

// 执行命令并返回Promise
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

// 如果直接运行此脚本，执行安装
if (require.main === module) {
  installCloudflared().catch(error => {
    console.error('安装过程中出错:', error);
    process.exit(1);
  });
}

module.exports = { installCloudflared };