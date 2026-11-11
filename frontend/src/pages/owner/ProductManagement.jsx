import React, { useState, useEffect } from 'react';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';

const ProductManagement = () => {
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '500g',
    stock: '',
    lowStockThreshold: 5,
    isAvailable: true,
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0 && !form.category) {
          setForm((prev) => ({ ...prev, category: res.data.categories[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, search]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setImageFile(null);
    setForm({
      name: '',
      description: '',
      category: categories[0]?._id || '',
      price: '',
      quantity: '500g',
      stock: '',
      lowStockThreshold: 5,
      isAvailable: true,
      image: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setImageFile(null);
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category?._id || p.category,
      price: p.price,
      quantity: p.quantity || '500g',
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || 5,
      isAvailable: p.isAvailable,
      image: p.image || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || form.price === '') {
      error('Please fill in product name, category, and price');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('quantity', form.quantity);
      formData.append('stock', form.stock || 0);
      formData.append('lowStockThreshold', form.lowStockThreshold);
      formData.append('isAvailable', form.isAvailable);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (form.image) {
        formData.append('image', form.image);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        success(`Product '${form.name}' updated successfully!`);
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        success(`New product '${form.name}' added to bakery menu!`);
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/products/${deleteConfirmId}`);
      success('Product deleted from bakery catalog');
      setDeleteConfirmId(null);
      fetchProducts();
    } catch (err) {
      error(err.message || 'Could not delete product');
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      const updated = !product.isAvailable;
      await api.put(`/products/${product._id}`, { isAvailable: updated });
      success(`${product.name} is now ${updated ? 'Available' : 'Unavailable'}`);
      fetchProducts();
    } catch (err) {
      error(err.message || 'Could not update availability');
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold font-serif text-bakery-accent mb-1">Product Management</h3>
          <p className="text-muted small mb-0">Add, edit, adjust stocks, or remove artisan cakes and confections.</p>
        </div>
        <button
          type="button"
          className="btn btn-bakery-accent text-white rounded-pill px-4 shadow-sm fw-semibold"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-circle-fill me-2"></i> Add New Product
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search products by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted fw-bold text-nowrap">Category:</label>
              <select
                className="form-select bg-light"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      {loading ? (
        <LoadingSpinner message="Loading bakery catalog..." />
      ) : products.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-cake2 fs-1 text-muted mb-2"></i>
          <h5 className="fw-bold font-serif text-dark">No Products Found</h5>
          <p className="text-muted small mb-3">No cakes match your search or category filter.</p>
          <div>
            <button
              type="button"
              className="btn btn-outline-bakery btn-sm rounded-pill px-3"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Product</th>
                  <th scope="col" className="py-3">Category</th>
                  <th scope="col" className="py-3">Price</th>
                  <th scope="col" className="py-3">Weight / Qty</th>
                  <th scope="col" className="py-3">Stock Units</th>
                  <th scope="col" className="py-3">Availability</th>
                  <th scope="col" className="py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLow = p.stock <= (p.lowStockThreshold || 5);
                  return (
                    <tr key={p._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={getImageUrl(p.image)}
                            alt={p.name}
                            className="rounded-3 object-fit-cover shadow-xs border"
                            style={{ width: '56px', height: '56px' }}
                          />
                          <div>
                            <h6 className="mb-0 fw-bold text-dark font-serif">{p.name}</h6>
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '240px' }}>
                              {p.description || 'Deliciously hand-crafted cake'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border small">
                          {p.category?.name || 'Cakes'}
                        </span>
                      </td>
                      <td className="fw-bold text-bakery-accent">{formatCurrency(p.price)}</td>
                      <td className="small text-muted">{p.quantity || '500g'}</td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-1 ${
                          p.stock === 0
                            ? 'bg-danger text-white'
                            : isLow
                            ? 'bg-warning text-dark'
                            : 'bg-success-subtle text-success border border-success-subtle'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={p.isAvailable}
                            onChange={() => handleToggleAvailability(p)}
                          />
                          <label className="form-check-label small fw-semibold">
                            {p.isAvailable ? 'Active' : 'Disabled'}
                          </label>
                        </div>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm rounded-circle p-2"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Product"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-circle p-2"
                            onClick={() => setDeleteConfirmId(p._id)}
                            title="Delete Product"
                          >
                            <i className="bi bi-trash3"></i>
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
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-bakery-accent text-white">
                <h5 className="modal-title font-serif fw-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Cake / Confection'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">Product Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Belgian Dark Truffle Chocolate Cake"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Category *</label>
                      <select
                        className="form-select"
                        required
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Description</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Flavor profile, sponge layers, frosting details..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Price (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        min="0"
                        placeholder="e.g. 650"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Quantity / Weight *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. 500g, 1kg, 6 Pcs"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Initial / Current Stock *</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        min="0"
                        placeholder="e.g. 15"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Low Stock Alert Threshold</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={form.lowStockThreshold}
                        onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                      />
                      <div className="form-text small">Alert is triggered when stock drops to or below this level.</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Availability Status</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="availSwitch"
                          checked={form.isAvailable}
                          onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                        />
                        <label className="form-check-label small" htmlFor="availSwitch">
                          {form.isAvailable ? 'Available for ordering' : 'Mark as unavailable'}
                        </label>
                      </div>
                    </div>

                    {/* Image Upload / URL */}
                    <div className="col-12">
                      <label className="form-label small fw-bold">Product Image (File Upload or URL) *</label>
                      <div className="input-group mb-2">
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files[0])}
                        />
                      </div>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-light"
                        placeholder="Or paste external image URL (e.g. Unsplash URL)"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                      />
                      {(imageFile || form.image) && (
                        <div className="mt-2 d-flex align-items-center gap-2">
                          <small className="text-muted">Preview:</small>
                          <img
                            src={imageFile ? URL.createObjectURL(imageFile) : getImageUrl(form.image)}
                            alt="Preview"
                            className="rounded border"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-bakery-accent text-white rounded-pill px-4"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Product"
        message="Are you sure you want to remove this product from your bakery inventory? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default ProductManagement;
