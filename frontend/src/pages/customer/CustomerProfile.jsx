import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';

const CustomerProfile = () => {
  const { user, isCustomer, updateProfile, logout } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
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
    isDefault: false
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/customer/login');
      return;
    }
    setProfileForm({
      name: user.name || '',
      email: user.email || ''
    });
    fetchAddresses();
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfile(profileForm);
      success('Profile updated successfully!');
    } catch (err) {
      error(err.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAddAddress = () => {
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
      isDefault: addresses.length === 0
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
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

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await api.put(`/addresses/${editingAddressId}`, addressForm);
        success('Address updated successfully');
      } else {
        await api.post('/addresses', addressForm);
        success('New address added to your address book');
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save address';
      error(msg);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      success('Default delivery address updated');
      fetchAddresses();
    } catch (err) {
      error(err.message || 'Could not update default address');
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/addresses/${deleteConfirmId}`);
      success('Address deleted');
      setDeleteConfirmId(null);
      fetchAddresses();
    } catch (err) {
      error(err.message || 'Failed to delete address');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-4">
            <div className="rounded-circle bg-bakery-cream border border-bakery-accent p-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-person-fill text-bakery-accent fs-1"></i>
            </div>
            <h5 className="fw-bold font-serif text-dark mb-1">{user?.name || 'Customer'}</h5>
            <span className="badge bg-light text-muted border small mb-3">
              <i className="bi bi-phone me-1"></i> +91 {user?.phone}
            </span>

            <form onSubmit={handleProfileSubmit} className="text-start mt-3 border-top pt-3">
              <div className="mb-3">
                <label className="form-label small fw-bold">Full Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-sm bg-light"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="submit"
                className="btn btn-bakery-accent w-100 rounded-pill btn-sm text-white fw-semibold mb-2"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving...' : 'Update Profile'}
              </button>

              <button
                type="button"
                className="btn btn-outline-danger w-100 rounded-pill btn-sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Address Book */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold font-serif text-dark mb-1">Saved Delivery Addresses</h4>
                <p className="text-muted small mb-0">Manage your home, office, and celebration venue addresses.</p>
              </div>
              <button
                type="button"
                className="btn btn-bakery-accent text-white btn-sm rounded-pill px-3 fw-semibold shadow-xs"
                onClick={handleOpenAddAddress}
              >
                <i className="bi bi-plus-lg me-1"></i> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-4">
                <i className="bi bi-geo-alt fs-2 text-muted mb-2 d-block"></i>
                <p className="small text-muted mb-3">No saved addresses found.</p>
                <button
                  type="button"
                  className="btn btn-outline-bakery btn-sm rounded-pill px-4"
                  onClick={handleOpenAddAddress}
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {addresses.map((addr) => (
                  <div key={addr._id} className="col-md-6">
                    <div className={`p-3 rounded-4 border h-100 d-flex flex-column justify-content-between ${
                      addr.isDefault ? 'border-bakery-accent bg-bakery-cream bg-opacity-25' : 'bg-light'
                    }`}>
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong className="text-dark">{addr.name}</strong>
                          {addr.isDefault ? (
                            <span className="badge bg-bakery-accent text-white small rounded-pill">
                              Default Address
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-link btn-xs p-0 text-muted text-decoration-none small"
                              onClick={() => handleSetDefault(addr._id)}
                            >
                              Set as Default
                            </button>
                          )}
                        </div>

                        <p className="small text-secondary mb-2" style={{ lineHeight: 1.4 }}>
                          {addr.doorNumber}, {addr.street}
                          {addr.village ? `, ${addr.village}` : ''}
                          <br />
                          {addr.taluk ? `${addr.taluk}, ` : ''}{addr.district}, {addr.state} - {addr.pincode}
                        </p>

                        <div className="small text-muted mb-3">
                          <i className="bi bi-telephone me-1"></i> {addr.phoneNumber}
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 small"
                          onClick={() => handleOpenEditAddress(addr)}
                        >
                          <i className="bi bi-pencil me-1"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 small"
                          onClick={() => setDeleteConfirmId(addr._id)}
                        >
                          <i className="bi bi-trash3 me-1"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Add/Edit Modal */}
      {showAddressModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-bakery-accent text-white">
                <h5 className="modal-title font-serif fw-bold text-white">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
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
                      <label className="form-label small fw-bold">Contact Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Mobile Phone *</label>
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
                        value={addressForm.doorNumber}
                        onChange={(e) => setAddressForm({ ...addressForm, doorNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">Street *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Village / Locality</label>
                      <input
                        type="text"
                        className="form-control"
                        value={addressForm.village}
                        onChange={(e) => setAddressForm({ ...addressForm, village: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Taluk</label>
                      <input
                        type="text"
                        className="form-control"
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
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="setDefaultCheck"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        />
                        <label className="form-check-label small" htmlFor="setDefaultCheck">
                          Set this as my default delivery address
                        </label>
                      </div>
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
                  <button type="submit" className="btn btn-bakery-accent text-white rounded-pill px-4">
                    Save Address
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
        title="Delete Address"
        message="Are you sure you want to delete this address from your address book?"
        onConfirm={handleDeleteAddress}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default CustomerProfile;
