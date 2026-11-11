import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';

const BulkOrderInquiry = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    customerName: user?.name || '',
    contactNumber: user?.phone || '',
    email: user?.email || '',
    eventType: 'Birthday',
    eventDate: '',
    requiredItems: '',
    estimatedBudget: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.contactNumber || !form.eventDate || !form.requiredItems) {
      error('Please complete all mandatory fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/bulk-orders', form);
      if (res.data.success) {
        success('Your celebration cake inquiry has been submitted! Our chef will call you.');
        setSubmitted(true);
      }
    } catch (err) {
      error(err.message || 'Could not submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
            {/* Header */}
            <div className="bg-bakery-dark text-white p-4 p-md-5 text-center position-relative">
              <span className="badge bg-bakery-gold text-dark px-3 py-2 rounded-pill small fw-bold mb-2">
                Custom Orders & Celebrations
              </span>
              <h2 className="display-6 font-serif fw-bold text-white mb-2">
                Custom Cake & Bulk Catering Inquiry
              </h2>
              <p className="text-light text-opacity-80 small mx-auto mb-0" style={{ maxWidth: '540px' }}>
                Planning a wedding, milestone birthday, or grand corporate gathering? Tell us your envisioned theme, guest count, and flavors.
              </p>
            </div>

            <div className="card-body p-4 p-md-5">
              {submitted ? (
                <div className="text-center py-4">
                  <div className="rounded-circle bg-success-subtle text-success p-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-check-circle-fill fs-1"></i>
                  </div>
                  <h4 className="fw-bold font-serif text-dark mb-2">Inquiry Successfully Received!</h4>
                  <p className="text-muted small mb-4">
                    Our Master Pastry Chef will review your requirements for the date{' '}
                    <strong>{form.eventDate}</strong> and reach out to you at{' '}
                    <strong>+91 {form.contactNumber}</strong> within 2 hours.
                  </p>
                  <button
                    type="button"
                    className="btn btn-bakery-accent text-white rounded-pill px-4"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        customerName: user?.name || '',
                        contactNumber: user?.phone || '',
                        email: user?.email || '',
                        eventType: 'Birthday',
                        eventDate: '',
                        requiredItems: '',
                        estimatedBudget: '',
                        notes: ''
                      });
                    }}
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Your Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Anand & Divya"
                        value={form.customerName}
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Contact Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        required
                        placeholder="10-digit mobile number"
                        value={form.contactNumber}
                        onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="name@company.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Celebration / Event Type *</label>
                      <select
                        className="form-select"
                        value={form.eventType}
                        onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                      >
                        <option value="Birthday">Birthday Celebration</option>
                        <option value="Wedding">Wedding / Reception</option>
                        <option value="Corporate">Corporate Event / High Tea</option>
                        <option value="Anniversary">Anniversary</option>
                        <option value="Party">Cocktail / House Party</option>
                        <option value="Other">Other Occasion</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Event Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={form.eventDate}
                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Estimated Budget (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 5000"
                        value={form.estimatedBudget}
                        onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        Detailed Description of Cake & Items Needed *
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="e.g. 3 Tier Belgium chocolate truffle wedding cake (approx 5kg) with lavender flower theme, plus 50 boxed vanilla cream cupcakes for guests."
                        value={form.requiredItems}
                        onChange={(e) => setForm({ ...form, requiredItems: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Additional Special Requests / Delivery Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g. Eggless sponge required, delivery to ITC Gardenia at 4 PM"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="submit"
                      className="btn btn-bakery-accent w-100 rounded-pill py-3 text-white fw-bold shadow-sm"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting Inquiry...' : 'Submit Custom Cake Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderInquiry;
