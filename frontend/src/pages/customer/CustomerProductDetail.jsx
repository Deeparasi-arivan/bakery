import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductCard from '../../components/ProductCard';
import api from '../../services/api';

const CustomerProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          setQuantity(1);

          // Fetch related in same category
          if (prod.category?._id) {
            const relRes = await api.get(`/products?category=${prod.category._id}&limit=4`);
            if (relRes.data.success) {
              setRelated(relRes.data.products.filter((p) => p._id !== prod._id));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Preparing cake details..." />;
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold font-serif">Product Not Found</h4>
        <p className="text-muted">The delicious cake you are looking for is no longer available.</p>
        <Link to="/products" className="btn btn-bakery-accent text-white rounded-pill px-4">
          Return to All Cakes
        </Link>
      </div>
    );
  }

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
      success(`Added ${quantity} × ${product.name} to your cart!`);
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
    <div className="container py-4 py-md-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none text-muted">Cakes</Link></li>
          {product.category && (
            <li className="breadcrumb-item">
              <Link to={`/products?category=${product.category.name}`} className="text-decoration-none text-muted">
                {product.category.name}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* Main Product Section */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden p-3 p-md-4 mb-5 bg-white">
        <div className="row g-4 g-lg-5 align-items-center">
          {/* Product Image */}
          <div className="col-lg-6">
            <div className="position-relative rounded-4 overflow-hidden bg-light shadow-sm" style={{ maxHeight: '460px' }}>
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-100 h-100 object-fit-cover"
                style={{ minHeight: '340px' }}
              />
              {isOutOfStock ? (
                <span className="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill fs-6 shadow">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill fs-6 shadow">
                  Only {product.stock} items left!
                </span>
              ) : null}
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-bakery-cream text-bakery-accent border border-bakery-accent rounded-pill px-3 py-1">
                {product.category?.name || 'Bakery Confection'}
              </span>
              <div className="text-warning small d-flex align-items-center">
                <i className="bi bi-star-fill me-1"></i>
                <span className="fw-bold text-dark">{product.rating || 4.8}</span>
                <span className="text-muted ms-1">({product.reviewsCount || 15} reviews)</span>
              </div>
            </div>

            <h1 className="fw-bold font-serif text-dark mb-2">{product.name}</h1>
            <p className="lead text-bakery-accent fw-bold fs-3 mb-3">
              {formatCurrency(product.price)}
              <span className="text-muted fs-6 fw-normal ms-2">/ {product.quantity || '500g'}</span>
            </p>

            <p className="text-secondary mb-4 leading-relaxed">
              {product.description ||
                'Prepared with pure butter, whole cream, and fresh organic extracts. Baked on morning of dispatch to guarantee optimal crumb tenderness and luxurious texture.'}
            </p>

            {/* Inventory Status */}
            <div className="p-3 bg-light rounded-3 mb-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-muted d-block">Available Stock:</span>
                <strong className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                  {product.stock > 0 ? `${product.stock} in kitchen` : 'Sold out today'}
                </strong>
              </div>
              <div>
                <span className="small text-muted d-block">Portion / Weight:</span>
                <strong className="text-dark">{product.quantity || 'Standard Size'}</strong>
              </div>
              <div>
                <span className="small text-muted d-block">Delivery:</span>
                <strong className="text-dark">Within 3-4 Hours</strong>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            {!isOutOfStock && (
              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="fw-semibold small text-muted">Quantity:</span>
                <div className="d-flex align-items-center border rounded-pill bg-light p-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-white rounded-circle shadow-xs px-3 border"
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 fw-bold">{quantity}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-white rounded-circle shadow-xs px-3 border"
                    onClick={handleIncrease}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <span className="small text-muted">
                  Total: <strong className="text-dark">{formatCurrency(product.price * quantity)}</strong>
                </span>
              </div>
            )}

            <div className="d-flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-outline-bakery btn-lg rounded-pill px-4 fw-semibold flex-grow-1"
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
              >
                <i className="bi bi-cart-plus me-2"></i>
                {isOutOfStock ? 'Sold Out' : adding ? 'Adding...' : 'Add to Cart'}
              </button>
              {!isOutOfStock && (
                <button
                  type="button"
                  className="btn btn-bakery-accent btn-lg rounded-pill px-4 text-white fw-semibold shadow flex-grow-1"
                  onClick={handleBuyNow}
                  disabled={adding}
                >
                  <i className="bi bi-lightning-fill me-1"></i> Buy Now
                </button>
              )}
            </div>

            {/* Assurance Icons */}
            <div className="mt-4 pt-3 border-top d-flex flex-wrap gap-4 text-muted small">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-success fs-5"></i>
                <span>100% Hygienic & Sanitized Bakery</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-truck text-bakery-accent fs-5"></i>
                <span>Specialized Cake Carrier Box</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold font-serif text-dark mb-0">You Might Also Love</h3>
            <Link to={`/products?category=${product.category?.name}`} className="btn btn-link text-bakery-accent text-decoration-none fw-semibold">
              View All {product.category?.name} <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="row g-3 g-md-4">
            {related.map((relProd) => (
              <div key={relProd._id} className="col-12 col-sm-6 col-lg-3">
                <ProductCard product={relProd} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CustomerProductDetail;
