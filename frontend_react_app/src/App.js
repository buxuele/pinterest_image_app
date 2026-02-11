import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ImageWaterfall from './components/ImageWaterfall';
import MyImagesPage from './components/MyImagesPage';
import './App.css';

const App = () => {
  const [columns, setColumns] = useState(5);
  const [currentFolder, setCurrentFolder] = useState('cool_imgs');

  return (
    <>
      <Navbar 
        onColumnsChange={setColumns} 
        currentColumns={columns}
        currentFolder={currentFolder}
      />
      <div className="app" style={{ width: '95%', margin: '0 auto' }}>
        <div className="content">
          <Routes>
            <Route 
              path="/" 
              element={
                <ImageWaterfall 
                  columns={columns} 
                  onFolderChange={setCurrentFolder}
                />
              } 
            />
            <Route path="/my-images" element={<MyImagesPage />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;