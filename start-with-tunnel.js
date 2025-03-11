// 设置环境变量
process.env.ARGO_DOMAIN = process.env.ARGO_DOMAIN || '';
process.env.ARGO_AUTH = process.env.ARGO_AUTH || ''; // 在实际使用时需要设置此值
process.env.ARGO_PORT = process.env.ARGO_PORT || ''; // 添加端口变量

// 启动应用
require('./server');
