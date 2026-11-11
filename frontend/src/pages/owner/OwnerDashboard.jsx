import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getOrderStatusBadge } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
        setRecentOrders(res.data.recentOrders || []);
        setLowStockProducts(res.data.lowStockProducts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating bakery performance metrics..." />;
  }

  const d = stats || {
    totalProducts: 0,
    availableStock: 0,
    todaySales: 0,
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalExpenses: 0,
    estimatedProfit: 0
  };

  return (
    <div className="container-fluid px-0">
      {/* Title & Refresh */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold font-serif text-bakery-accent mb-1">Executive Bakery Dashboard</h3>
          <p className="text-muted small mb-0">Overview of daily sales revenue, orders, inventory stock, and profitability.</p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-xs"
            onClick={fetchDashboard}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
          </button>
          <Link to="/owner/products" className="btn btn-bakery-accent btn-sm text-white rounded-pill px-3 shadow-xs">
            <i className="bi bi-plus-lg me-1"></i> Add New Product
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning border-warning border-opacity-50 rounded-4 p-3 mb-4 shadow-xs d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-warning text-dark p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            </div>
            <div>
              <strong className="text-dark d-block">Low Stock Alert ({lowStockProducts.length} items critical)</strong>
              <small className="text-dark text-opacity-75">
                Some signature cakes and donuts are running critically low (under threshold).
              </small>
            </div>
          </div>
          <Link to="/owner/stock" className="btn btn-warning btn-sm rounded-pill px-3 fw-bold text-dark text-nowrap">
            Manage Inventory & Restock
          </Link>
        </div>
      )}

      {/* 9 Key Dashboard Metric Cards */}
      <div className="row g-3 g-md-4 mb-4">
        {/* 1. Today's Sales */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-bold text-uppercase">Today's Sales</span>
              <div className="rounded-circle bg-success-subtle text-success p-2">
                <i className="bi bi-cash-stack fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-success mb-1">{formatCurrency(d.todaySales)}</h3>
            <small className="text-muted">Revenue collected since midnight</small>
          </div>
        </div>

        {/* 2. Total Sales */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-primary">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-bold text-uppercase">Total Sales</span>
              <div className="rounded-circle bg-primary-subtle text-primary p-2">
                <i className="bi bi-graph-up fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-primary mb-1">{formatCurrency(d.totalSales)}</h3>
            <small className="text-muted">Lifetime cumulative gross revenue</small>
          </div>
        </div>

        {/* 3. Estimated Profit */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-bakery-accent profit-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-bold text-uppercase">Estimated Profit</span>
              <div className="rounded-circle bg-bakery-cream text-bakery-accent p-2 border border-bakery-accent">
                <i className="bi bi-trophy-fill fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-bakery-accent mb-1">{formatCurrency(d.estimatedProfit)}</h3>
            <small className="text-muted">Total Sales minus Total Operating Expenses</small>
          </div>
        </div>

        {/* 4. Total Orders */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-bold text-uppercase">Total Orders</span>
              <div className="rounded-circle p-2 text-gold" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <i className="bi bi-bag-check fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-gold mb-1">{d.totalOrders}</h3>
            <small className="text-muted">Total customer orders placed</small>
          </div>
        </div>

        {/* 5. Pending Orders */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-warning">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-bold text-uppercase">Pending / In-Kitchen</span>
              <div className="rounded-circle bg-warning-subtle text-warning-emphasis p-2">
                <i className="bi bi-hourglass-split fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-warning mb-1">{d.pendingOrders}</h3>
            <small className="text-muted">Requiring preparation or dispatch</small>
          </div>
        </div>

        {/* 6. Completed Orders */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-bold text-uppercase">Completed Orders</span>
              <div className="rounded-circle bg-success-subtle text-success p-2">
                <i className="bi bi-check2-all fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-success mb-1">{d.completedOrders}</h3>
            <small className="text-muted">Successfully baked and delivered</small>
          </div>
        </div>

        {/* 7. Total Products */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-bold text-uppercase">Total Products</span>
              <div className="rounded-circle p-2 text-gold" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <i className="bi bi-cake2 fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-gold mb-1">{d.totalProducts}</h3>
            <small className="text-muted">Active items across all categories</small>
          </div>
        </div>

        {/* 8. Available Stock */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-info">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-bold text-uppercase">Available Stock</span>
              <div className="rounded-circle bg-info-subtle text-info p-2">
                <i className="bi bi-boxes fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-info mb-1">{d.availableStock} units</h3>
            <small className="text-muted">Total units across all cake items</small>
          </div>
        </div>

        {/* 9. Total Expenses */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-danger">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-bold text-uppercase">Total Expenses</span>
              <div className="rounded-circle bg-danger-subtle text-danger p-2">
                <i className="bi bi-wallet2 fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-danger mb-1">{formatCurrency(d.totalExpenses)}</h3>
            <small className="text-muted">Ingredients, packaging, rent & utility costs</small>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Orders & Low Stock Highlights */}
      <div className="row g-4">
        {/* Recent Orders Table */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h6 className="fw-bold font-serif mb-0 d-flex align-items-center text-bakery-accent">
                <i className="bi bi-receipt-cutoff me-2"></i> Recent Customer Orders
              </h6>
              <Link to="/owner/orders" className="btn btn-link text-bakery-accent text-decoration-none btn-sm fw-semibold">
                View All Orders <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="small text-muted text-uppercase" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <tr>
                    <th scope="col" className="ps-3 py-3">Order Number</th>
                    <th scope="col" className="py-3">Customer</th>
                    <th scope="col" className="py-3">Amount</th>
                    <th scope="col" className="py-3">Payment</th>
                    <th scope="col" className="py-3">Status</th>
                    <th scope="col" className="py-3 pe-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted small">
                        No orders received yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="ps-3 fw-bold font-monospace small text-gold">
                          {order.orderNumber}
                        </td>
                        <td>
                          <span className="small fw-semibold d-block text-cream">
                            {order.deliveryAddress?.name || order.customer?.name || 'Customer'}
                          </span>
                          <small className="text-muted">{order.deliveryAddress?.phoneNumber}</small>
                        </td>
                        <td className="fw-bold text-bakery-accent small">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td>
                          <span className="badge border small" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--cream)', borderColor: 'var(--border-color)' }}>
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getOrderStatusBadge(order.orderStatus)} small`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="pe-3 text-end">
                          <Link to="/owner/orders" className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-0">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h6 className="fw-bold font-serif mb-0 d-flex align-items-center text-bakery-accent">
                <i className="bi bi-bell-fill text-danger me-2"></i> Low Stock Items
              </h6>
              <Link to="/owner/stock" className="btn btn-link text-bakery-accent text-decoration-none btn-sm fw-semibold">
                Manage Stock
              </Link>
            </div>

            <div className="p-3 d-flex flex-column gap-3">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  <i className="bi bi-check-circle-fill text-success fs-3 d-block mb-1"></i>
                  All cake stocks are well replenished.
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p._id} className="d-flex align-items-center justify-content-between p-2 rounded-3 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <div className="rounded-circle bg-danger-subtle text-danger p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                        <i className="bi bi-box-seam"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 small fw-bold text-cream text-truncate" style={{ maxWidth: '140px' }}>
                          {p.name}
                        </h6>
                        <small className="text-muted">{p.category?.name || 'Bakery'}</small>
                      </div>
                    </div>
                    <span className={`badge ${p.stock === 0 ? 'bg-danger' : 'bg-warning text-dark'} rounded-pill px-3`}>
                      {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
