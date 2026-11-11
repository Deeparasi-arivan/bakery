import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import '../../styles/Checkout.css';

const CustomerCheckout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'RAZORPAY'
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phone || '',
    doorNumber: '',
    street: '',
    village: '',
    taluk: '',
    district: '',
    pincode: '',
    state: 'Karnataka',
    isDefault: true
  });

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.addresses);
        if (res.data.addresses.length > 0) {
          const defaultAddr = res.data.addresses.find((a) => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr._id : res.data.addresses[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/customer/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    fetchAddresses();
  }, [user]);

  // Handle Save Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await api.put(`/addresses/${editingAddressId}`, addressForm);
        success('Address updated successfully');
      } else {
        const res = await api.post('/addresses', addressForm);
        success('New delivery address saved');
        if (res.data.address) {
          setSelectedAddressId(res.data.address._id);
        }
      }
      setShowAddressModal(false);
      setEditingAddressId(null);
      fetchAddresses();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save address';
      error(msg);
    }
  };

  // Open Edit Address
  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      name: addr.name,
      phoneNumber: addr.phoneNumber,
      doorNumber: addr.doorNumber,
      street: addr.street,
      village: addr.village || '',
      taluk: addr.taluk || '',
      district: addr.district,
      pincode: addr.pincode,
      state: addr.state,
      isDefault: addr.isDefault
    });
    setShowAddressModal(true);
  };

  // Delete Address
  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/addresses/${id}`);
      success('Address deleted');
      fetchAddresses();
    } catch (err) {
      error(err.message || 'Failed to delete address');
    }
  };

  // Place Order Action
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      error('Please select or add a delivery address');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      error('Your cart is empty');
      navigate('/products');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare items payload so order creation NEVER fails if cart was stored locally
      const itemsPayload = cart.items.map((it) => ({
        product: it.product?._id || it.product,
        quantity: it.quantity
      }));

      // 1. If Cash on Delivery (COD)
      if (paymentMethod === 'COD') {
        const orderRes = await api.post('/orders', {
          addressId: selectedAddressId,
          paymentMethod: 'COD',
          items: itemsPayload,
          notes: orderNotes
        });

        if (orderRes.data.success) {
          await clearCart();
          success('Order placed successfully via Cash on Delivery!');
          navigate('/my-orders');
        }
        return;
      }

      // 2. If Razorpay Online Payment
      if (paymentMethod === 'RAZORPAY') {
        // Step A: Create order in backend
        const orderRes = await api.post('/orders', {
          addressId: selectedAddressId,
          paymentMethod: 'RAZORPAY',
          items: itemsPayload,
          notes: orderNotes
        });

        if (!orderRes.data.success) {
          throw new Error('Failed to initialize order');
        }

        const createdOrder = orderRes.data.order;

        // Step B: Create Razorpay Order
        const rzpRes = await api.post('/payments/create-order', {
          amount: createdOrder.totalAmount,
          receipt: createdOrder.orderNumber
        });

        const rzpOrder = rzpRes.data.order;

        // Check if Razorpay Checkout SDK is available in browser
        if (window.Razorpay && !rzpOrder.isMock) {
          const options = {
            key: rzpOrder.key,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: 'SweetDelight Bakery',
            description: `Order ${createdOrder.orderNumber}`,
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&auto=format&fit=crop&q=80',
            order_id: rzpOrder.id,
            handler: async function (response) {
              try {
                // Verify signature on backend
                const verifyRes = await api.post('/payments/verify', {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId: createdOrder._id
                });

                if (verifyRes.data.success) {
                  await clearCart();
                  success('Online payment verified successfully! Your cake is being prepared.');
                  navigate('/my-orders');
                }
              } catch (verifyErr) {
                error('Payment verification failed. Please contact support.');
              }
            },
            prefill: {
              name: user?.name || 'Customer',
              contact: user?.phone || '9876543210'
            },
            theme: {
              color: '#8B4513'
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Development / Mock Razorpay Simulation
          info('Processing online payment (Dev Simulation)...');
          setTimeout(async () => {
            try {
              const mockPaymentId = `pay_mock_${Date.now()}`;
              const mockSignature = `sig_mock_${Date.now()}`;

              const verifyRes = await api.post('/payments/verify', {
                razorpayOrderId: rzpOrder.id,
                razorpayPaymentId: mockPaymentId,
                razorpaySignature: mockSignature,
                orderId: createdOrder._id
              });

              if (verifyRes.data.success) {
                await clearCart();
                success('Online payment completed successfully!');
                navigate('/my-orders');
              }
            } catch (err) {
              error(err.message || 'Payment processing error');
            } finally {
              setSubmitting(false);
            }
          }, 1200);
          return;
        }
      }
    } catch (err) {
      error(err.message || 'Could not process order. Please check stock and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading checkout details..." />;
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="mb-4">
        <h2 className="fw-bold font-serif text-dark mb-1">Checkout & Delivery</h2>
        <p className="text-muted small">Choose your delivery destination and preferred payment method.</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="col-lg-8">
          {/* 1. Delivery Address Section */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold font-serif text-dark mb-0 d-flex align-items-center">
                <i className="bi bi-geo-alt-fill text-bakery-accent me-2"></i>
                1. Select Delivery Address
              </h5>
              <button
                type="button"
                className="btn btn-outline-bakery btn-sm rounded-pill px-3"
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressForm({
                    name: user?.name || '',
                    phoneNumber: user?.phone || '',
                    doorNumber: '',
                    street: '',
                    village: '',
                    taluk: '',
                    district: '',
                    pincode: '',
                    state: 'Karnataka',
                    isDefault: true
                  });
                  setShowAddressModal(true);
                }}
              >
                <i className="bi bi-plus-lg me-1"></i> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-4 text-center border rounded-3 bg-light">
                <i className="bi bi-house-door fs-2 text-muted mb-2 d-block"></i>
                <p className="small text-muted mb-3">No delivery address saved yet.</p>
                <button
                  type="button"
                  className="btn btn-bakery-accent text-white rounded-pill btn-sm px-4"
                  onClick={() => setShowAddressModal(true)}
                >
                  Add Address Now
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div key={addr._id} className="col-md-6">
                      <div
                        className={`p-3 rounded-4 border position-relative cursor-pointer transition-all ${
                          isSelected
                            ? 'border-bakery-accent bg-bakery-cream shadow-xs'
                            : 'border-light-subtle bg-light hover-shadow'
                        }`}
                        onClick={() => setSelectedAddressId(addr._id)}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="radio"
                              name="addressSelection"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr._id)}
                              className="form-check-input"
                            />
                            <strong className="text-dark small">{addr.name}</strong>
                          </div>
                          {addr.isDefault && (
                            <span className="badge bg-secondary-subtle text-secondary small rounded-pill">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="small text-secondary mb-2" style={{ lineHeight: 1.4 }}>
                          {addr.doorNumber}, {addr.street}
                          {addr.village ? `, ${addr.village}` : ''}
                          <br />
                          {addr.taluk ? `${addr.taluk}, ` : ''}{addr.district}, {addr.state} - {addr.pincode}
                        </p>

                        <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                          <small className="text-muted">
                            <i className="bi bi-telephone me-1"></i> {addr.phoneNumber}
                          </small>
                          <div>
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-primary p-0 me-2 text-decoration-none small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-danger p-0 text-decoration-none small"
                              onClick={(e) => handleDeleteAddress(addr._id, e)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Payment Method Section */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold font-serif text-dark mb-3 d-flex align-items-center">
              <i className="bi bi-credit-card-2-front-fill text-bakery-accent me-2"></i>
              2. Payment Method
            </h5>

            <div className="row g-3">
              {/* Option 1: Razorpay Online */}
              <div className="col-md-6">
                <div
                  className={`p-3 rounded-4 border cursor-pointer transition-all ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-bakery-accent bg-bakery-cream shadow-xs'
                      : 'border-light-subtle bg-light hover-shadow'
                  }`}
                  onClick={() => setPaymentMethod('RAZORPAY')}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        name="paymentSelection"
                        checked={paymentMethod === 'RAZORPAY'}
                        onChange={() => setPaymentMethod('RAZORPAY')}
                        className="form-check-input"
                      />
                      <strong className="text-dark">Online Payment</strong>
                    </div>
                    <span className="badge bg-success-subtle text-success small rounded-pill">
                      Instant & Secure
                    </span>
                  </div>
                  <p className="small text-muted mb-0">
                    Pay securely via Razorpay using UPI (GPay, PhonePe, Paytm), Credit/Debit Card, or Net Banking.
                  </p>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div className="col-md-6">
                <div
                  className={`p-3 rounded-4 border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-bakery-accent bg-bakery-cream shadow-xs'
                      : 'border-light-subtle bg-light hover-shadow'
                  }`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        name="paymentSelection"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="form-check-input"
                      />
                      <strong className="text-dark">Cash on Delivery (COD)</strong>
                    </div>
                    <span className="badge bg-secondary-subtle text-secondary small rounded-pill">
                      Pay on Arrival
                    </span>
                  </div>
                  <p className="small text-muted mb-0">
                    Pay with cash or UPI directly to our delivery courier when your fresh cake reaches your doorstep.
                  </p>
                </div>
              </div>
            </div>

            {/* Cake Message / Delivery Notes */}
            <div className="mt-4 pt-3 border-top">
              <label className="form-label small fw-bold text-dark">
                Special Message on Cake or Delivery Instructions (Optional)
              </label>
              <textarea
                className="form-control bg-light"
                rows="2"
                placeholder="e.g. 'Happy 25th Birthday Rhea!', please include 4 candles, deliver after 6 PM"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '100px' }}>
            <h5 className="fw-bold font-serif text-dark mb-3">Order Items ({cart.totalItems})</h5>

            <div className="cart-items-scroll mb-3" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {cart.items.map((item) => {
                const prod = item.product || {};
                const price = prod.price || item.unitPrice || 0;
                return (
                  <div key={prod._id || item._id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <span className="badge bg-light text-dark border small">{item.quantity}x</span>
                      <span className="small fw-semibold text-truncate" style={{ maxWidth: '160px' }}>
                        {prod.name}
                      </span>
                    </div>
                    <span className="small fw-bold text-dark">{formatCurrency(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Subtotal:</span>
              <span className="fw-semibold text-dark">{formatCurrency(cart.subtotal)}</span>
            </div>

            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Delivery Charges:</span>
              <span className={cart.deliveryFee === 0 ? 'text-success fw-bold' : 'fw-semibold text-dark'}>
                {cart.deliveryFee === 0 ? 'FREE' : formatCurrency(cart.deliveryFee)}
              </span>
            </div>

            <hr className="my-3" />

            <div className="d-flex justify-content-between mb-4">
              <span className="fs-5 fw-bold font-serif text-dark">Grand Total:</span>
              <span className="fs-4 fw-bold text-bakery-accent">{formatCurrency(cart.totalAmount)}</span>
            </div>

            <button
              type="button"
              className="btn btn-bakery-accent w-100 rounded-pill py-3 text-white fw-bold shadow-sm d-flex align-items-center justify-content-center"
              onClick={handlePlaceOrder}
              disabled={submitting || !selectedAddressId || cart.items.length === 0}
            >
              {submitting ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing Order...
                </span>
              ) : (
                <span>
                  {paymentMethod === 'RAZORPAY' ? 'Pay Online & Confirm' : 'Confirm Cash on Delivery'}
                  <i className="bi bi-arrow-right ms-2"></i>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Address Add / Edit Modal */}
      {showAddressModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-bakery-accent text-white">
                <h5 className="modal-title font-serif fw-bold text-white">
                  {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddressModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveAddress}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Recipient Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Mobile Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        required
                        value={addressForm.phoneNumber}
                        onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Door / House / Flat No *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Flat 304, Green Park"
                        value={addressForm.doorNumber}
                        onChange={(e) => setAddressForm({ ...addressForm, doorNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">Street Name / Road *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. 5th Main Road, Near Metro"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Village / Area / Locality</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Indiranagar"
                        value={addressForm.village}
                        onChange={(e) => setAddressForm({ ...addressForm, village: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Taluk / Sub-district</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Bangalore East"
                        value={addressForm.taluk}
                        onChange={(e) => setAddressForm({ ...addressForm, taluk: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">District *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Bangalore Urban"
                        value={addressForm.district}
                        onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">State *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Pincode *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        maxLength="6"
                        placeholder="e.g. 560038"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-bakery-accent text-white rounded-pill px-4"
                  >
                    Save Address
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

export default CustomerCheckout;
