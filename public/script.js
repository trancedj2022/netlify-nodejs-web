document.addEventListener('DOMContentLoaded', () => {
  // 背景图片数组 - 修改为更契合《将进酒》意境的图片
  const backgrounds = [
    'https://source.unsplash.com/random/1920x1080/?ancient,wine,feast', // 古代酒宴
    'https://source.unsplash.com/random/1920x1080/?yellow,river,mountains', // 黄河山水
    'https://source.unsplash.com/random/1920x1080/?chinese,calligraphy,poetry', // 中国书法诗词
    'https://source.unsplash.com/random/1920x1080/?moonlight,wine,cup', // 明月与酒杯
    'https://source.unsplash.com/random/1920x1080/?ancient,chinese,scholar' // 古代文人
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