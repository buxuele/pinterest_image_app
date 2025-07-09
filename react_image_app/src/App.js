import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ImageWaterfall from './components/ImageWaterfall';
import MyImagesPage from './components/MyImagesPage';
import './App.css';

const App = () => {
  return (
    <>
      <Navbar />
      <div className="app" style={{ width: '95%', margin: '0 auto' }}>
        <div className="content">
          <Routes>
            <Route path="/" element={<ImageWaterfall />} />
            
            <Route path="/my-images" element={<MyImagesPage />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;