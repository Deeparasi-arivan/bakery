import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, isCustomer, isOwner, logout } = useAuth();
  const { cart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-bakery-dark text-white py-1 px-3 small d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <span className="me-3">
              <i className="bi bi-clock-fill text-bakery-gold me-1"></i> Fresh bakes daily: 7:00 AM – 10:00 PM
            </span>
            <span>
              <i className="bi bi-geo-alt-fill text-bakery-gold me-1"></i> Free delivery on orders over ₹500
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            {isOwner ? (
              <Link to="/owner/dashboard" className="text-warning text-decoration-none fw-semibold">
                <i className="bi bi-speedometer2 me-1"></i> Owner Dashboard
              </Link>
            ) : (
              <Link to="/owner/login" className="text-light text-opacity-75 text-decoration-none hover-white">
                <i className="bi bi-shield-lock me-1"></i> Staff / Owner Portal
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-2">
        <div className="container">
          {/* Brand Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <div className="brand-icon-wrapper rounded-circle p-2 me-2 bg-bakery-cream border border-bakery-accent d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
              <i className="bi bi-cake2-fill fs-4 text-bakery-accent"></i>
            </div>
            <div>
              <span className="fw-bold font-serif fs-4 d-block lh-1 text-bakery-accent">SweetDelight</span>
              <small className="text-muted text-uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '1.5px' }}>
                Bakery & Patisserie
              </small>
            </div>
          </Link>

          {/* Mobile Toggler */}
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <Link to="/cart" className="btn btn-outline-bakery rounded-circle position-relative p-2">
              <i className="bi bi-cart3 fs-5"></i>
              {cart.totalItems > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cart.totalItems}
                </span>
              )}
            </Link>
            <button
              className="navbar-toggler border-0 shadow-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#bakeryNavbar"
              aria-controls="bakeryNavbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* Nav Items & Search */}
          <div className="collapse navbar-collapse" id="bakeryNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
              <li className="nav-item">
                <NavLink className="nav-link px-3 fw-medium" to="/">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link px-3 fw-medium" to="/products">
                  All Cakes & Bakes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link px-3 fw-medium" to="/bulk-order-inquiry">
                  Custom Event Cakes
                </NavLink>
              </li>
              {isCustomer && (
                <li className="nav-item">
                  <NavLink className="nav-link px-3 fw-medium" to="/my-orders">
                    My Orders
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Search Input */}
            <form className="d-flex me-lg-3 my-2 my-lg-0 flex-grow-1" style={{ maxWidth: '300px' }} onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control rounded-start-pill border-end-0 bg-light small"
                  placeholder="Search cakes, donuts, cupcakes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-light rounded-end-pill border border-start-0 text-muted" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>

            {/* User & Cart Actions */}
            <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
              {/* Cart Button */}
              <Link to="/cart" className="btn btn-outline-bakery rounded-pill px-3 position-relative d-none d-lg-inline-flex align-items-center">
                <i className="bi bi-cart3 fs-5 me-2"></i>
                <span className="fw-semibold">Cart</span>
                {cart.totalItems > 0 && (
                  <span className="badge rounded-pill bg-danger ms-2">
                    {cart.totalItems}
                  </span>
                )}
              </Link>

              {/* User Dropdown / Auth Button */}
              {user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-light border rounded-pill px-3 py-2 d-flex align-items-center gap-2 dropdown-toggle shadow-xs"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="rounded-circle bg-bakery-accent text-white d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="fw-semibold small text-truncate" style={{ maxWidth: '100px' }}>
                      {user.name || user.phone}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2">
                    <li className="px-3 py-2 border-bottom">
                      <p className="mb-0 fw-bold small text-dark">{user.name || 'Customer'}</p>
                      <small className="text-muted">{user.phone || user.email}</small>
                    </li>
                    {isCustomer && (
                      <>
                        <li>
                          <Link className="dropdown-item py-2" to="/my-profile">
                            <i className="bi bi-person me-2 text-bakery-accent"></i> My Profile & Addresses
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/my-orders">
                            <i className="bi bi-bag-check me-2 text-bakery-accent"></i> My Orders
                          </Link>
                        </li>
                      </>
                    )}
                    {isOwner && (
                      <li>
                        <Link className="dropdown-item py-2 text-primary" to="/owner/dashboard">
                          <i className="bi bi-speedometer2 me-2"></i> Owner Dashboard
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item py-2 text-danger"
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/customer/login" className="btn btn-bakery-accent rounded-pill px-4 text-white fw-semibold shadow-xs">
                  <i className="bi bi-person me-1"></i> Sign In / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
