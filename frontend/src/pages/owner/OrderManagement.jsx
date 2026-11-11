import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';
import '../../styles/OrderManagement.css';

const OrderManagement = () => {
  const { success, error, info } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Order for Detailed Modal View / Status Update
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [updating, setUpdating] = useState(false);

  // Cancellation Modal
  const [cancelModalOrder, setCancelModalOrder] = useState(null);

  // Auto-refresh timer reference
  const pollingRef = useRef(null);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch and on filter/search change
  useEffect(() => {
    fetchOrders(false);
  }, [statusFilter, searchTerm]);

  // Live Auto-Refresh Polling every 6 seconds so new customer orders appear automatically
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchOrders(true);
    }, 6000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [statusFilter, searchTerm]);

  const handleOpenDetailModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setStatusComment('');
  };

  const handleCopyOrderNumber = (e, orderNumber) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(orderNumber);
    info(`Order #${orderNumber} copied to clipboard!`);
  };

  // 1-Click Status Update directly from table row or quick actions
  const handleQuickStatusChange = async (orderId, targetStatus, customComment) => {
    try {
      setUpdating(true);
      const res = await api.put(`/orders/${orderId}/status`, {
        status: targetStatus,
        comment: customComment || `Admin updated status to ${targetStatus}`
      });

      if (res.data.success) {
        success(`Order status updated to "${targetStatus}"! Customer can see this live.`);
        fetchOrders(true);
      }
    } catch (err) {
      error(err.message || 'Could not update order status');
    } finally {
      setUpdating(false);
    }
  };

  // Detailed Modal Status Submit
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const res = await api.put(`/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        comment: statusComment || `Admin updated status to ${newStatus}`
      });

      if (res.data.success) {
        success(`Order ${selectedOrder.orderNumber} updated to "${newStatus}"!`);
        setSelectedOrder(null);
        fetchOrders(true);
      }
    } catch (err) {
      error(err.message || 'Could not update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    try {
      const res = await api.put(`/orders/${cancelModalOrder._id}/cancel`, {
        reason: 'Order cancelled by bakery admin'
      });
      if (res.data.success) {
        success('Order cancelled and reserved stock restored to inventory');
        setCancelModalOrder(null);
        fetchOrders(true);
      }
    } catch (err) {
      error(err.message || 'Failed to cancel order');
    }
  };

  const statusOptions = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  // Helper for status select dropdown color coding
  const getStatusDropdownClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Preparing':
        return 'status-preparing';
      case 'Ready':
        return 'status-ready';
      case 'Out for Delivery':
        return 'status-out-for-delivery';
      case 'Delivered':
        return 'status-delivered';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // Calculate order counts for metric badges
  const pendingCount = orders.filter((o) => o.orderStatus === 'Pending').length;
  const confirmedCount = orders.filter((o) => o.orderStatus === 'Confirmed').length;
  const preparingCount = orders.filter((o) => o.orderStatus === 'Preparing').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'Ready').length;
  const outForDeliveryCount = orders.filter((o) => o.orderStatus === 'Out for Delivery').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.orderStatus === 'Cancelled').length;

  // Workflow steps for the modal visual progress stepper
  const workflowSteps = [
    { key: 'Placed', label: 'Placed', icon: 'bi-bag-check' },
    { key: 'Confirmed', label: 'Confirmed', icon: 'bi-check2' },
    { key: 'Preparing', label: 'Baking', icon: 'bi-fire' },
    { key: 'Ready', label: 'Ready', icon: 'bi-box2-heart' },
    { key: 'Out for Delivery', label: 'Dispatched', icon: 'bi-truck' },
    { key: 'Delivered', label: 'Delivered', icon: 'bi-check-all' }
  ];

  const getWorkflowStepIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Preparing':
        return 2;
      case 'Ready':
        return 3;
      case 'Out for Delivery':
        return 4;
      case 'Delivered':
        return 5;
      default:
        return -1;
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bold font-serif text-bakery-accent mb-0">Customer Order Operations</h3>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill small d-flex align-items-center gap-1">
              <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }}></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-muted small mb-0">
            Real-time kitchen baking queue, order status transitions, delivery dispatch, and order audit.
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold shadow-xs"
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            title="Refresh order list now"
          >
            <i className={`bi bi-arrow-clockwise me-1 ${isRefreshing ? 'spin' : ''}`}></i>
            {isRefreshing ? 'Refreshing...' : 'Refresh Orders'}
          </button>
          <Link to="/owner/bulk-orders" className="btn btn-outline-bakery btn-sm rounded-pill px-3 fw-semibold">
            <i className="bi bi-balloon-heart me-1"></i> Bulk Inquiries
          </Link>
        </div>
      </div>

      {/* Interactive Summary KPI Cards Grid */}
      <div className="order-kpi-grid">
        {/* Total Orders */}
        <div
          className={`order-kpi-card kpi-all ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
          title="Filter: All Orders"
        >
          <div className="kpi-header">
            <span className="kpi-label">Total Orders</span>
            <div className="kpi-icon">
              <i className="bi bi-receipt-cutoff"></i>
            </div>
          </div>
          <h4 className="kpi-value">{orders.length}</h4>
        </div>

        {/* Pending Review */}
        <div
          className={`order-kpi-card kpi-pending ${statusFilter === 'Pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'all' : 'Pending')}
          title="Filter: Pending Review"
        >
          <div className="kpi-header">
            <span className="kpi-label">Pending</span>
            <div className="kpi-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>
          </div>
          <h4 className="kpi-value text-warning">{pendingCount}</h4>
        </div>

        {/* Confirmed */}
        <div
          className={`order-kpi-card kpi-confirmed ${statusFilter === 'Confirmed' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Confirmed' ? 'all' : 'Confirmed')}
          title="Filter: Confirmed Orders"
        >
          <div className="kpi-header">
            <span className="kpi-label">Confirmed</span>
            <div className="kpi-icon">
              <i className="bi bi-check2-circle"></i>
            </div>
          </div>
          <h4 className="kpi-value" style={{ color: '#4FC3F7' }}>{confirmedCount}</h4>
        </div>

        {/* In Kitchen / Baking */}
        <div
          className={`order-kpi-card kpi-preparing ${statusFilter === 'Preparing' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Preparing' ? 'all' : 'Preparing')}
          title="Filter: In Kitchen Baking"
        >
          <div className="kpi-header">
            <span className="kpi-label">In Kitchen</span>
            <div className="kpi-icon">
              <i className="bi bi-fire"></i>
            </div>
          </div>
          <h4 className="kpi-value" style={{ color: '#FF7043' }}>{preparingCount}</h4>
        </div>

        {/* Ready for Pickup */}
        <div
          className={`order-kpi-card kpi-ready ${statusFilter === 'Ready' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Ready' ? 'all' : 'Ready')}
          title="Filter: Ready for Pickup"
        >
          <div className="kpi-header">
            <span className="kpi-label">Ready</span>
            <div className="kpi-icon">
              <i className="bi bi-box2-heart"></i>
            </div>
          </div>
          <h4 className="kpi-value" style={{ color: '#BA68C8' }}>{readyCount}</h4>
        </div>

        {/* Out for Delivery */}
        <div
          className={`order-kpi-card kpi-dispatch ${statusFilter === 'Out for Delivery' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Out for Delivery' ? 'all' : 'Out for Delivery')}
          title="Filter: Out for Delivery"
        >
          <div className="kpi-header">
            <span className="kpi-label">Dispatched</span>
            <div className="kpi-icon">
              <i className="bi bi-truck"></i>
            </div>
          </div>
          <h4 className="kpi-value" style={{ color: '#42A5F5' }}>{outForDeliveryCount}</h4>
        </div>

        {/* Delivered */}
        <div
          className={`order-kpi-card kpi-delivered ${statusFilter === 'Delivered' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Delivered' ? 'all' : 'Delivered')}
          title="Filter: Delivered Orders"
        >
          <div className="kpi-header">
            <span className="kpi-label">Delivered</span>
            <div className="kpi-icon">
              <i className="bi bi-bag-check-fill"></i>
            </div>
          </div>
          <h4 className="kpi-value text-success">{deliveredCount}</h4>
        </div>

        {/* Cancelled */}
        <div
          className={`order-kpi-card kpi-cancelled ${statusFilter === 'Cancelled' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Cancelled' ? 'all' : 'Cancelled')}
          title="Filter: Cancelled Orders"
        >
          <div className="kpi-header">
            <span className="kpi-label">Cancelled</span>
            <div className="kpi-icon">
              <i className="bi bi-x-circle"></i>
            </div>
          </div>
          <h4 className="kpi-value text-danger">{cancelledCount}</h4>
        </div>
      </div>

      {/* Filter toolbar & Search Bar */}
      <div className="order-filter-toolbar">
        <div className="row g-3 align-items-center">
          {/* Search Box */}
          <div className="col-12 col-lg-4">
            <div className="order-search-box">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search Order #, customer name, phone, district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="col-12 col-lg-8">
            <div className="order-filter-pills-wrap justify-content-lg-end">
              <button
                type="button"
                className={`order-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <span>All Orders</span>
                <span className="pill-count">{orders.length}</span>
              </button>

              <button
                type="button"
                className={`order-filter-pill ${statusFilter === 'Pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Pending')}
              >
                <span>Pending</span>
                <span className="pill-count">{pendingCount}</span>
              </button>

              <button
                type="button"
                className={`order-filter-pill ${statusFilter === 'Confirmed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Confirmed')}
              >
                <span>Confirmed</span>
                <span className="pill-count">{confirmedCount}</span>
              </button>

              <button
                type="button"
                className={`order-filter-pill ${statusFilter === 'Preparing' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Preparing')}
              >
                <span>In Kitchen</span>
                <span className="pill-count">{preparingCount}</span>
              </button>

              <button
                type="button"
                className={`order-filter-pill ${statusFilter === 'Ready' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Ready')}
              >
                <span>Ready</span>
                <span className="pill-count">{readyCount}</span>
              </button>

              <button
                type="button"
                className={`order-filter-pill ${statusFilter === 'Out for Delivery' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Out for Delivery')}
              >
                <span>Dispatch</span>
                <span className="pill-count">{outForDeliveryCount}</span>
              </button>

              <button
                type="button"
                className={`order-filter-pill ${statusFilter === 'Delivered' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Delivered')}
              >
                <span>Delivered</span>
                <span className="pill-count">{deliveredCount}</span>
              </button>

              <button
                type="button"
                className={`order-filter-pill ${statusFilter === 'Cancelled' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Cancelled')}
              >
                <span>Cancelled</span>
                <span className="pill-count">{cancelledCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      {loading ? (
        <LoadingSpinner message="Loading customer order queue..." />
      ) : orders.length === 0 ? (
        <div className="card order-table-card border-0 p-5 text-center">
          <i className="bi bi-receipt fs-1 text-muted mb-2"></i>
          <h5 className="fw-bold font-serif text-cream">No Orders Found</h5>
          <p className="text-muted small mb-3">
            {statusFilter !== 'all' || searchTerm
              ? `No customer orders currently match the selected filter "${statusFilter}" or search keyword.`
              : 'No orders have been placed yet. As soon as a customer orders from the storefront, it will appear here instantly!'}
          </p>
          {(statusFilter !== 'all' || searchTerm) && (
            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-bakery rounded-pill px-4 fw-semibold"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                <i className="bi bi-arrow-repeat me-1"></i> Clear Filters & View All
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="order-table-card">
          <div className="table-responsive">
            <table className="order-table table align-middle">
              <thead>
                <tr>
                  <th scope="col" className="ps-4">Order ID & Time</th>
                  <th scope="col">Customer & Delivery</th>
                  <th scope="col">Ordered Items</th>
                  <th scope="col">Amount & Payment</th>
                  <th scope="col" style={{ minWidth: '170px' }}>Kitchen Workflow</th>
                  <th scope="col" className="text-end pe-4">Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isPending = order.orderStatus === 'Pending';
                  const isConfirmed = order.orderStatus === 'Confirmed';
                  const isPreparing = order.orderStatus === 'Preparing';
                  const isReady = order.orderStatus === 'Ready';
                  const isOut = order.orderStatus === 'Out for Delivery';
                  const canCancel = !['Delivered', 'Cancelled'].includes(order.orderStatus);

                  return (
                    <tr
                      key={order._id}
                      className={isPending ? 'row-pending' : ''}
                    >
                      {/* Column 1: Order ID & Time */}
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <span
                            className="order-id-badge cursor-pointer"
                            onClick={(e) => handleCopyOrderNumber(e, order.orderNumber)}
                            title="Click to copy Order #"
                          >
                            {order.orderNumber}
                          </span>
                          <button
                            type="button"
                            className="btn btn-link text-muted p-0 ms-1"
                            onClick={(e) => handleCopyOrderNumber(e, order.orderNumber)}
                            title="Copy Order #"
                          >
                            <i className="bi bi-copy" style={{ fontSize: '0.78rem' }}></i>
                          </button>
                        </div>

                        {isPending && (
                          <div className="mb-1">
                            <span className="order-new-pill">
                              <i className="bi bi-bell-fill"></i> New Order
                            </span>
                          </div>
                        )}

                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-calendar3 me-1 text-gold"></i>
                          {formatDate(order.createdAt, true)}
                        </div>
                      </td>

                      {/* Column 2: Customer & Delivery Details */}
                      <td>
                        <span className="order-customer-name">
                          {order.deliveryAddress?.name || order.customer?.name || 'Customer'}
                        </span>
                        <a
                          href={`tel:${order.deliveryAddress?.phoneNumber || order.customer?.phone}`}
                          className="order-customer-phone"
                        >
                          <i className="bi bi-telephone-fill"></i>
                          {order.deliveryAddress?.phoneNumber || order.customer?.phone}
                        </a>
                        <div className="order-delivery-address" title={`${order.deliveryAddress?.doorNumber}, ${order.deliveryAddress?.street}, ${order.deliveryAddress?.district}`}>
                          <i className="bi bi-geo-alt me-1 text-muted"></i>
                          {order.deliveryAddress?.doorNumber}, {order.deliveryAddress?.street}, {order.deliveryAddress?.district}
                        </div>
                        {order.notes && (
                          <div className="order-customer-note-tag" title={order.notes}>
                            <i className="bi bi-chat-left-text-fill"></i>
                            <span>{order.notes}</span>
                          </div>
                        )}
                      </td>

                      {/* Column 3: Ordered Items */}
                      <td>
                        <div className="order-items-stack">
                          {order.items.slice(0, 2).map((it, i) => (
                            <div key={i} className="order-item-chip">
                              <img
                                src={getImageUrl(it.image)}
                                alt={it.name}
                                className="order-item-img"
                              />
                              <div>
                                <span className="order-item-title d-block" title={it.name}>
                                  {it.name}
                                </span>
                                <span className="order-item-qty">
                                  Qty: <strong>{it.quantity}</strong> ({formatCurrency(it.price)})
                                </span>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="order-more-items-pill">
                              +{order.items.length - 2} more item(s)...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Amount & Payment */}
                      <td>
                        <span className="order-amount-display">
                          {formatCurrency(order.totalAmount)}
                        </span>

                        <div>
                          <span
                            className={`order-payment-method-badge ${
                              order.paymentMethod === 'RAZORPAY' ? 'online' : 'cod'
                            }`}
                          >
                            <i className={`bi ${order.paymentMethod === 'RAZORPAY' ? 'bi-credit-card-2-front me-1' : 'bi-cash-coin me-1'}`}></i>
                            {order.paymentMethod === 'RAZORPAY' ? 'Razorpay Online' : 'Cash on Delivery'}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`order-payment-status-dot ${
                              order.paymentStatus === 'Completed' ? 'completed' : 'pending'
                            }`}
                          >
                            <i className={`bi ${order.paymentStatus === 'Completed' ? 'bi-check-circle-fill' : 'bi-clock-history'}`}></i>
                            Payment: {order.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Status Changer Dropdown */}
                      <td>
                        <select
                          className={`order-status-dropdown ${getStatusDropdownClass(order.orderStatus)}`}
                          value={order.orderStatus}
                          onChange={(e) => handleQuickStatusChange(order._id, e.target.value)}
                          disabled={updating}
                          title="Quick update order status"
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Column 6: Quick Actions */}
                      <td className="text-end pe-4">
                        <div className="order-actions-wrap">
                          {/* Next Step Shortcut Button */}
                          {isPending && (
                            <button
                              type="button"
                              className="btn btn-workflow-step step-confirm"
                              onClick={() =>
                                handleQuickStatusChange(
                                  order._id,
                                  'Confirmed',
                                  'Order accepted and confirmed by bakery manager'
                                )
                              }
                              title="Accept and Confirm Order"
                            >
                              <i className="bi bi-check-lg"></i> Confirm
                            </button>
                          )}
                          {isConfirmed && (
                            <button
                              type="button"
                              className="btn btn-workflow-step step-bake"
                              onClick={() =>
                                handleQuickStatusChange(
                                  order._id,
                                  'Preparing',
                                  'Cake is in the oven being prepared'
                                )
                              }
                              title="Start Baking Cake"
                            >
                              <i className="bi bi-fire"></i> Bake
                            </button>
                          )}
                          {isPreparing && (
                            <button
                              type="button"
                              className="btn btn-workflow-step step-ready"
                              onClick={() =>
                                handleQuickStatusChange(
                                  order._id,
                                  'Ready',
                                  'Cake baked, iced, and packed'
                                )
                              }
                              title="Mark Ready for Pickup"
                            >
                              <i className="bi bi-box2-heart"></i> Ready
                            </button>
                          )}
                          {isReady && (
                            <>
                              <button
                                type="button"
                                className="btn btn-workflow-step step-dispatch"
                                onClick={() =>
                                  handleQuickStatusChange(
                                    order._id,
                                    'Out for Delivery',
                                    'Order handed over to delivery partner'
                                  )
                                }
                                title="Dispatch for Delivery"
                              >
                                <i className="bi bi-truck"></i> Dispatch
                              </button>
                              <button
                                type="button"
                                className="btn btn-workflow-step step-delivered"
                                onClick={() =>
                                  handleQuickStatusChange(
                                    order._id,
                                    'Delivered',
                                    'Cake picked up / delivered to customer successfully'
                                  )
                                }
                                title="Mark as Delivered directly"
                              >
                                <i className="bi bi-check-all"></i> Delivered
                              </button>
                            </>
                          )}
                          {isOut && (
                            <button
                              type="button"
                              className="btn btn-workflow-step step-delivered"
                              onClick={() =>
                                handleQuickStatusChange(
                                  order._id,
                                  'Delivered',
                                  'Cake delivered to customer successfully'
                                )
                              }
                              title="Mark as Delivered"
                            >
                              <i className="bi bi-check-all"></i> Delivered
                            </button>
                          )}
                          {order.orderStatus === 'Delivered' && (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill small fw-bold d-inline-flex align-items-center gap-1">
                              <i className="bi bi-check-circle-fill"></i> Completed
                            </span>
                          )}

                          {/* Details Button */}
                          <button
                            type="button"
                            className="btn btn-order-detail"
                            onClick={() => handleOpenDetailModal(order)}
                            title="View Full Order Details"
                          >
                            Details
                          </button>

                          {/* Cancel Button */}
                          {canCancel && (
                            <button
                              type="button"
                              className="btn btn-order-cancel"
                              onClick={() => setCancelModalOrder(order)}
                              title="Cancel Order"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail & Status Transition Modal */}
      {selectedOrder && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header order-modal-header d-flex align-items-center justify-content-between">
                <h5 className="modal-title">
                  <i className="bi bi-receipt text-gold"></i>
                  <span>Order Details: {selectedOrder.orderNumber}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body order-modal-body">
                {/* Visual Workflow Stepper Tracker */}
                <div className="order-modal-card-box mb-4">
                  <h6 className="mb-2">
                    <i className="bi bi-diagram-3-fill"></i>
                    Baking & Delivery Workflow Progression
                  </h6>

                  {selectedOrder.orderStatus === 'Cancelled' ? (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-0 d-flex align-items-center gap-2">
                      <i className="bi bi-x-octagon-fill fs-5"></i>
                      <div>
                        <strong>Order Cancelled:</strong> This order has been voided and stock was restored to inventory.
                      </div>
                    </div>
                  ) : (
                    <div className="order-workflow-stepper">
                      {workflowSteps.map((step, idx) => {
                        const currentIdx = getWorkflowStepIndex(selectedOrder.orderStatus);
                        const isDone = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div
                            key={step.key}
                            className={`workflow-node ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                          >
                            <div className="workflow-node-circle">
                              <i className={`bi ${isDone ? 'bi-check-lg' : step.icon}`}></i>
                            </div>
                            <span className="workflow-node-label">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="row g-3 mb-4">
                  {/* Customer & Address Details Box */}
                  <div className="col-12 col-md-6">
                    <div className="order-modal-card-box">
                      <h6>
                        <i className="bi bi-person-lines-fill"></i>
                        Customer & Delivery Information
                      </h6>

                      <div className="order-info-line">
                        <span className="label">Customer Name:</span>
                        <span className="val">
                          {selectedOrder.deliveryAddress?.name || selectedOrder.customer?.name || 'Customer'}
                        </span>
                      </div>

                      <div className="order-info-line">
                        <span className="label">Contact Phone:</span>
                        <span className="val">
                          <a
                            href={`tel:${selectedOrder.deliveryAddress?.phoneNumber || selectedOrder.customer?.phone}`}
                            className="text-gold text-decoration-none"
                          >
                            <i className="bi bi-telephone-fill me-1"></i>
                            {selectedOrder.deliveryAddress?.phoneNumber || selectedOrder.customer?.phone}
                          </a>
                        </span>
                      </div>

                      <div className="order-info-line">
                        <span className="label">Delivery Address:</span>
                        <span className="val">
                          {selectedOrder.deliveryAddress?.doorNumber}, {selectedOrder.deliveryAddress?.street}
                          {selectedOrder.deliveryAddress?.village ? `, ${selectedOrder.deliveryAddress.village}` : ''}
                          <br />
                          {selectedOrder.deliveryAddress?.taluk ? `${selectedOrder.deliveryAddress.taluk}, ` : ''}
                          {selectedOrder.deliveryAddress?.district}, {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.pincode}
                        </span>
                      </div>

                      {selectedOrder.notes && (
                        <div className="alert alert-credentials py-2 px-3 small rounded-3 mt-3 mb-0">
                          <strong className="text-gold d-block mb-1">
                            <i className="bi bi-chat-heart-fill me-1"></i> Special Customer Instructions:
                          </strong>
                          <span>{selectedOrder.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment & Order Summary Box */}
                  <div className="col-12 col-md-6">
                    <div className="order-modal-card-box">
                      <h6>
                        <i className="bi bi-credit-card-fill"></i>
                        Payment & Order Pricing
                      </h6>

                      <div className="order-info-line">
                        <span className="label">Order Date:</span>
                        <span className="val">{formatDate(selectedOrder.createdAt, true)}</span>
                      </div>

                      <div className="order-info-line">
                        <span className="label">Payment Channel:</span>
                        <span className="val">
                          {selectedOrder.paymentMethod === 'RAZORPAY' ? 'Razorpay Online' : 'Cash on Delivery (COD)'}
                        </span>
                      </div>

                      <div className="order-info-line">
                        <span className="label">Payment Status:</span>
                        <span className="val">
                          <span
                            className={`badge ${
                              selectedOrder.paymentStatus === 'Completed' ? 'bg-success' : 'bg-warning text-dark'
                            }`}
                          >
                            {selectedOrder.paymentStatus}
                          </span>
                        </span>
                      </div>

                      <div className="order-info-line">
                        <span className="label">Current Status:</span>
                        <span className="val">
                          <span className={`order-status-dropdown py-1 px-3 ${getStatusDropdownClass(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus}
                          </span>
                        </span>
                      </div>

                      <hr className="border-secondary my-2" />

                      <div className="order-info-line">
                        <span className="label">Subtotal:</span>
                        <span className="val">{formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
                      </div>

                      {selectedOrder.deliveryFee > 0 && (
                        <div className="order-info-line">
                          <span className="label">Delivery Fee:</span>
                          <span className="val">{formatCurrency(selectedOrder.deliveryFee)}</span>
                        </div>
                      )}

                      {selectedOrder.discount > 0 && (
                        <div className="order-info-line text-success">
                          <span className="label text-success">Discount:</span>
                          <span className="val">-{formatCurrency(selectedOrder.discount)}</span>
                        </div>
                      )}

                      <div className="order-info-line mt-2 pt-2 border-top">
                        <span className="label fs-6 fw-bold text-gold">Grand Total:</span>
                        <span className="val fs-5 fw-bold text-gold">{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items To Bake & Dispatch */}
                <div className="order-modal-card-box mb-4">
                  <h6>
                    <i className="bi bi-cake2-fill"></i>
                    Ordered Items List ({selectedOrder.items?.length || 0} items)
                  </h6>

                  <div className="d-flex flex-column gap-2">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="order-modal-item-row">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={getImageUrl(it.image)}
                            alt={it.name}
                            className="order-modal-item-img"
                          />
                          <div>
                            <strong className="text-cream small d-block">{it.name}</strong>
                            <small className="text-muted">
                              {formatCurrency(it.price)} × {it.quantity} unit(s)
                            </small>
                          </div>
                        </div>
                        <span className="fw-bold text-gold fs-6">{formatCurrency(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Audit History Timeline */}
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <div className="order-modal-card-box mb-4">
                    <h6>
                      <i className="bi bi-clock-history"></i>
                      Order Status Timeline
                    </h6>

                    <div className="order-history-timeline">
                      {selectedOrder.statusHistory.map((hist, i) => (
                        <div key={i} className="timeline-entry">
                          <div className="entry-status">{hist.status}</div>
                          <span className="entry-time">{formatDate(hist.timestamp, true)}</span>
                          {hist.comment && <p className="entry-comment mb-0">{hist.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update Form */}
                <div className="order-modal-card-box">
                  <h6>
                    <i className="bi bi-sliders"></i>
                    Update Order Workflow Status
                  </h6>

                  <form onSubmit={handleUpdateStatus}>
                    <div className="row g-3 align-items-end">
                      <div className="col-12 col-md-5">
                        <label className="form-label small fw-bold">Select New Status *</label>
                        <select
                          className={`form-select ${getStatusDropdownClass(newStatus)}`}
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-5">
                        <label className="form-label small fw-bold">Customer Status Note (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Freshly baked and packed in box"
                          value={statusComment}
                          onChange={(e) => setStatusComment(e.target.value)}
                        />
                      </div>

                      <div className="col-12 col-md-2">
                        <button
                          type="submit"
                          className="btn btn-bakery-accent w-100 rounded-pill fw-bold"
                          disabled={updating}
                        >
                          {updating ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="modal-footer border-top border-secondary border-opacity-25 py-2 px-4 d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-4"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cancelModalOrder}
        title="Cancel Order Confirmation"
        message={`Are you sure you want to cancel order ${cancelModalOrder?.orderNumber}? All deducted stock will be returned to bakery inventory immediately.`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelModalOrder(null)}
      />
    </div>
  );
};

export default OrderManagement;
