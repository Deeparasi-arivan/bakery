import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, getImageUrl } from '../utils/helpers';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import '../styles/Products.css';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const isOutOfStock = !product.isAvailable || product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      error(`Only ${product.stock} items currently in stock`);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      setAdding(true);
      await addToCart(product, quantity);
      success(`Added ${quantity} × ${product.name} to cart!`);
    } catch (err) {
      error(err.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    try {
      setAdding(true);
      await addToCart(product, quantity);
      navigate('/checkout');
    } catch (err) {
      error(err.message || 'Could not proceed to checkout');
      setAdding(false);
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm product-card rounded-4 overflow-hidden position-relative">
      {/* Badges */}
      <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1" style={{ zIndex: 2 }}>
        {isOutOfStock ? (
          <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm">
            Only {product.stock} left!
          </span>
        ) : null}
        {product.isFeatured && !isOutOfStock && (
          <span className="badge bg-bakery-accent rounded-pill px-3 py-2 shadow-sm text-white">
            ★ Chef Special
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="product-image-container position-relative overflow-hidden bg-light" style={{ height: '220px' }}>
        <Link to={`/products/${product._id}`}>
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-100 h-100 object-fit-cover product-img"
            loading="lazy"
          />
        </Link>
        <span className="badge bg-dark bg-opacity-75 text-white position-absolute bottom-0 end-0 m-2 rounded-pill px-2 py-1 small">
          {product.quantity || '500g'}
        </span>
      </div>

      {/* Body */}
      <div className="card-body d-flex flex-column p-3">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="badge bg-light text-muted border text-uppercase small" style={{ fontSize: '0.72rem' }}>
            {product.category?.name || 'Artisanal'}
          </span>
          <div className="text-warning small d-flex align-items-center">
            <i className="bi bi-star-fill me-1"></i>
            <span className="fw-bold text-dark">{product.rating || 4.8}</span>
            <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>({product.reviewsCount || 12})</span>
          </div>
        </div>

        <h6 className="card-title fw-bold text-dark mb-1 text-truncate" title={product.name}>
          <Link to={`/products/${product._id}`} className="text-decoration-none text-dark hover-accent">
            {product.name}
          </Link>
        </h6>

        <p className="card-text text-muted small mb-3 flex-grow-1" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.4rem'
        }}>
          {product.description || 'Deliciously hand-crafted using organic ingredients and baked fresh daily.'}
        </p>

        <div className="d-flex align-items-baseline justify-content-between mb-3">
          <div>
            <span className="fs-5 fw-bold text-bakery-accent">{formatCurrency(product.price)}</span>
          </div>
          <div className="small text-muted">
            Stock: <span className={product.stock > 0 ? 'fw-bold text-success' : 'text-danger fw-bold'}>{product.stock}</span>
          </div>
        </div>

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="d-flex align-items-center justify-content-between mb-3 bg-light rounded-pill p-1 border">
            <span className="small text-muted ps-2 fw-medium">Qty:</span>
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="btn btn-sm btn-white rounded-circle shadow-xs px-2 py-0 border"
                onClick={handleDecrease}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 fw-bold small">{quantity}</span>
              <button
                type="button"
                className="btn btn-sm btn-white rounded-circle shadow-xs px-2 py-0 border"
                onClick={handleIncrease}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-grid gap-2 mt-auto">
          <button
            type="button"
            className="btn btn-outline-bakery rounded-pill btn-sm fw-semibold d-flex align-items-center justify-content-center py-2"
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
          >
            <i className="bi bi-cart-plus me-2 fs-6"></i>
            {isOutOfStock ? 'Sold Out' : adding ? 'Adding...' : 'Add to Cart'}
          </button>
          {!isOutOfStock && (
            <button
              type="button"
              className="btn btn-bakery-accent rounded-pill btn-sm text-white fw-semibold d-flex align-items-center justify-content-center py-2 shadow-xs"
              onClick={handleBuyNow}
              disabled={adding}
            >
              <i className="bi bi-lightning-fill me-1"></i> Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
