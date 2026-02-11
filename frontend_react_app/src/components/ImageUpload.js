import React, { useState, useRef } from 'react';
import { apiClient } from '../config/api';
import FeedbackAlert from './FeedbackAlert';

const ImageUpload = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // Changed to store { file, previewUrl }
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        previewUrl: null // 不生成预览图，避免卡顿
      }));

    if (imageFiles.length === 0) {
      setError('请选择图片文件');
      return;
    }
    setSelectedFiles(imageFiles);
    setError(null);
    setUploadStatus(null);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('请先选择图片');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadStatus(null);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i].file; // Extract file object
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/api/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.status === 'success') {
          setUploadStatus(prev => ({
            ...prev,
            [file.name]: 'success'
          }));
          if (onUploadSuccess) {
            onUploadSuccess(response.data);
          }
        } else {
          throw new Error(response.data.message || '上传失败');
        }
      }
      // Clear selected files after successful upload
      clearSelection(); // Use clearSelection to also revoke URLs
    } catch (error) {
      console.error('上传失败:', error);
      setError(error.message || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    // 不再需要清理 URL，因为没有生成预览图
    setSelectedFiles([]);
    setError(null);
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 不再需要清理 effect

  return (
    <div className="image-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="d-none"
        id="imageUpload"
      />
      
      <div
        className={`upload-area p-4 text-center rounded ${
          isDragging ? 'bg-primary bg-opacity-10' : 'bg-light'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #ccc',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {uploading ? (
          <div>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">上传中...</span>
            </div>
            <p className="mt-2 mb-0">正在上传...</p>
          </div>
        ) : selectedFiles.length > 0 ? (
          <div>
            <p className="mb-2">已选择 {selectedFiles.length} 个文件</p>
            <div className="d-flex flex-column align-items-center gap-1">
              {selectedFiles.map((item, index) => (
                <div key={index} className="d-flex align-items-center gap-2 w-100" style={{ maxWidth: '400px' }}>
                  <i className="bi bi-file-image fs-4 text-primary"></i>
                  <p className="mb-0 flex-grow-1" style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.file.name}
                  </p>
                  {uploadStatus?.[item.file.name] === 'success' && 
                    <span className="text-success fs-5">✓</span>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <i className="bi bi-cloud-upload fs-1"></i>
            <p className="mt-2 mb-0">
              点击或拖拽图片到此处
              <br />
              <small className="text-muted">支持多个图片同时上传</small>
            </p>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && !uploading && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button 
            className="btn btn-primary"
            onClick={uploadFiles}
            disabled={uploading}
          >
            确认上传
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={clearSelection}
            disabled={uploading}
          >
            取消选择
          </button>
        </div>
      )}

      <FeedbackAlert message={error} onClose={() => setError(null)} className="mt-3" />

      {uploadStatus && Object.values(uploadStatus).every(status => status === 'success') && (
        <FeedbackAlert message="所有图片上传成功！" variant="success" className="mt-3" />
      )}
    </div>
  );
};

export default ImageUpload; 
