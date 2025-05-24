import React, { useState } from 'react';
import './ImageItem.css';

const ImageItem = ({ image }) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  const handleImageClick = () => {
    setIsEnlarged(!isEnlarged);
  };

  return (
    <div className="image-item">
      <img
        src={`http://192.168.1.3:8000${image.url}`}
        alt={image.filename}
        className="image"
        onClick={handleImageClick}
      />
      {isEnlarged && (
        <div className="full-screen-overlay" onClick={handleImageClick}>
          <img
            src={`http://192.168.1.3:8000${image.url}`}
            alt={image.filename}
            className="image original"
          />
        </div>
      )}
    </div>
  );
};

export default ImageItem;