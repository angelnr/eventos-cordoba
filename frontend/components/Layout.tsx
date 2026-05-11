import React from 'react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 sm:px-6 lg:px-8 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};