import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getImageUrl } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const ShopRegistration = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    shopName: '',
    ownerName: user?.name || '',
    contactNumber: user?.phone || '',
    email: user?.email || '',
    street: '',
    lane: '',
    village: '',
    city: '',
    district: '',
    state: 'Karnataka',
    pincode: ''
  });

  const [currentLogo, setCurrentLogo] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        const res = await api.get('/shops/current');
        if (res.data.success && res.data.shop) {
          const s = res.data.shop;
          setForm({
            shopName: s.shopName || '',
            ownerName: s.ownerName || user?.name || '',
            contactNumber: s.contactNumber || user?.phone || '',
            email: s.email || user?.email || '',
            street: s.street || '',
            lane: s.lane || '',
            village: s.village || '',
            city: s.city || '',
            district: s.district || '',
            state: s.state || 'Karnataka',
            pincode: s.pincode || ''
          });
          if (s.shopLogo) {
            setCurrentLogo(s.shopLogo);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (logoFile) {
        formData.append('shopLogo', logoFile);
      }

      if (documentFiles && documentFiles.length > 0) {
        for (let i = 0; i < documentFiles.length; i++) {
          formData.append('otherDocuments', documentFiles[i]);
        }
      }

      const res = await api.post('/shops', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        success('Shop details registered and saved successfully!');
        if (res.data.shop?.shopLogo) {
          setCurrentLogo(res.data.shop.shopLogo);
        }
      }
    } catch (err) {
      error(err.message || 'Could not save shop registration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading shop information..." />;
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold font-serif text-bakery-accent mb-1">Shop Profile & Registration</h3>
          <p className="text-muted small mb-0">Configure your bakery location, contact details, official documents, and storefront brand.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-bakery-accent text-white p-3 p-md-4">
          <h5 className="mb-0 fw-bold font-serif text-white d-flex align-items-center">
            <i className="bi bi-shop me-2"></i> Bakery Registration Details
          </h5>
        </div>

        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Logo & Brand */}
              <div className="col-12 col-md-4 text-center border-end-md pe-md-4">
                <label className="form-label small fw-bold d-block mb-3">Shop Logo / Brand Icon</label>
                <div className="rounded-4 overflow-hidden border border-2 border-dashed p-2 mx-auto mb-3 bg-light" style={{ width: '160px', height: '160px' }}>
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : getImageUrl(currentLogo)}
                    alt="Bakery logo preview"
                    className="w-100 h-100 object-fit-cover rounded-3"
                  />
                </div>
                <input
                  type="file"
                  className="form-control form-control-sm"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                />
                <small className="text-muted d-block mt-2">Recommended: 400x400 PNG or JPG</small>
              </div>

              {/* Shop Details */}
              <div className="col-12 col-md-8 ps-md-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Shop Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. SweetDelight Bakery & Patisserie"
                      value={form.shopName}
                      onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Owner Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Chef Anand Sharma"
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Contact Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      required
                      placeholder="e.g. 9876543210"
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Shop Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      placeholder="e.g. contact@sweetdelight.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  {/* Address Fields */}
                  <div className="col-12 mt-4">
                    <h6 className="fw-bold font-serif text-bakery-accent border-bottom pb-2">Physical Kitchen / Shop Address</h6>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Street *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. 42 Pastry Lane"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Lane / Landmark</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2nd Cross, Near Central Park"
                      value={form.lane}
                      onChange={(e) => setForm({ ...form, lane: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Village / Area</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Indiranagar / Halasuru"
                      value={form.village}
                      onChange={(e) => setForm({ ...form, village: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Bangalore"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold">District *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Bangalore Urban"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">State *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Pincode *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      maxLength="6"
                      placeholder="e.g. 560038"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    />
                  </div>

                  {/* Documents */}
                  <div className="col-12 mt-4">
                    <h6 className="fw-bold font-serif text-bakery-accent border-bottom pb-2">Business License / Other Documents</h6>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold">Upload FSSAI Certificate, Trade License, or Tax Docs</label>
                    <input
                      type="file"
                      multiple
                      className="form-control"
                      onChange={(e) => setDocumentFiles(Array.from(e.target.files))}
                    />
                    <small className="text-muted">Supports images and PDF documents.</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top text-end">
              <button
                type="submit"
                className="btn btn-bakery-accent text-white px-5 py-2 rounded-pill fw-bold shadow-sm"
                disabled={saving}
              >
                {saving ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving Registration...
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-check2-circle me-1"></i> Register & Update Shop
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopRegistration;
