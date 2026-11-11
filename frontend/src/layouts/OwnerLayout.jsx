import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import OwnerSidebar from '../components/OwnerSidebar';
import ToastAlert from '../components/ToastAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import '../styles/AdminDashboard.css';

const OwnerLayout = () => {
  const { user, isOwner, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await api.get('/shops/current');
        if (res.data.success) {
          setShopInfo(res.data.shop);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (isOwner) {
      fetchShop();
    }
  }, [isOwner]);

  if (loading) {
    return <LoadingSpinner message="Validating owner credentials..." />;
  }

  if (!isOwner) {
    return <Navigate to="/owner/login" state={{ from: location }} replace />;
  }

  return (
    <div className="admin-layout d-flex min-vh-100">
      <ToastAlert />
      <OwnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (offset by sidebar width on large screens) */}
      <div className="flex-grow-1 owner-main-content" style={{ minWidth: 0 }}>
        {/* Top Header Bar */}
        <header className="border-bottom sticky-top py-2 px-3 px-lg-4 d-flex align-items-center justify-content-between shadow-xs">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-light d-lg-none rounded-circle border shadow-xs"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Sidebar"
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <div>
              <h5 className="mb-0 fw-bold font-serif text-bakery-accent">
                {shopInfo?.shopName || 'SweetDelight Bakery & Patisserie'}
              </h5>
              <small className="text-muted d-none d-sm-inline">
                <i className="bi bi-geo-alt me-1"></i>
                {shopInfo?.city ? `${shopInfo.city}, ${shopInfo.state}` : 'Bangalore, Karnataka'}
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block">
              <span className="small fw-semibold text-dark d-block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="badge bg-success-subtle text-success small border border-success-subtle">
                ● Kitchen Open & Live
              </span>
            </div>
            <div className="rounded-circle bg-bakery-cream border border-bakery-accent p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-person-badge-fill text-bakery-accent fs-5"></i>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <div className="p-3 p-lg-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OwnerLayout;
