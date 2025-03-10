document.addEventListener('DOMContentLoaded', () => {
  // 背景图片数组
  const backgrounds = [
    'https://source.unsplash.com/random/1920x1080/?chinese,landscape',
    'https://source.unsplash.com/random/1920x1080/?mountains,river',
    'https://source.unsplash.com/random/1920x1080/?ancient,china',
    'https://source.unsplash.com/random/1920x1080/?ink,painting',
    'https://source.unsplash.com/random/1920x1080/?bamboo,forest'
  ];

  // 随机选择背景
  function setRandomBackground() {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    document.body.style.backgroundImage = `url(${backgrounds[randomIndex]})`;
  }

  // 初始化背景
  setRandomBackground();

  // 更换背景按钮
  document.getElementById('change-bg').addEventListener('click', setRandomBackground);

  // 获取诗词数据 - 使用 Netlify 函数
  fetch('/.netlify/functions/poem')
    .then(response => response.json())
    .then(poem => {
      document.getElementById('poem-title').textContent = poem.title;
      document.getElementById('poem-author').textContent = `${poem.dynasty} · ${poem.author}`;
      
      const poemContent = document.getElementById('poem-content');
      poem.content.forEach(line => {
        const p = document.createElement('p');
        p.textContent = line;
        poemContent.appendChild(p);
      });
    })
    .catch(error => {
      console.error('Error fetching poem:', error);
      document.getElementById('poem-content').textContent = '加载诗词时出错，请刷新页面重试。';
    });
});