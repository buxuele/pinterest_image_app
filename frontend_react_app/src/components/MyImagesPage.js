import React, { useState, useEffect } from 'react';
import { apiClient, withBaseUrl } from '../config/api';
import ImageUpload from './ImageUpload';
import FeedbackAlert from './FeedbackAlert';

const MyImagesPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');

  const fetchImages = async () => {
    try {
      const response = await apiClient.get('/api/user-images');
      if (Array.isArray(response.data)) {
        setImages(response.data);
      } else {
        throw new Error('获取图片列表失败');
      }
    } catch (error) {
      console.error('获取图片失败:', error);
      setError('获取图片列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUploadSuccess = () => {
    fetchImages();
  };

  const handleDeleteImage = async (filename) => {
    try {
      const response = await apiClient.delete(`/api/user-images/${filename}`);
      if (response.data.status === 'success') {
        setImages(images.filter(img => img.filename !== filename));
        showFlashMessage('删除成功');
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      setError('删除失败，请稍后重试');
    }
  };

  const showFlashMessage = (message) => {
    setFlashMessage(message);
    // 2秒后自动清除消息
    setTimeout(() => {
      setFlashMessage('');
    }, 2000);
  };

  return (
    <div className="mt-4">
      {/* Flash Message */}
      {flashMessage && (
        <div 
          className="position-fixed top-0 end-0 p-3" 
          style={{ 
            zIndex: 1050,
            animation: 'fadeInOut 2s ease-in-out'
          }}
        >
          <FeedbackAlert
            message={flashMessage}
            variant="success"
            onClose={() => setFlashMessage('')}
            className="mb-0"
          />
        </div>
      )}

      <div className="d-flex justify-content-end mb-4">
        <button
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          上传图片
        </button>
      </div>

      <FeedbackAlert message={error} onClose={() => setError(null)} />

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center text-muted">
          <p>还没有上传过图片</p>
          <button
            className="btn btn-outline-primary mt-2"
            onClick={() => setShowUploadModal(true)}
          >
            立即上传
          </button>
        </div>
      ) : (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4">
          {images.map((image) => (
            <div key={image.filename} className="col">
              <div className="card h-100">
                <img
                  src={withBaseUrl(image.url)}
                  className="card-img-top"
                  alt={image.filename}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'contain',
                    backgroundColor: '#212529'
                  }}
                />
                <div className="card-body p-2 d-flex flex-column">
                  <p className="card-text small text-muted mb-2 flex-grow-1">
                    {image.upload_time}
                  </p>
                  <button
                    className="btn btn-sm btn-outline-danger w-100"
                    onClick={() => handleDeleteImage(image.filename)}
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">上传图片</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUploadModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ImageUpload 
                  onUploadSuccess={() => {
                    handleUploadSuccess();
                    setShowUploadModal(false);
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyImagesPage;
