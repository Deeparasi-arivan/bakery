import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToastAlert from '../components/ToastAlert';

const CustomerLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-bakery-cream">
      <ToastAlert />
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
