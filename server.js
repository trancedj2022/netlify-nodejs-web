const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || process.env.PORT || 3000;

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));

// API 端点，返回《将进酒》
app.get('/api/poem', (req, res) => {
  const poem = {
    title: '将进酒',
    author: '李白',
    dynasty: '唐',
    content: [
      '君不见，黄河之水天上来，奔流到海不复回。',
      '君不见，高堂明镜悲白发，朝如青丝暮成雪。',
      '人生得意须尽欢，莫使金樽空对月。',
      '天生我材必有用，千金散尽还复来。',
      '烹羊宰牛且为乐，会须一饮三百杯。',
      '岑夫子，丹丘生，将进酒，杯莫停。',
      '与君歌一曲，请君为我倾耳听。',
      '钟鼓馔玉不足贵，但愿长醉不复醒。',
      '古来圣贤皆寂寞，惟有饮者留其名。',
      '陈王昔时宴平乐，斗酒十千恣欢谑。',
      '主人何为言少钱，径须沽取对君酌。',
      '五花马，千金裘，呼儿将出换美酒，与尔同销万古愁。'
    ]
  };
  
  res.json(poem);
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
  
  // 如果设置了 ARGO_AUTH 环境变量，启动 Cloudflare 隧道
  if (process.env.ARGO_AUTH) {
    try {
      // 创建 cloudflare 目录（如果不存在）
      const cloudflareDir = path.join(__dirname, 'cloudflare');
      if (!require('fs').existsSync(cloudflareDir)) {
        require('fs').mkdirSync(cloudflareDir, { recursive: true });
      }
      
      // 启动 Cloudflare 隧道
      const { startTunnel } = require('./cloudflare/tunnel');
      startTunnel().then(tunnel => {
        if (tunnel) {
          console.log(`Cloudflare 隧道已启动，域名: ${process.env.ARGO_DOMAIN || 'my-poetry-app'}`);
          
          // 优雅关闭
          process.on('SIGINT', () => {
            console.log('正在关闭 Cloudflare 隧道...');
            tunnel.kill();
            process.exit(0);
          });
        }
      });
    } catch (error) {
      console.error('启动 Cloudflare 隧道时出错:', error);
    }
  }
});
