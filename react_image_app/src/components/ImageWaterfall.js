import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Masonry from 'react-masonry-css';
import ImageItem from './ImageItem';
import throttle from 'lodash/throttle';

const breakpointColumnsObj = {
  default: 3,
  1100: 2,
  700: 2,
  500: 1
};

const ImageWaterfall = () => {
  const [images, setImages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [reshuffling, setReshuffling] = useState(false);
  const loadingRef = useRef(false);
  const batchSize = 10; // 增加每次加载图片的数量

  const fetchImages = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/images?skip=${skip}&limit=${batchSize}`);
      const newImages = response.data;
      if (newImages.length === 0) {
        setHasMore(false);
      } else {
        setImages((prevImages) => [...prevImages, ...newImages]);
        setSkip((prevSkip) => prevSkip + batchSize);
      }
    } catch (error) {
      console.error('请求失败：', error.message, error.response);
      setError('无法加载图片，请检查服务器');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [skip, hasMore, batchSize]); // useCallback 依赖项

  const reshuffleImages = async () => {
    setReshuffling(true);
    setError(null);
    try {
      const response = await axios.post('/api/reshuffle-images');
      if (response.data.status === 'success') {
        setImages([]);
        setSkip(0);
        setHasMore(true);
        // 确保在重置后立即获取新数据
        const res = await axios.get(`/images?skip=0&limit=${batchSize}`);
        if (res.data.length > 0) {
            setImages(res.data);
            setSkip(batchSize);
        } else {
            setHasMore(false);
        }
      } else {
        setError('重命名图片失败');
      }
    } catch (error) {
      console.error('重命名失败：', error);
      setError('重命名图片失败，请检查服务器');
    }
    setReshuffling(false);
  };

  useEffect(() => {
    const shouldReshuffle = !sessionStorage.getItem('hasReshuffled');
    if (shouldReshuffle) {
      sessionStorage.setItem('hasReshuffled', 'true');
      reshuffleImages();
    } else {
      fetchImages();
    }
  }, []); // 依赖项为空，仅在组件挂载时运行

  useEffect(() => {
    // 使用节流函数来优化滚动事件处理
    const handleScroll = throttle(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 800
      ) {
        fetchImages();
      }
    }, 300); // 每 300ms 最多执行一次

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel(); // 组件卸载时取消任何待处理的节流调用
    };
  }, [fetchImages]); // 依赖于 fetchImages

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

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((image) => (
          <ImageItem key={image.filename} image={image} /> // 使用稳定且唯一的 key
        ))}
      </Masonry>

      {loading && <p className="text-center">加载中...</p>}
      {!hasMore && <p className="text-center">没有更多图片了</p>}
    </div>
  );
};

export default ImageWaterfall;
