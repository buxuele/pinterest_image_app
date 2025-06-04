import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageItem from './components/ImageItem';
import './App.css';

const App = () => {
  const [images, setImages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fetchImages = async () => {
    if (loading || !hasMore) return;
    console.log(`请求图片：skip=${skip}, limit=5`);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://192.168.1.3:8000/images?skip=${skip}&limit=5`);
      console.log('API 响应：', response.data);
      const newImages = response.data;
      if (newImages.length === 0) {
        setHasMore(false);
        console.log('没有更多图片');
      } else {
        setImages((prevImages) => [...prevImages, ...newImages]);
        setSkip((prevSkip) => prevSkip + 5);
      }
    } catch (error) {
      console.error('请求失败：', error.message, error.response);
      setError('无法加载图片，请检查服务器');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 550
      ) {
        fetchImages();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="app">
      <h1>图片瀑布流</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {images.length === 0 && !loading && !error && <p>暂无图片</p>}
      <div className="image-grid">
        {images.map((image, index) => (
          <ImageItem key={image.filename + index} image={image} />
        ))}
      </div>
      {loading && <p>加载中...</p>}
      {!hasMore && <p>没有更多图片了</p>}
    </div>
  );
};

export default App;