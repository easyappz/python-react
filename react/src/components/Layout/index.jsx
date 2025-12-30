import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';
import './styles.css';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout" data-easytag="id1-react/src/components/Layout/index.jsx">
      <Header onMenuToggle={handleMenuToggle} />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-content">
          {children}
        </main>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={handleMenuClose} />
    </div>
  );
};

export default Layout;
