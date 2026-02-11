import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../config/api';
import Masonry from 'react-masonry-css';
import ImageItem from './ImageItem';
import throttle from 'lodash/throttle';
import FeedbackAlert from './FeedbackAlert';

const ImageWaterfall = ({ columns: propColumns, onFolderChange }) => {
  const columns = propColumns || 5;
  const [images, setImages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('cool_imgs');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loadingRef = useRef(false);
  const batchSize = 12;

  const breakpointColumnsObj = {
    default: columns,
    1100: Math.min(columns, 3),
    700: Math.min(columns, 2),
    500: 1
  };

  const fetchImages = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/images?skip=${skip}&limit=${batchSize}&folder=${selectedFolder}`);
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
  }, [skip, hasMore, batchSize, selectedFolder]);

  const handleDeleteImage = useCallback((filename) => {
    setImages((prevImages) => prevImages.filter(img => img.filename !== filename));
  }, []); // useCallback 依赖项

  const fetchFolders = async () => {
    try {
      const response = await apiClient.get('/api/folders');
      if (response.data.status === 'success') {
        setFolders(response.data.folders);
      }
    } catch (error) {
      console.error('获取文件夹列表失败：', error);
    }
  };

  const handleFolderChange = (folder) => {
    setSelectedFolder(folder);
    setImages([]);
    setSkip(0);
    setHasMore(true);
    sessionStorage.removeItem('hasReshuffled');
    if (onFolderChange) {
      onFolderChange(folder);
    }
  };

  const reshuffleImages = async () => {
    setError(null);
    try {
      const response = await apiClient.post(`/api/reshuffle-images?folder=${selectedFolder}`);
      if (response.data.status === 'success') {
        setImages([]);
        setSkip(0);
        setHasMore(true);
        const res = await apiClient.get(`/images?skip=0&limit=${batchSize}&folder=${selectedFolder}`);
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
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    // 重置状态
    setImages([]);
    setSkip(0);
    setHasMore(true);
    loadingRef.current = false;
    
    // 加载新文件夹的图片
    const loadImages = async () => {
      try {
        const response = await apiClient.get(`/images?skip=0&limit=${batchSize}&folder=${selectedFolder}`);
        if (response.data.length > 0) {
          setImages(response.data);
          setSkip(batchSize);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('加载图片失败：', error);
        setError('无法加载图片，请检查服务器');
      }
    };
    
    loadImages();
  }, [selectedFolder, batchSize]); // 当选择的文件夹改变时重新加载

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1500
      ) {
        fetchImages();
      }
      setShowScrollTop(window.scrollY > 500);
    }, 300);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, [fetchImages]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-4">
      <div className="mb-3">
        <div className="btn-group" role="group">
          {folders.map((folder) => (
            <button
              key={folder}
              type="button"
              className={`btn ${selectedFolder === folder ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleFolderChange(folder)}
            >
              {folder}
            </button>
          ))}
        </div>
      </div>

      <FeedbackAlert message={error} onClose={() => setError(null)} className="text-center" />
      {images.length === 0 && !loading && !error && <p>暂无图片</p>}

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((image) => (
          <ImageItem 
            key={image.filename} 
            image={image}
            onDelete={handleDeleteImage}
          />
        ))}
      </Masonry>

      {loading && <p className="text-center">加载中...</p>}
      {!hasMore && <p className="text-center">没有更多图片了</p>}

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn btn-primary scroll-to-top"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1000,
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '20px'
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default ImageWaterfall;
