import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Masonry from 'react-masonry-css'; // 引入 Masonry 组件
import ImageItem from './ImageItem';

// 定义断点，用于响应式布局
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

  const fetchImages = async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/images?skip=${skip}&limit=5`);
      const newImages = response.data;
      if (newImages.length === 0) {
        setHasMore(false);
      } else {
        setImages((prevImages) => [...prevImages, ...newImages]);
        setSkip((prevSkip) => prevSkip + 5);
      }
    } catch (error) {
      console.error('请求失败：', error.message, error.response);
      setError('无法加载图片，请检查服务器');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const reshuffleImages = async () => {
    setReshuffling(true);
    setError(null);
    try {
      const response = await axios.post('/api/reshuffle-images');
      if (response.data.status === 'success') {
        setImages([]);
        setSkip(0);
        setHasMore(true);
        const fetchWithSkipZero = async () => {
            if (loadingRef.current) return;
            loadingRef.current = true;
            setLoading(true);
            try {
                const res = await axios.get(`/images?skip=0&limit=5`);
                if (res.data.length > 0) {
                    setImages(res.data);
                    setSkip(5);
                } else {
                    setHasMore(false);
                }
            } catch(e) {
                setError('无法加载图片，请检查服务器');
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        }
        await fetchWithSkipZero();
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

      {/* 使用 Masonry 组件替换原来的 .image-grid div */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((image, index) => (
          <ImageItem key={image.filename + index} image={image} />
        ))}
      </Masonry>

      {loading && <p className="text-center">加载中...</p>}
      {!hasMore && <p className="text-center">没有更多图片了</p>}
    </div>
  );
};

export default ImageWaterfall;