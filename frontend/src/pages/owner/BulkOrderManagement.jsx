import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';

const BulkOrderManagement = () => {
  const { success, error } = useToast();
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal Edit / Quote
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'Inquiry',
    estimatedBudget: 0,
    advanceAmount: 0,
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchBulkOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await api.get(`/bulk-orders?${params.toString()}`);
      if (res.data.success) {
        setBulkOrders(res.data.bulkOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkOrders();
  }, [statusFilter]);

  const handleOpenEdit = (inquiry) => {
    setSelectedInquiry(inquiry);
    setEditForm({
      status: inquiry.status,
      estimatedBudget: inquiry.estimatedBudget || 0,
      advanceAmount: inquiry.advanceAmount || 0,
      notes: inquiry.notes || ''
    });
  };

  const handleSaveInquiry = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    try {
      setSaving(true);
      const res = await api.put(`/bulk-orders/${selectedInquiry._id}`, editForm);
      if (res.data.success) {
        success('Bulk order inquiry updated!');
        setSelectedInquiry(null);
        fetchBulkOrders();
      }
    } catch (err) {
      error(err.message || 'Failed to update bulk order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/bulk-orders/${deleteConfirmId}`);
      success('Bulk order inquiry deleted');
      setDeleteConfirmId(null);
      fetchBulkOrders();
    } catch (err) {
      error(err.message || 'Could not delete bulk order');
    }
  };

  const statusOptions = ['Inquiry', 'Quoted', 'Confirmed', 'In Progress', 'Completed', 'Declined'];

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Inquiry':
        return 'bg-warning text-dark';
      case 'Quoted':
        return 'bg-info text-dark';
      case 'Confirmed':
        return 'bg-primary text-white';
      case 'In Progress':
        return 'bg-secondary text-white';
      case 'Completed':
        return 'bg-success text-white';
      case 'Declined':
        return 'bg-danger text-white';
      default:
        return 'bg-light text-dark';
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold font-serif text-bakery-accent mb-1">Bulk Event & Tiered Cake Orders</h3>
          <p className="text-muted small mb-0">Manage customer catering inquiries for weddings, birthdays, banquets, and corporate events.</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className="small text-muted fw-bold me-2">Filter by Status:</span>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${statusFilter === 'all' ? 'btn-bakery-accent text-white' : 'btn-light'}`}
            onClick={() => setStatusFilter('all')}
          >
            All Inquiries
          </button>
          {statusOptions.map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${statusFilter === st ? 'btn-bakery-accent text-white' : 'btn-light'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Orders Table */}
      {loading ? (
        <LoadingSpinner message="Retrieving event cake inquiries..." />
      ) : bulkOrders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-balloon-heart fs-1 text-muted mb-2"></i>
          <h5 className="fw-bold font-serif text-dark">No Bulk Orders Found</h5>
          <p className="text-muted small">No event cake requests currently match status "{statusFilter}".</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Event Date</th>
                  <th scope="col" className="py-3">Customer / Host</th>
                  <th scope="col" className="py-3">Event Type</th>
                  <th scope="col" className="py-3">Cake / Item Requirements</th>
                  <th scope="col" className="py-3">Budget & Advance</th>
                  <th scope="col" className="py-3">Status</th>
                  <th scope="col" className="py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bulkOrders.map((bo) => (
                  <tr key={bo._id}>
                    <td className="ps-4 py-3">
                      <strong className="text-dark small d-block">{formatDate(bo.eventDate)}</strong>
                      <small className="text-muted">Inquired: {formatDate(bo.createdAt)}</small>
                    </td>
                    <td>
                      <strong className="text-dark small d-block">{bo.customerName}</strong>
                      <small className="text-muted d-block">
                        <i className="bi bi-telephone me-1"></i> {bo.contactNumber}
                      </small>
                      {bo.email && <small className="text-muted">{bo.email}</small>}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border small">
                        {bo.eventType}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <p className="small text-secondary mb-1 text-truncate-2">
                        {bo.requiredItems}
                      </p>
                      {bo.notes && (
                        <small className="text-muted italic">Note: {bo.notes}</small>
                      )}
                    </td>
                    <td>
                      <span className="small text-muted d-block">
                        Est: <strong>{formatCurrency(bo.estimatedBudget)}</strong>
                      </span>
                      <small className="text-success fw-bold">
                        Adv Paid: {formatCurrency(bo.advanceAmount)}
                      </small>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(bo.status)} rounded-pill px-3 py-1 small`}>
                        {bo.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                          onClick={() => handleOpenEdit(bo)}
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-circle p-1"
                          onClick={() => setDeleteConfirmId(bo._id)}
                          title="Delete Inquiry"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Quote Modal */}
      {selectedInquiry && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-bakery-accent text-white">
                <h5 className="modal-title font-serif fw-bold text-white">
                  Manage Event Order: {selectedInquiry.customerName}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedInquiry(null)}
                ></button>
              </div>

              <form onSubmit={handleSaveInquiry}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <p className="mb-1">
                      <strong>Occasion:</strong> {selectedInquiry.eventType} on {formatDate(selectedInquiry.eventDate)}
                    </p>
                    <p className="mb-1">
                      <strong>Contact:</strong> {selectedInquiry.contactNumber} ({selectedInquiry.email || 'No email'})
                    </p>
                    <p className="mb-0">
                      <strong>Items Needed:</strong> {selectedInquiry.requiredItems}
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Inquiry Status *</label>
                    <select
                      className="form-select"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Quoted / Estimated Price (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.estimatedBudget}
                        onChange={(e) => setEditForm({ ...editForm, estimatedBudget: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Advance Collected (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.advanceAmount}
                        onChange={(e) => setEditForm({ ...editForm, advanceAmount: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Kitchen Chef Notes / Delivery Prep</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Fondant flowers prepared, chilled delivery van booked for 3 PM"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setSelectedInquiry(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-bakery-accent text-white rounded-pill px-4"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Update Inquiry'}
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
        title="Delete Bulk Order Inquiry"
        message="Are you sure you want to delete this event inquiry?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default BulkOrderManagement;
