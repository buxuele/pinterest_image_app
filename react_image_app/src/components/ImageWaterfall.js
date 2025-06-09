import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageItem from './ImageItem';

const ImageWaterfall = () => {
  const [images, setImages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [reshuffling, setReshuffling] = useState(false);

  const reshuffleImages = async () => {
    setReshuffling(true);
    setError(null);
    try {
      const response = await axios.post('http://192.168.1.3:8000/api/reshuffle-images');
      if (response.data.status === 'success') {
        // 重置状态并重新加载图片
        setImages([]);
        setSkip(0);
        setHasMore(true);
        await fetchImages();
      } else {
        setError('重命名图片失败');
      }
    } catch (error) {
      console.error('重命名失败：', error);
      setError('重命名图片失败，请检查服务器');
    }
    setReshuffling(false);
  };

  // 在页面加载时调用重命名
  useEffect(() => {
    const shouldReshuffle = !sessionStorage.getItem('hasReshuffled');
    if (shouldReshuffle) {
      reshuffleImages();
      sessionStorage.setItem('hasReshuffled', 'true');
    }
  }, []);

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
        document.documentElement.offsetHeight - 800
      ) {
        fetchImages();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="mt-4">
      <button 
        onClick={reshuffleImages} 
        disabled={reshuffling || loading}
        className="btn btn-success mb-3"
      >
        {reshuffling ? '重命名中...' : '重新打乱图片'}
      </button>
      {error && <p className="text-danger text-center">{error}</p>}
      {images.length === 0 && !loading && !error && <p>暂无图片</p>}
      <div className="image-grid">
        {images.map((image, index) => (
          <ImageItem key={image.filename + index} image={image} />
        ))}
      </div>
      {loading && <p className="text-center">加载中...</p>}
      {!hasMore && <p className="text-center">没有更多图片了</p>}
    </div>
  );
};

export default ImageWaterfall; 