document.addEventListener('DOMContentLoaded', () => {
  // 使用更可靠的固定图片链接，而不是随机API
  const backgrounds = [
    'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg', // 中国山水
    'https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg', // 古代建筑
    'https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg', // 山水画意境
    'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg', // 月亮意境
    'https://images.pexels.com/photos/1693095/pexels-photo-1693095.jpeg'  // 酒杯
  ];

  // 随机选择背景并添加错误处理
  function setRandomBackground() {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    const img = new Image();
    
    // 添加加载事件
    img.onload = function() {
      document.body.style.backgroundImage = `url(${backgrounds[randomIndex]})`;
    };
    
    // 添加错误处理
    img.onerror = function() {
      console.error('背景图片加载失败，使用备用背景');
      document.body.style.backgroundColor = '#2c3e50'; // 使用纯色作为备用
    };
    
    // 开始加载图片
    img.src = backgrounds[randomIndex];
  }

  // 初始化背景
  setRandomBackground();

  // 更换背景按钮
  document.getElementById('change-bg').addEventListener('click', setRandomBackground);

  // 直接使用硬编码的诗词内容，避免API调用问题
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
  
  // 直接渲染诗词内容
  document.getElementById('poem-title').textContent = poem.title;
  document.getElementById('poem-author').textContent = `${poem.dynasty} · ${poem.author}`;
  
  const poemContent = document.getElementById('poem-content');
  poemContent.innerHTML = ''; // 清空现有内容
  
  poem.content.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    poemContent.appendChild(p);
  });
  
  // 保留原API调用作为备用，但不依赖它
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const poemUrl = isLocalhost ? '/api/poem' : '/.netlify/functions/poem';
  
  fetch(poemUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(apiPoem => {
      console.log('API诗词加载成功');
      // API成功时，可以选择用API返回的内容替换硬编码内容
      // 这里我们不替换，因为内容相同，避免闪烁
    })
    .catch(error => {
      console.error('API诗词加载失败:', error);
      // 已经使用硬编码内容，所以这里不需要额外处理
    });
});