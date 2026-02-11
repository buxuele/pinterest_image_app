import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';

const Navbar = ({ onColumnsChange, currentColumns, currentFolder }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reshuffling, setReshuffling] = useState(false);

  const handleUploadClick = () => {
    navigate('/my-images');
  };

  const reshuffleImages = async () => {
    setReshuffling(true);
    try {
      await apiClient.post(`/api/reshuffle-images?folder=${currentFolder}`);
      window.location.reload();
    } catch (error) {
      console.error('打乱失败:', error);
    }
    setReshuffling(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
      <div className="container-fluid" style={{ width: '95%', margin: '0 auto' }}>
        <Link className="navbar-brand" to="/">图片应用</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                图片瀑布流
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/my-images' ? 'active' : ''}`} 
                to="/my-images"
              >
                我的图片
              </Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center gap-2">
            {location.pathname === '/' && (
              <>
                <button 
                  className="btn btn-success"
                  onClick={reshuffleImages}
                  disabled={reshuffling}
                >
                  {reshuffling ? '打乱中...' : '打乱'}
                </button>
                
                <select 
                  className="form-select"
                  value={currentColumns}
                  onChange={(e) => onColumnsChange(Number(e.target.value))}
                  style={{ width: '80px' }}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}列</option>
                  ))}
                </select>
              </>
            )}
            
            <button 
              className="btn btn-outline-light"
              onClick={handleUploadClick}
            >
              上传图片
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
