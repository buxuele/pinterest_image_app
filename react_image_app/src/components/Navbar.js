import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate('/my-images');
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
                className={`nav-link ${location.pathname === '/translate' ? 'active' : ''}`} 
                to="/translate"
              >
                翻译工具
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/quotes' ? 'active' : ''}`} 
                to="/quotes"
              >
                名言警句
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
          
          <button 
            className="btn btn-outline-light"
            onClick={handleUploadClick}
          >
            上传图片
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 