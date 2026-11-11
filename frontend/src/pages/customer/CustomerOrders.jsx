import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getImageUrl, getOrderStatusBadge } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';

const CustomerOrders = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cancel order modal
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Auto-refresh timer reference
  const pollingRef = useRef(null);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      // Cache-busting timestamp prevents browsers from serving stale 304/cached order data
      const res = await api.get(`/orders/my-orders?_t=${Date.now()}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchOrders(false);
  }, []);

  // Instant refresh when user switches tabs back to this browser window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Live Auto-Refresh Polling every 4 seconds so Admin delivery status updates appear instantly
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchOrders(true);
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;
    try {
      const res = await api.put(`/orders/${cancellingOrderId}/cancel`, {
        reason: 'Customer requested cancellation via portal'
      });
      if (res.data.success) {
        success('Order cancelled successfully. If paid online, refund will be initiated.');
        setShowCancelModal(false);
        setCancellingOrderId(null);
        fetchOrders(true);
      }
    } catch (err) {
      error(err.message || 'Could not cancel order');
    }
  };

  const statusSteps = [
    { key: 'Pending', label: 'Order Placed', tamil: 'பெறப்பட்டது', icon: 'bi-receipt' },
    { key: 'Confirmed', label: 'Confirmed', tamil: 'உறுதி செய்யப்பட்டது', icon: 'bi-check-circle' },
    { key: 'Preparing', label: 'In Kitchen', tamil: 'கேக் தயாராகிறது', icon: 'bi-fire' },
    { key: 'Ready', label: 'Ready', tamil: 'தயாராகிவிட்டது', icon: 'bi-box2-heart' },
    { key: 'Out for Delivery', label: 'Out for Delivery', tamil: 'புறப்பட்டது', icon: 'bi-truck' },
    { key: 'Delivered', label: 'Delivered', tamil: 'டெலிவரி செய்யப்பட்டது', icon: 'bi-house-check' }
  ];

  const getStepProgressIndex = (currentStatus) => {
    if (currentStatus === 'Cancelled') return -1;
    return statusSteps.findIndex((s) => s.key === currentStatus);
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your orders..." />;
  }

  return (
    <div className="container py-4 py-md-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold font-serif text-dark mb-0">My Orders & Live Tracking</h2>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill small d-flex align-items-center gap-1">
              <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }}></span>
              Live Tracking Active
            </span>
          </div>
          <p className="text-muted small mb-0">
            Real-time status updates as your cake is baked, packed, and dispatched by the bakery team.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold shadow-xs"
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
          >
            <i className={`bi bi-arrow-clockwise me-1 ${isRefreshing ? 'spin' : ''}`}></i>
            {isRefreshing ? 'Syncing...' : 'Refresh Status'}
          </button>
          <Link to="/products" className="btn btn-outline-bakery btn-sm rounded-pill px-3 fw-semibold">
            <i className="bi bi-plus-lg me-1"></i> Order More Cakes
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
          <div
            className="rounded-circle bg-bakery-cream p-4 mx-auto mb-3 d-inline-flex align-items-center justify-content-center shadow-xs"
            style={{ width: '90px', height: '90px' }}
          >
            <i className="bi bi-bag-x fs-1 text-bakery-accent"></i>
          </div>
          <h4 className="fw-bold font-serif text-dark mb-2">No Orders Placed Yet</h4>
          <p className="text-muted small mb-4">
            You haven't placed any cake orders yet. Browse our menu to treat yourself today!
          </p>
          <div>
            <Link to="/products" className="btn btn-bakery-accent text-white rounded-pill px-4 py-2 fw-semibold shadow-sm">
              Explore Our Cakes
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => {
            const stepIndex = getStepProgressIndex(order.orderStatus);
            const isCancelled = order.orderStatus === 'Cancelled';
            const isDelivered = order.orderStatus === 'Delivered';
            const canCancel = !['Delivered', 'Cancelled'].includes(order.orderStatus);

            // Get latest remark / update from Admin status history
            const latestHistory =
              order.statusHistory && order.statusHistory.length > 0
                ? order.statusHistory[order.statusHistory.length - 1]
                : null;

            return (
              <div key={order._id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                {/* Header Card */}
                <div className="p-3 p-md-4 bg-light border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>ORDER NUMBER</span>
                    <strong className="text-dark font-monospace fs-6">{order.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>ORDER DATE</span>
                    <span className="text-dark small fw-semibold">{formatDate(order.createdAt, true)}</span>
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>PAYMENT</span>
                    <span className="badge bg-white text-dark border small me-1">
                      {order.paymentMethod === 'RAZORPAY' ? 'Online (Razorpay)' : 'Cash on Delivery'}
                    </span>
                    <span
                      className={`badge ${
                        order.paymentStatus === 'Completed' || (isDelivered && order.paymentMethod === 'COD')
                          ? 'bg-success'
                          : 'bg-warning text-dark'
                      } small`}
                    >
                      {isDelivered && order.paymentMethod === 'COD' ? 'Completed (Paid)' : order.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>TOTAL AMOUNT</span>
                    <strong className="fs-5 text-bakery-accent">{formatCurrency(order.totalAmount)}</strong>
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>STATUS</span>
                    {isDelivered ? (
                      <span className="badge bg-success px-3 py-2 rounded-pill small fw-bold shadow-xs d-inline-flex align-items-center gap-1">
                        <i className="bi bi-check-circle-fill"></i> Delivered
                      </span>
                    ) : (
                      <span className={`badge ${getOrderStatusBadge(order.orderStatus)} px-3 py-2 rounded-pill small fw-bold shadow-xs`}>
                        {order.orderStatus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Progress Stepper */}
                <div className="p-3 p-md-4 bg-white border-bottom">
                  {isCancelled ? (
                    <div className="alert alert-danger py-2 mb-0 rounded-3 small d-flex align-items-center">
                      <i className="bi bi-x-circle-fill me-2 fs-5"></i>
                      <span>This order was cancelled. Any deducted bakery inventory has been returned.</span>
                    </div>
                  ) : isDelivered ? (
                    <div>
                      {/* Prominent Delivered Celebration Banner */}
                      <div className="alert alert-success border border-success border-opacity-50 py-3 px-3 rounded-4 mb-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 shadow-xs">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle bg-success text-white p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '42px', height: '42px' }}
                          >
                            <i className="bi bi-bag-check-fill fs-5"></i>
                          </div>
                          <div>
                            <strong className="text-success d-block fs-6">
                              Order Delivered Successfully! (ஆர்டர் டெலிவரி செய்யப்பட்டது)
                            </strong>
                            <small className="text-muted d-block">
                              {latestHistory?.comment || 'Cake delivered to customer successfully'}. Enjoy your fresh bakery treats!
                            </small>
                          </div>
                        </div>
                        <span className="badge bg-success px-3 py-2 rounded-pill fw-bold text-white align-self-start align-self-sm-center">
                          ✔ Order Completed
                        </span>
                      </div>

                      {/* Stepper with all steps marked Complete */}
                      <div className="status-stepper stepper-delivered d-flex align-items-center justify-content-between position-relative px-2 mb-2">
                        {statusSteps.map((step) => (
                          <div key={step.key} className="stepper-step text-center position-relative flex-fill">
                            <div
                              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-1 bg-success text-white shadow-sm"
                              style={{
                                width: '36px',
                                height: '36px',
                                fontSize: '0.9rem'
                              }}
                            >
                              <i className="bi bi-check-lg"></i>
                            </div>
                            <span className="small d-block text-truncate px-1 text-success fw-bold" style={{ fontSize: '0.75rem' }}>
                              {step.label}
                            </span>
                            <small className="d-none d-sm-block text-muted text-truncate" style={{ fontSize: '0.65rem' }}>
                              {step.tamil}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="small fw-bold text-dark text-uppercase d-flex align-items-center gap-1">
                          <i className="bi bi-broadcast text-danger"></i> Live Kitchen & Delivery Tracking:
                        </span>
                        <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
                          Auto-syncs with Bakery Admin
                        </span>
                      </div>

                      {/* Responsive Stepper for in-progress orders */}
                      <div className="status-stepper d-flex align-items-center justify-content-between position-relative px-2 mb-3">
                        {statusSteps.map((step, idx) => {
                          const isDone = idx < stepIndex;
                          const isCurrent = idx === stepIndex;

                          return (
                            <div key={step.key} className="stepper-step text-center position-relative flex-fill">
                              <div
                                className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-1 transition-all ${
                                  isCurrent
                                    ? 'bg-bakery-accent text-white shadow ring-2'
                                    : isDone
                                    ? 'bg-success text-white'
                                    : 'bg-light text-muted border'
                                }`}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  fontSize: '0.9rem',
                                  transform: isCurrent ? 'scale(1.15)' : 'none',
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                {isDone ? (
                                  <i className="bi bi-check-lg"></i>
                                ) : (
                                  <i className={`bi ${step.icon}`}></i>
                                )}
                              </div>
                              <span
                                className={`small d-block text-truncate px-1 ${
                                  isCurrent ? 'fw-bold text-bakery-accent' : isDone ? 'text-dark' : 'text-muted'
                                }`}
                                style={{ fontSize: '0.75rem' }}
                              >
                                {step.label}
                              </span>
                              <small
                                className="d-none d-sm-block text-muted text-truncate"
                                style={{ fontSize: '0.65rem' }}
                              >
                                {step.tamil}
                              </small>
                            </div>
                          );
                        })}
                      </div>

                      {/* Latest Kitchen / Admin Note */}
                      {latestHistory && (
                        <div className="alert alert-light border py-2 px-3 rounded-3 small mb-0 d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-info-circle-fill text-bakery-accent"></i>
                            <span>
                              <strong>Bakery Update:</strong> {latestHistory.comment || `Order is now ${latestHistory.status}`}
                            </span>
                          </div>
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {new Date(latestHistory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Items & Delivery Address */}
                <div className="p-3 p-md-4">
                  <div className="row g-4">
                    {/* Item list */}
                    <div className="col-lg-7 border-end-lg">
                      <h6 className="fw-bold font-serif text-dark mb-3">Ordered Cakes & Confections</h6>
                      <div className="d-flex flex-column gap-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="rounded-3 object-fit-cover shadow-xs border"
                                style={{ width: '52px', height: '52px' }}
                              />
                              <div>
                                <h6 className="mb-0 fw-semibold text-dark small">{item.name}</h6>
                                <small className="text-muted">
                                  {formatCurrency(item.price)} × {item.quantity}
                                </small>
                              </div>
                            </div>
                            <span className="fw-bold small text-dark">{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="mt-3 p-2 bg-light rounded-3 small border">
                          <strong>Your Note / Customization:</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Delivery Address Details */}
                    <div className="col-lg-5">
                      <h6 className="fw-bold font-serif text-dark mb-2">Delivery Address</h6>
                      <div className="p-3 bg-light rounded-4 small border">
                        <strong className="text-dark d-block mb-1">{order.deliveryAddress?.name}</strong>
                        <p className="text-secondary mb-2" style={{ lineHeight: 1.4 }}>
                          {order.deliveryAddress?.doorNumber}, {order.deliveryAddress?.street}
                          {order.deliveryAddress?.village ? `, ${order.deliveryAddress.village}` : ''}
                          <br />
                          {order.deliveryAddress?.district}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                        </p>
                        <span className="text-muted d-block">
                          <i className="bi bi-telephone-fill me-1 text-bakery-accent"></i>
                          {order.deliveryAddress?.phoneNumber}
                        </span>
                      </div>

                      {/* Cancel Action */}
                      {canCancel && (
                        <div className="mt-3 text-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onClick={() => {
                              setCancellingOrderId(order._id);
                              setShowCancelModal(true);
                            }}
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Order Cancellation */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Order Confirmation"
        message="Are you sure you want to cancel this order? Any reserved bakery inventory will be returned."
        confirmText="Yes, Cancel Order"
        confirmVariant="danger"
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export default CustomerOrders;
