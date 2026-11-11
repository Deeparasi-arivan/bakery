import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import '../../styles/Hero.css';
import '../../styles/Categories.css';

const CustomerHome = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8')
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Banner Section */}
      <section className="hero-section py-5 position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #FDF8F5 0%, #F6E6DC 100%)',
        borderBottom: '1px solid rgba(220, 180, 160, 0.3)'
      }}>
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="badge bg-bakery-cream text-bakery-accent border border-bakery-accent px-3 py-2 rounded-pill mb-3 fw-bold shadow-xs">
                ✨ Handcrafted Artisanal Patisserie
              </span>
              <h1 className="display-4 fw-bold font-serif text-bakery-dark mb-3 lh-sm">
                Baked with Love, <br />
                <span className="text-bakery-accent">Crafted for Celebration.</span>
              </h1>
              <p className="lead text-muted mb-4 fs-6">
                From velvety Belgian chocolate gateaux and signature red velvet cakes to soft-baked cupcakes and gourmet glazed donuts—indulge in everyday luxury baked fresh every morning.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Link to="/products" className="btn btn-bakery-accent btn-lg text-white rounded-pill px-4 shadow-sm fw-semibold">
                  <i className="bi bi-cake2 me-2"></i> Explore Our Cakes
                </Link>
                <Link to="/bulk-order-inquiry" className="btn btn-outline-bakery btn-lg rounded-pill px-4 fw-semibold">
                  <i className="bi bi-gift me-2"></i> Custom Event Quotes
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="d-flex flex-wrap gap-4 mt-4 pt-3 border-top justify-content-center justify-content-lg-start">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <small className="fw-semibold text-secondary">100% Pure Butter</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-bakery-accent fs-5"></i>
                  <small className="fw-semibold text-secondary">Same Day Delivery</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-star-fill text-warning fs-5"></i>
                  <small className="fw-semibold text-secondary">4.9/5 Rating</small>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="col-lg-6">
              <div className="position-relative text-center">
                <div className="hero-img-backdrop rounded-circle mx-auto position-absolute top-50 start-50 translate-middle bg-white opacity-50" style={{ width: '420px', height: '420px', filter: 'blur(30px)' }}></div>
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80"
                  alt="Delicious signature bakery cake"
                  className="img-fluid rounded-4 shadow-lg position-relative hero-main-img border border-4 border-white"
                  style={{ maxHeight: '420px', objectFit: 'cover', width: '100%' }}
                />
                {/* Floating pill badge */}
                <div className="position-absolute bottom-0 start-0 m-3 bg-white p-3 rounded-4 shadow-lg text-start border border-light d-none d-sm-block" style={{ maxWidth: '220px' }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-success rounded-circle p-1"></span>
                    <small className="fw-bold text-dark">Fresh Batch Out of Oven</small>
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Warm Belgian Truffle sponge cooling now</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-bakery-accent fw-bold text-uppercase small tracking-wider">Explore By Craving</span>
            <h2 className="fw-bold font-serif text-dark mt-1">Our Delectable Categories</h2>
            <div className="divider mx-auto bg-bakery-accent my-2" style={{ width: '60px', height: '3px', borderRadius: '2px' }}></div>
            <p className="text-muted small">Choose from our premium categories crafted for birthdays, parties, or weekend indulgence.</p>
          </div>

          <div className="row g-3 g-md-4 justify-content-center">
            {categories.map((cat) => (
              <div key={cat._id} className="col-6 col-md-4 col-lg-3">
                <Link
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="text-decoration-none text-dark"
                >
                  <div className="card h-100 border-0 shadow-xs hover-lift rounded-4 text-center p-3 bg-bakery-cream transition-all">
                    <div className="rounded-circle overflow-hidden mx-auto mb-3 border border-3 border-white shadow-sm" style={{ width: '100px', height: '100px' }}>
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80'}
                        alt={cat.name}
                        className="w-100 h-100 object-fit-cover hover-zoom"
                      />
                    </div>
                    <h6 className="fw-bold mb-1 text-truncate font-serif">{cat.name}</h6>
                    <small className="text-muted text-truncate d-block" style={{ fontSize: '0.75rem' }}>
                      {cat.description || 'Freshly made to order'}
                    </small>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-5 bg-bakery-cream">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
            <div>
              <span className="text-bakery-accent fw-bold text-uppercase small tracking-wider">Signature Bakes</span>
              <h2 className="fw-bold font-serif text-dark mt-1 mb-0">Today's Fresh Creations</h2>
            </div>
            <Link to="/products" className="btn btn-outline-bakery rounded-pill btn-sm px-3 mt-3 mt-md-0 fw-semibold">
              View All Cakes & Bakes <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading freshly baked menu..." />
          ) : (
            <div className="row g-3 g-md-4">
              {featuredProducts.map((product) => (
                <div key={product._id} className="col-12 col-sm-6 col-lg-3">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom Event & Bulk Orders Banner */}
      <section className="py-5 text-white" style={{
        background: 'linear-gradient(rgba(46, 28, 20, 0.88), rgba(46, 28, 20, 0.94)), url(https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1400&auto=format&fit=crop&q=80) center/cover'
      }}>
        <div className="container py-4 text-center">
          <span className="badge bg-bakery-gold text-dark px-3 py-2 rounded-pill fw-bold mb-3">
            🎉 Weddings • Birthdays • Corporate Banquets
          </span>
          <h2 className="display-6 fw-bold font-serif mb-3 text-white">Planning a Grand Celebration?</h2>
          <p className="lead mx-auto text-light text-opacity-80 mb-4" style={{ maxWidth: '680px' }}>
            We specialize in handcrafted multi-tiered customized wedding cakes, themed birthday centerpieces, and large corporate dessert counters tailored to your flavor and theme.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/bulk-order-inquiry" className="btn btn-bakery-accent btn-lg text-white rounded-pill px-4 shadow fw-semibold">
              <i className="bi bi-balloon-heart me-2"></i> Request Custom Quote
            </Link>
            <a href="tel:+919876543210" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold">
              <i className="bi bi-telephone-fill me-2"></i> Call Master Chef
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-bakery-accent fw-bold text-uppercase small tracking-wider">The SweetDelight Standard</span>
            <h2 className="fw-bold font-serif text-dark mt-1">Why Dessert Lovers Choose Us</h2>
            <div className="divider mx-auto bg-bakery-accent my-2" style={{ width: '60px', height: '3px', borderRadius: '2px' }}></div>
          </div>

          <div className="row g-4">
            <div className="col-md-3 col-6 text-center">
              <div className="rounded-circle bg-bakery-cream p-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center shadow-xs" style={{ width: '70px', height: '70px' }}>
                <i className="bi bi-flower2 text-bakery-accent fs-3"></i>
              </div>
              <h6 className="fw-bold font-serif mb-1">100% Pure Butter</h6>
              <p className="text-muted small">No margarine, no artificial vegetable fats—only pure dairy goodness.</p>
            </div>
            <div className="col-md-3 col-6 text-center">
              <div className="rounded-circle bg-bakery-cream p-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center shadow-xs" style={{ width: '70px', height: '70px' }}>
                <i className="bi bi-sunrise-fill text-bakery-accent fs-3"></i>
              </div>
              <h6 className="fw-bold font-serif mb-1">Baked Fresh at Dawn</h6>
              <p className="text-muted small">Every sponge and frosting is prepared daily from 5:00 AM.</p>
            </div>
            <div className="col-md-3 col-6 text-center">
              <div className="rounded-circle bg-bakery-cream p-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center shadow-xs" style={{ width: '70px', height: '70px' }}>
                <i className="bi bi-shield-lock-fill text-bakery-accent fs-3"></i>
              </div>
              <h6 className="fw-bold font-serif mb-1">Razorpay & COD</h6>
              <p className="text-muted small">Seamless UPI, Cards, Net Banking or Pay on Delivery when it reaches you.</p>
            </div>
            <div className="col-md-3 col-6 text-center">
              <div className="rounded-circle bg-bakery-cream p-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center shadow-xs" style={{ width: '70px', height: '70px' }}>
                <i className="bi bi-truck text-bakery-accent fs-3"></i>
              </div>
              <h6 className="fw-bold font-serif mb-1">Chilled Transport</h6>
              <p className="text-muted small">Temperature-monitored vans ensuring cake reaches you immaculate.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerHome;
