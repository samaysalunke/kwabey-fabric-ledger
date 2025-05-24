import React from 'react';
import Header from './Header';
import Navigation from './Navigation';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    <Header />
    <Navigation />
    <main style={{ padding: '2rem' }}>{children}</main>
  </div>
);

export default Layout; 