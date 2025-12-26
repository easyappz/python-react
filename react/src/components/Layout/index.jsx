import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import './layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="vk-layout" data-easytag="id3-src/components/Layout/index.jsx">
      <header className="vk-header">
        <div className="vk-header-content">
          <div className="vk-header-logo">VK</div>
          <div className="vk-header-search">
            <input
              type="text"
              placeholder="Поиск"
              className="vk-header-search-input"
            />
          </div>
        </div>
      </header>
      <div className="vk-main">
        <Sidebar />
        <main className="vk-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
