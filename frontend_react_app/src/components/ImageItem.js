import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ImageItem.css';

const ImageItem = ({ image }) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const overlayRef = useRef(null);
  const imageRef = useRef(null);
  const previewImageRef = useRef(null);

  const handleImageClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isImageLoaded) return;
    setIsEnlarged(true);
    document.body.style.overflow = 'hidden';
  }, [isImageLoaded]);

  const handleOverlayClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === overlayRef.current) {
      setIsEnlarged(false);
      document.body.style.overflow = '';
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

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
          src={`${image.url}`}
          alt={image.filename}
          className="image"
          onClick={handleImageClick}
          onLoad={handleImageLoad}
          style={{ 
            opacity: isImageLoaded ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
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
          <div className="preview-image-container">
            <img
              ref={previewImageRef}
              src={`${image.url}`}
              alt={image.filename}
              className="preview-image"
              style={{ 
                opacity: 0,
                animation: 'zoomIn 0.2s ease-in-out forwards'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageItem;