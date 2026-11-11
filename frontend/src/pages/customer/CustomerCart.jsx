import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Cart.css';

const CustomerCart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { success, error } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQtyChange = async (productId, newQty, maxStock) => {
    if (newQty > maxStock) {
      error(`Cannot add more. Only ${maxStock} items available in stock.`);
      return;
    }
    try {
      await updateQuantity(productId, newQty);
    } catch (err) {
      error(err.message || 'Could not update quantity');
    }
  };

  const handleRemove = async (productId, name) => {
    try {
      await removeFromCart(productId);
      success(`Removed ${name} from your cart.`);
    } catch (err) {
      error(err.message || 'Could not remove item');
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/customer/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container py-5 my-5">
        <div className="row justify-content-center">
          <div className="col-md-7 text-center bg-white p-5 rounded-4 shadow-sm">
            <div className="rounded-circle bg-bakery-cream p-4 mx-auto mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
              <i className="bi bi-cart-x fs-1 text-bakery-accent"></i>
            </div>
            <h3 className="fw-bold font-serif text-dark mb-2">Your Cart is Empty</h3>
            <p className="text-muted mb-4">
              Looks like you haven't added any sweet treats to your cart yet. Explore our handcrafted cakes, cupcakes, and donuts!
            </p>
            <Link to="/products" className="btn btn-bakery-accent text-white rounded-pill px-4 py-2 fw-semibold shadow-sm">
              <i className="bi bi-cake2 me-2"></i> Browse Our Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold font-serif text-dark mb-1">Your Shopping Cart</h2>
          <small className="text-muted">You have {cart.totalItems} item{cart.totalItems > 1 ? 's' : ''} in your cart</small>
        </div>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm rounded-pill px-3"
          onClick={clearCart}
        >
          <i className="bi bi-trash3 me-1"></i> Clear Cart
        </button>
      </div>

      <div className="row g-4">
        {/* Cart Items List */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-uppercase text-muted">
                    <th scope="col" className="ps-4 py-3">Product</th>
                    <th scope="col" className="py-3">Price</th>
                    <th scope="col" className="py-3 text-center">Quantity</th>
                    <th scope="col" className="py-3 text-end pe-4">Subtotal</th>
                    <th scope="col" className="py-3 text-center" style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => {
                    const prod = item.product || {};
                    const price = prod.price || item.unitPrice || 0;
                    const stock = prod.stock || 99;
                    const subtotal = price * item.quantity;

                    return (
                      <tr key={prod._id || item._id}>
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={getImageUrl(prod.image)}
                              alt={prod.name}
                              className="rounded-3 object-fit-cover shadow-xs"
                              style={{ width: '64px', height: '64px' }}
                            />
                            <div>
                              <h6 className="mb-0 fw-bold text-dark font-serif">
                                <Link to={`/products/${prod._id}`} className="text-decoration-none text-dark hover-accent">
                                  {prod.name}
                                </Link>
                              </h6>
                              <small className="text-muted">{prod.quantity || '500g'}</small>
                            </div>
                          </div>
                        </td>
                        <td className="fw-semibold text-secondary">{formatCurrency(price)}</td>
                        <td className="text-center">
                          <div className="d-inline-flex align-items-center border rounded-pill bg-light p-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-white rounded-circle shadow-xs px-2 py-0 border"
                              onClick={() => handleQtyChange(prod._id, item.quantity - 1, stock)}
                            >
                              -
                            </button>
                            <span className="px-3 fw-bold small">{item.quantity}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-white rounded-circle shadow-xs px-2 py-0 border"
                              onClick={() => handleQtyChange(prod._id, item.quantity + 1, stock)}
                              disabled={item.quantity >= stock}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-end pe-4 fw-bold text-bakery-accent">
                          {formatCurrency(subtotal)}
                        </td>
                        <td className="text-center pe-3">
                          <button
                            type="button"
                            className="btn btn-light text-danger btn-sm rounded-circle p-1"
                            onClick={() => handleRemove(prod._id, prod.name)}
                            title="Remove item"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
              <Link to="/products" className="btn btn-link text-bakery-accent text-decoration-none fw-semibold p-0">
                <i className="bi bi-arrow-left me-1"></i> Continue Shopping
              </Link>
              <small className="text-muted">Standard temperature chilled delivery</small>
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '100px' }}>
            <h5 className="fw-bold font-serif text-dark mb-3">Order Summary</h5>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Items Subtotal:</span>
              <span className="fw-semibold text-dark">{formatCurrency(cart.subtotal)}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Delivery Charges:</span>
              <span className={cart.deliveryFee === 0 ? 'text-success fw-bold' : 'fw-semibold text-dark'}>
                {cart.deliveryFee === 0 ? 'FREE' : formatCurrency(cart.deliveryFee)}
              </span>
            </div>

            {cart.subtotal < 500 && (
              <div className="alert alert-warning py-2 px-3 small rounded-3 my-2">
                <i className="bi bi-info-circle me-1"></i> Add <strong>{formatCurrency(500 - cart.subtotal)}</strong> more for <strong>FREE Delivery</strong>!
              </div>
            )}

            <hr className="my-3" />

            <div className="d-flex justify-content-between mb-4">
              <span className="fs-5 fw-bold font-serif text-dark">Total Amount:</span>
              <span className="fs-4 fw-bold text-bakery-accent">{formatCurrency(cart.totalAmount)}</span>
            </div>

            <button
              type="button"
              className="btn btn-bakery-accent w-100 rounded-pill py-3 text-white fw-semibold shadow-sm mb-3 d-flex align-items-center justify-content-center"
              onClick={handleProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <i className="bi bi-arrow-right ms-2 fs-5"></i>
            </button>

            <div className="d-flex flex-column gap-2 small text-muted">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-lock-fill text-success"></i>
                <span>Secure 256-bit encrypted checkout</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-cash-coin text-bakery-accent"></i>
                <span>Cash on Delivery & Razorpay available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;
