import React, { useState, useEffect } from 'react';

const quotes = [
  "Fuck them! I have the balls to ask the question.",
  "一个好的发送机，能承受高压而不会爆炸。",
  "You just decide. The mind is significantly more powerful than we know.",
  "Quit smoking. This is the way.",
  "Remember, you are who you choose to be. Your decisions define you.",
  "I was talking to this woman I had an insane crush on and told her I smoked and she made a face. I stopped after that. It's been over ten years since I last smoked.",
  "Elon Musk: Be useful to people.",
  "个人产出, 要大于个人消费。",
  '道理都是"空头支票"，改变才是"真金白银"。',
  "Fuck be normal."
];

const QuotesPage = () => {
  const [currentQuote, setCurrentQuote] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showCopied, setShowCopied] = useState(false);
  const [gradient, setGradient] = useState('linear-gradient(to right, #ff8a00, #da1b60)');

  // 生成随机名言
  const generateRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
    generateRandomGradient();
  };

  // 生成随机渐变色
  const generateRandomGradient = () => {
    const colors = [
      ['#ff8a00', '#da1b60'],  // 橙紫
      ['#00c6ff', '#0072ff'],  // 蓝蓝
      ['#11998e', '#38ef7d'],  // 绿绿
      ['#fc466b', '#3f5efb'],  // 粉蓝
      ['#f857a6', '#ff5858'],  // 粉红
      ['#834d9b', '#d04ed6'],  // 紫紫
      ['#1a2980', '#26d0ce'],  // 深蓝青
      ['#ff512f', '#dd2476'],  // 橙红
    ];
    const randomColors = colors[Math.floor(Math.random() * colors.length)];
    setGradient(`linear-gradient(to right, ${randomColors[0]}, ${randomColors[1]})`);
  };

  // 添加到收藏
  const toggleFavorite = () => {
    if (favorites.includes(currentQuote)) {
      setFavorites(favorites.filter(quote => quote !== currentQuote));
    } else {
      setFavorites([...favorites, currentQuote]);
    }
  };

  // 复制名言
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentQuote);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 分享到 Twitter
  const shareToTwitter = () => {
    const text = encodeURIComponent(currentQuote);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  // 页面加载时生成第一条名言
  useEffect(() => {
    generateRandomQuote();
  }, []);

  return (
    <div className="mt-4">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div 
                className="quote-display p-4 mb-4 rounded"
                style={{
                  background: '#f3e5f5',  // Light purple background
                  border: '1px solid #e1bee7',
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                <p 
                  className="quote-text mb-0"
                  style={{
                    backgroundImage: gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '2rem',
                    fontFamily: '"Times New Roman", Times, serif',
                    lineHeight: '1.6',
                    padding: '0 20px'
                  }}
                >
                  {currentQuote}
                </p>
              </div>

              <div className="d-flex justify-content-center">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={generateRandomQuote}
                >
                  换一条
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotesPage; 