import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const StockManagement = () => {
  const { success, error } = useToast();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab: 'inventory' or 'history'
  const [activeTab, setActiveTab] = useState('inventory');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    actionType: 'ADD', // 'ADD', 'DEDUCT', 'SET'
    quantity: 5,
    reason: 'Fresh Morning Baking Batch'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const [overviewRes, historyRes] = await Promise.all([
        api.get('/stock'),
        api.get('/stock/history')
      ]);

      if (overviewRes.data.success) {
        setStats(overviewRes.data.stats);
        setProducts(overviewRes.data.products);
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.history);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const handleOpenAdjust = (p, defaultAction = 'ADD') => {
    setSelectedProduct(p);
    setAdjustForm({
      actionType: defaultAction,
      quantity: 5,
      reason: defaultAction === 'ADD' ? 'Fresh Morning Baking Batch' : 'Batch Adjustment'
    });
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/stock/${selectedProduct._id}`, adjustForm);
      if (res.data.success) {
        success(res.data.message || 'Stock updated successfully!');
        setShowAdjustModal(false);
        fetchStockData();
      }
    } catch (err) {
      error(err.message || 'Could not update stock');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Auditing bakery inventory..." />;
  }

  const displayedProducts = filterLowStockOnly
    ? products.filter((p) => p.stock <= (p.lowStockThreshold || 5))
    : products;

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold font-serif text-bakery-accent mb-1">Stock & Inventory Management</h3>
          <p className="text-muted small mb-0">Track stock levels, replenish bakery supplies, and view historical movements.</p>
        </div>
        <div className="btn-group rounded-pill p-1 border shadow-xs" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'inventory' ? 'btn-bakery-accent text-white' : 'btn-outline-secondary border-0 text-muted'}`}
            onClick={() => setActiveTab('inventory')}
          >
            <i className="bi bi-boxes me-1"></i> Stock Levels
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'history' ? 'btn-bakery-accent text-white' : 'btn-outline-secondary border-0 text-muted'}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="bi bi-clock-history me-1"></i> Movement History
          </button>
        </div>
      </div>

      {/* Stock Summary Widgets */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
            <span className="small text-muted fw-bold text-uppercase d-block mb-1">Total Products</span>
            <h4 className="fw-bold text-dark mb-0">{stats?.totalProducts || 0}</h4>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
            <span className="small text-muted fw-bold text-uppercase d-block mb-1">Total Available Units</span>
            <h4 className="fw-bold text-primary mb-0">{stats?.totalStock || 0}</h4>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center border-start border-4 border-warning">
            <span className="small text-muted fw-bold text-uppercase d-block mb-1">Low Stock Alerts</span>
            <h4 className="fw-bold text-warning mb-0">{stats?.lowStockCount || 0}</h4>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center border-start border-4 border-danger">
            <span className="small text-muted fw-bold text-uppercase d-block mb-1">Out of Stock</span>
            <h4 className="fw-bold text-danger mb-0">{stats?.outOfStockCount || 0}</h4>
          </div>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        /* Inventory Tab */
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="p-3 bg-light border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h6 className="fw-bold font-serif text-dark mb-0 d-flex align-items-center">
              <i className="bi bi-box-seam me-2 text-bakery-accent"></i> Inventory Roster
            </h6>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="lowStockFilterCheck"
                checked={filterLowStockOnly}
                onChange={(e) => setFilterLowStockOnly(e.target.checked)}
              />
              <label className="form-check-label small fw-semibold text-danger" htmlFor="lowStockFilterCheck">
                Filter Critical Low Stock Items Only ({stats?.lowStockCount || 0})
              </label>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Product Name</th>
                  <th scope="col" className="py-3">Category</th>
                  <th scope="col" className="py-3">Current Stock</th>
                  <th scope="col" className="py-3">Min Threshold</th>
                  <th scope="col" className="py-3">Inventory Health</th>
                  <th scope="col" className="py-3 text-end pe-4">Quick Replenish</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  const isLow = p.stock <= (p.lowStockThreshold || 5);
                  return (
                    <tr key={p._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={getImageUrl(p.image)}
                            alt={p.name}
                            className="rounded-3 object-fit-cover shadow-xs border"
                            style={{ width: '48px', height: '48px' }}
                          />
                          <div>
                            <strong className="text-dark small d-block">{p.name}</strong>
                            <small className="text-muted">{p.quantity || '500g'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border small">
                          {p.category?.name || 'Cake'}
                        </span>
                      </td>
                      <td>
                        <span className={`fw-bold fs-6 ${isOutOfStock ? 'text-danger' : isLow ? 'text-warning text-dark' : 'text-success'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="small text-muted">{p.lowStockThreshold || 5} units</td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge bg-danger rounded-pill px-3 py-1">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge bg-warning text-dark rounded-pill px-3 py-1">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i> Low Stock
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
                            Healthy Level
                          </span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm rounded-pill px-3"
                            onClick={() => handleOpenAdjust(p, 'ADD')}
                          >
                            <i className="bi bi-plus-lg me-1"></i> Add Stock
                          </button>
                          <button
                            type="button"
                            className="btn btn-light btn-sm rounded-pill px-3 border"
                            onClick={() => handleOpenAdjust(p, 'SET')}
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stock History Tab */
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="p-3 bg-light border-bottom">
            <h6 className="fw-bold font-serif text-dark mb-0 d-flex align-items-center">
              <i className="bi bi-clock-history me-2 text-bakery-accent"></i> Inventory Movement Audit Trail
            </h6>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Timestamp</th>
                  <th scope="col" className="py-3">Product</th>
                  <th scope="col" className="py-3">Type</th>
                  <th scope="col" className="py-3">Qty Change</th>
                  <th scope="col" className="py-3">Prev → New</th>
                  <th scope="col" className="py-3 pe-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted small">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  history.map((mov) => {
                    let badgeColor = 'bg-secondary';
                    if (mov.type === 'IN') badgeColor = 'bg-success';
                    if (mov.type === 'OUT') badgeColor = 'bg-danger';
                    if (mov.type === 'SALE') badgeColor = 'bg-info text-dark';
                    if (mov.type === 'RETURN') badgeColor = 'bg-warning text-dark';

                    return (
                      <tr key={mov._id}>
                        <td className="ps-4 py-3 small text-muted">
                          {formatDate(mov.createdAt, true)}
                        </td>
                        <td>
                          <strong className="text-dark small">{mov.product?.name || 'Product'}</strong>
                        </td>
                        <td>
                          <span className={`badge ${badgeColor} rounded-pill px-3 py-1 small`}>
                            {mov.type}
                          </span>
                        </td>
                        <td className="fw-bold small text-dark">
                          {mov.type === 'OUT' || mov.type === 'SALE' ? `-${mov.quantity}` : `+${mov.quantity}`}
                        </td>
                        <td className="small text-muted">
                          {mov.previousStock} → <strong>{mov.newStock}</strong>
                        </td>
                        <td className="pe-4 small text-secondary">
                          {mov.reason || 'Inventory Adjustment'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-bakery-accent text-white">
                <h5 className="modal-title font-serif fw-bold text-white">
                  Update Stock: {selectedProduct.name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAdjustModal(false)}
                ></button>
              </div>

              <form onSubmit={handleAdjustSubmit}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">Current Stock In Hand:</small>
                      <strong className="fs-5 text-dark">{selectedProduct.stock} units</strong>
                    </div>
                    <span className="badge bg-secondary-subtle text-secondary small">
                      {selectedProduct.category?.name || 'Cake'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Action Type *</label>
                    <select
                      className="form-select"
                      value={adjustForm.actionType}
                      onChange={(e) => setAdjustForm({ ...adjustForm, actionType: e.target.value })}
                    >
                      <option value="ADD">Add Fresh Baked Units (+)</option>
                      <option value="DEDUCT">Deduct Damaged / Expired Units (-)</option>
                      <option value="SET">Directly Overwrite Total Stock (=)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Quantity (Units) *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      required
                      value={adjustForm.quantity}
                      onChange={(e) => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Reason for Stock Update *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Fresh Morning Batch, Evening Restock, Spoilage"
                      value={adjustForm.reason}
                      onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAdjustModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-bakery-accent text-white rounded-pill px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Commit Stock Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
