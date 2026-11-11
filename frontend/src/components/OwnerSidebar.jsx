import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const OwnerSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/owner/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="modal-backdrop fade show d-lg-none"
          onClick={onClose}
          style={{ zIndex: 1040 }}
        ></div>
      )}

      <aside
        className={`owner-sidebar d-flex flex-column ${
          isOpen ? 'show' : ''
        }`}
        style={{
          width: '260px',
          minHeight: '100vh',
          zIndex: 1045,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        {/* Brand */}
        <div className="sidebar-brand-box d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
          <div className="d-flex align-items-center">
            <div className="brand-logo-icon rounded-circle p-2 me-2 d-flex align-items-center justify-content-center">
              <i className="bi bi-cake2-fill fs-5 text-bakery-accent"></i>
            </div>
            <div>
              <span className="brand-title fw-bold fs-5 d-block lh-1">SweetDelight</span>
              <small className="brand-subtitle" style={{ fontSize: '0.72rem' }}>Owner Administration</small>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-light d-lg-none rounded-circle"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Current Owner Info */}
        <div className="owner-profile-card p-2 mb-3 rounded-3 d-flex align-items-center gap-2">
          <div className="owner-avatar rounded-circle fw-bold d-flex align-items-center justify-content-center">
            {user?.name ? user.name[0].toUpperCase() : 'O'}
          </div>
          <div className="overflow-hidden">
            <h6 className="mb-0 owner-name small fw-bold text-truncate">{user?.name || 'Bakery Owner'}</h6>
            <small className="owner-email text-truncate d-block" style={{ fontSize: '0.7rem' }}>
              {user?.email || 'owner@bakery.com'}
            </small>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="nav nav-pills flex-column mb-auto gap-1">
          <li className="nav-item">
            <NavLink
              to="/owner/dashboard"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded-3 ${
                  isActive ? 'active bg-bakery-accent' : ''
                }`
              }
              onClick={onClose}
            >
              <i className="bi bi-speedometer2 me-3 fs-5"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/owner/products"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded-3 ${
                  isActive ? 'active bg-bakery-accent' : ''
                }`
              }
              onClick={onClose}
            >
              <i className="bi bi-cake2 me-3 fs-5"></i>
              <span>Products</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/owner/stock"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded-3 ${
                  isActive ? 'active bg-bakery-accent' : ''
                }`
              }
              onClick={onClose}
            >
              <i className="bi bi-boxes me-3 fs-5"></i>
              <span>Stock Inventory</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/owner/orders"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded-3 ${
                  isActive ? 'active bg-bakery-accent' : ''
                }`
              }
              onClick={onClose}
            >
              <i className="bi bi-receipt-cutoff me-3 fs-5"></i>
              <span>Customer Orders</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/owner/sales"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded-3 ${
                  isActive ? 'active bg-bakery-accent' : ''
                }`
              }
              onClick={onClose}
            >
              <i className="bi bi-graph-up-arrow me-3 fs-5"></i>
              <span>Sales Management</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/owner/expenses"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded-3 ${
                  isActive ? 'active bg-bakery-accent' : ''
                }`
              }
              onClick={onClose}
            >
              <i className="bi bi-wallet2 me-3 fs-5"></i>
              <span>Expense Tracking</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/owner/bulk-orders"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded-3 ${
                  isActive ? 'active bg-bakery-accent' : ''
                }`
              }
              onClick={onClose}
            >
              <i className="bi bi-balloon-heart me-3 fs-5"></i>
              <span>Bulk & Event Orders</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/owner/shop-register"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded-3 ${
                  isActive ? 'active bg-bakery-accent' : ''
                }`
              }
              onClick={onClose}
            >
              <i className="bi bi-shop me-3 fs-5"></i>
              <span>Shop Profile</span>
            </NavLink>
          </li>
        </ul>

        {/* Footer actions */}
        <div className="sidebar-footer-box pt-3 border-top mt-auto d-flex flex-column gap-2">
          <NavLink
            to="/"
            target="_blank"
            className="btn btn-sm btn-view-store text-start py-2 px-3 rounded-3 d-flex align-items-center"
          >
            <i className="bi bi-box-arrow-up-right me-2"></i>
            <span>View Customer Store</span>
          </NavLink>
          <button
            type="button"
            className="btn btn-sm btn-owner-logout text-start py-2 px-3 rounded-3 d-flex align-items-center"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left me-2"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default OwnerSidebar;
