import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const CustomerProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters from query params
  const activeCategory = searchParams.get('category') || 'all';
  const searchTerm = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const onlyInStock = searchParams.get('inStock') === 'true';

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (activeCategory && activeCategory !== 'all') {
          // If activeCategory is an ID or Name, let's find matching category ID
          const matchedCat = categories.find(
            (c) => c.name.toLowerCase() === activeCategory.toLowerCase() || c._id === activeCategory
          );
          if (matchedCat) {
            params.append('category', matchedCat._id);
          }
        }

        if (searchTerm) {
          params.append('search', searchTerm);
        }

        if (sortBy) {
          params.append('sort', sortBy);
        }

        if (onlyInStock) {
          params.append('isAvailable', 'true');
        }

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success) {
          let list = res.data.products;
          if (onlyInStock) {
            list = list.filter((p) => p.stock > 0);
          }
          setProducts(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, searchTerm, sortBy, onlyInStock, categories]);

  const handleCategorySelect = (catName) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catName === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', catName);
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (e) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', e.target.value);
    setSearchParams(nextParams);
  };

  const handleStockToggle = (e) => {
    const nextParams = new URLSearchParams(searchParams);
    if (e.target.checked) {
      nextParams.set('inStock', 'true');
    } else {
      nextParams.delete('inStock');
    }
    setSearchParams(nextParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const nextParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      nextParams.set('search', val);
    } else {
      nextParams.delete('search');
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="container py-4 py-md-5">
      {/* Page Title & Breadcrumb */}
      <div className="text-center mb-4">
        <span className="badge bg-bakery-cream text-bakery-accent border border-bakery-accent px-3 py-1 rounded-pill small mb-2 fw-bold">
          Our Fresh Collection
        </span>
        <h1 className="fw-bold font-serif text-dark mb-1">Artisanal Cakes & Sweet Confections</h1>
        <p className="text-muted small">
          Baked daily using premium cream, Belgian chocolate, and pure butter. Handcrafted for your celebrations.
        </p>
      </div>

      {/* Category Pills Navigation */}
      <div className="category-scroll-container pb-2 mb-4">
        <div className="d-flex flex-nowrap flex-md-wrap gap-2 justify-content-start justify-content-md-center overflow-x-auto py-1">
          <button
            type="button"
            className={`btn rounded-pill px-3 py-2 small fw-semibold text-nowrap shadow-xs ${
              activeCategory === 'all'
                ? 'btn-bakery-accent text-white'
                : 'btn-white border text-dark'
            }`}
            onClick={() => handleCategorySelect('all')}
          >
            <i className="bi bi-grid-fill me-1"></i> All Delights
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={`btn rounded-pill px-3 py-2 small fw-semibold text-nowrap shadow-xs ${
                activeCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'btn-bakery-accent text-white'
                  : 'btn-white border text-dark'
              }`}
              onClick={() => handleCategorySelect(cat.name)}
            >
              <i className={`bi ${cat.icon || 'bi-cake2'} me-1`}></i>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search cakes by name or ingredients..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-light border-start-0 border"
                  onClick={() => handleSearchChange({ target: { value: '' } })}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Sort By */}
          <div className="col-6 col-md-4">
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted text-nowrap fw-semibold d-none d-sm-inline">Sort By:</label>
              <select
                className="form-select bg-light border form-select-sm rounded-pill"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="newest">Featured & Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="col-6 col-md-3 text-end">
            <div className="form-check form-switch d-inline-block">
              <input
                className="form-check-input"
                type="checkbox"
                id="inStockCheck"
                checked={onlyInStock}
                onChange={handleStockToggle}
              />
              <label className="form-check-label small fw-semibold text-dark" htmlFor="inStockCheck">
                In Stock Only
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Product Results */}
      {loading ? (
        <LoadingSpinner message="Fetching delicious cakes..." />
      ) : products.length === 0 ? (
        <div className="text-center py-5 my-5 bg-white rounded-4 shadow-sm p-4">
          <div className="rounded-circle bg-light p-4 mx-auto mb-3 d-inline-flex align-items-center justify-content-center text-muted" style={{ width: '80px', height: '80px' }}>
            <i className="bi bi-cake2 fs-1 text-muted"></i>
          </div>
          <h5 className="fw-bold font-serif text-dark">No Products Found</h5>
          <p className="text-muted small mb-4">
            We couldn't find any items matching your current filters or search term "{searchTerm}".
          </p>
          <button
            type="button"
            className="btn btn-bakery-accent text-white rounded-pill px-4"
            onClick={() => setSearchParams({})}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <small className="text-muted fw-semibold">
              Showing <span className="text-dark fw-bold">{products.length}</span> fresh items
            </small>
            {activeCategory !== 'all' && (
              <span className="badge bg-light text-bakery-accent border small">
                Category: {activeCategory}
              </span>
            )}
          </div>
          <div className="row g-3 g-md-4">
            {products.map((product) => (
              <div key={product._id} className="col-12 col-sm-6 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerProducts;
