import React, { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient, withBaseUrl } from '../config/api';
import FeedbackAlert from './FeedbackAlert';
import './ImageItem.css';

const ImageItem = ({ image, onDelete }) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef(null);
  const imageRef = useRef(null);
  const previewImageRef = useRef(null);

  const handleImageClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isImageLoaded) return;
    setIsEnlarged(true);
    document.body.style.overflow = 'hidden';
    setError('');
  }, [isImageLoaded]);

  const handleOverlayClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === overlayRef.current) {
      setIsEnlarged(false);
      document.body.style.overflow = '';
      setError('');
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const handleDelete = useCallback(async (e) => {
    e.stopPropagation();
    
    setDeleting(true);
    try {
      const isUserImage = image.url.includes('/user_images/');
      let deleteUrl;
      
      if (isUserImage) {
        const filename = image.url.split('/').pop();
        deleteUrl = `/api/user-images/${filename}`;
      } else {
        const urlParts = image.url.split('/');
        const folder = urlParts[urlParts.length - 2];
        const filename = urlParts[urlParts.length - 1];
        deleteUrl = `/api/images/${folder}/${filename}`;
      }
      
      await apiClient.delete(deleteUrl);
      setIsEnlarged(false);
      document.body.style.overflow = '';
      setError('');
      if (onDelete) {
        onDelete(image.filename);
      }
    } catch (error) {
      console.error('删除失败:', error);
      setError('删除失败，请重试');
    }
    setDeleting(false);
  }, [image, onDelete]);

  // 清理函数
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isEnlarged) {
        setIsEnlarged(false);
        document.body.style.overflow = '';
        setError('');
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isEnlarged]);

  return (
    <>
      <div className="image-item">
        <img
          ref={imageRef}
          src={withBaseUrl(image.url)}
          alt={image.filename}
          className="image"
          onClick={handleImageClick}
          onLoad={handleImageLoad}
          loading="lazy"
          style={{ 
            opacity: isImageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      </div>

      {isEnlarged && (
        <div 
          ref={overlayRef}
          className="full-screen-overlay" 
          onClick={handleOverlayClick}
          style={{ 
            opacity: 0,
            animation: 'fadeIn 0.2s ease-in-out forwards'
          }}
        >
          {error && (
            <div
              className="position-fixed top-0 start-50 translate-middle-x p-3"
              style={{ zIndex: 10002, width: '100%', maxWidth: '520px' }}
            >
              <FeedbackAlert message={error} onClose={() => setError('')} />
            </div>
          )}
          <div className="preview-image-container">
            <img
              ref={previewImageRef}
              src={withBaseUrl(image.url)}
              alt={image.filename}
              className="preview-image"
              style={{ 
                opacity: 0,
                animation: 'zoomIn 0.2s ease-in-out forwards'
              }}
            />
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-danger delete-btn"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 1001
              }}
            >
              {deleting ? '删除中...' : '删除'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageItem;
