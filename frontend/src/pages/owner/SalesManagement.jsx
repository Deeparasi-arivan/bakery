import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalItemsSold: 0,
    averageSaleAmount: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('all'); // 'today', 'week', 'month', 'custom', 'all'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFilter !== 'all' && dateFilter !== 'custom') {
        params.append('filter', dateFilter);
      } else if (dateFilter === 'custom') {
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }

      if (paymentMethod !== 'all') {
        params.append('paymentMethod', paymentMethod);
      }

      const res = await api.get(`/sales?${params.toString()}`);
      if (res.data.success) {
        setSales(res.data.sales);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [dateFilter, paymentMethod]);

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    fetchSales();
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold font-serif text-bakery-accent mb-1">Sales & Revenue Reports</h3>
          <p className="text-muted small mb-0">Detailed breakdown of confirmed bakery revenues, customer orders, and transaction channels.</p>
        </div>
      </div>

      {/* Date Filter Quick Pills */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${dateFilter === 'all' ? 'btn-bakery-accent text-white' : 'btn-light'}`}
                onClick={() => setDateFilter('all')}
              >
                All Time
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${dateFilter === 'today' ? 'btn-bakery-accent text-white' : 'btn-light'}`}
                onClick={() => setDateFilter('today')}
              >
                Today's Sales
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${dateFilter === 'week' ? 'btn-bakery-accent text-white' : 'btn-light'}`}
                onClick={() => setDateFilter('week')}
              >
                Past 7 Days
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${dateFilter === 'month' ? 'btn-bakery-accent text-white' : 'btn-light'}`}
                onClick={() => setDateFilter('month')}
              >
                This Month
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${dateFilter === 'custom' ? 'btn-bakery-accent text-white' : 'btn-light'}`}
                onClick={() => setDateFilter('custom')}
              >
                Custom Range
              </button>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center justify-content-md-end gap-2">
              <label className="small text-muted fw-bold text-nowrap">Payment Channel:</label>
              <select
                className="form-select form-select-sm bg-light rounded-pill"
                style={{ maxWidth: '180px' }}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="all">All Payment Methods</option>
                <option value="RAZORPAY">Razorpay Online</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Date Form */}
        {dateFilter === 'custom' && (
          <form onSubmit={handleApplyCustomDate} className="row g-2 align-items-center mt-3 pt-3 border-top">
            <div className="col-auto">
              <label className="small fw-bold text-muted">From:</label>
            </div>
            <div className="col-auto">
              <input
                type="date"
                className="form-control form-control-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-auto">
              <label className="small fw-bold text-muted">To:</label>
            </div>
            <div className="col-auto">
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-auto">
              <button type="submit" className="btn btn-bakery-accent btn-sm text-white rounded-pill px-3">
                Apply Range
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Sales Summary Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center border-start border-4 border-success">
            <span className="small text-muted fw-bold text-uppercase d-block mb-1">Calculated Total Sales</span>
            <h3 className="fw-bold text-success mb-0">{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
            <span className="small text-muted fw-bold text-uppercase d-block mb-1">Total Transactions</span>
            <h3 className="fw-bold text-dark mb-0">{stats.totalTransactions}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
            <span className="small text-muted fw-bold text-uppercase d-block mb-1">Items Sold</span>
            <h3 className="fw-bold text-primary mb-0">{stats.totalItemsSold}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
            <span className="small text-muted fw-bold text-uppercase d-block mb-1">Average Order Value</span>
            <h3 className="fw-bold text-bakery-accent mb-0">{formatCurrency(stats.averageSaleAmount)}</h3>
          </div>
        </div>
      </div>

      {/* Sales Log Table */}
      {loading ? (
        <LoadingSpinner message="Aggregating sales transactions..." />
      ) : sales.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-calendar-x fs-1 text-muted mb-2"></i>
          <h5 className="fw-bold font-serif text-dark">No Sales Records Found</h5>
          <p className="text-muted small">No completed sales matches the selected date timeframe or payment channel.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Sale Date</th>
                  <th scope="col" className="py-3">Order Number</th>
                  <th scope="col" className="py-3">Customer</th>
                  <th scope="col" className="py-3">Payment Method</th>
                  <th scope="col" className="py-3">Units Sold</th>
                  <th scope="col" className="py-3 text-end pe-4">Sale Amount</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="ps-4 py-3 small text-muted">
                      {formatDate(sale.date, true)}
                    </td>
                    <td>
                      <span className="fw-bold font-monospace small text-dark">
                        {sale.orderNumber || sale.order?.orderNumber || 'BK-DIRECT'}
                      </span>
                    </td>
                    <td>
                      <span className="small fw-semibold text-dark d-block">
                        {sale.customerName || sale.customer?.name || 'Customer'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border small">
                        {sale.paymentMethod === 'RAZORPAY' ? 'Razorpay (Online)' : sale.paymentMethod}
                      </span>
                    </td>
                    <td className="small text-secondary">{sale.itemsCount || 1} units</td>
                    <td className="text-end pe-4 fw-bold text-success fs-6">
                      +{formatCurrency(sale.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
