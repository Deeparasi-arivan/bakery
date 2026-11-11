import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';

const ExpenseManagement = () => {
  const { success, error } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    category: 'Ingredients',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const categories = [
    'Ingredients',
    'Packaging',
    'Utilities',
    'Rent',
    'Equipment',
    'Salaries',
    'Marketing',
    'Maintenance',
    'Other'
  ];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const res = await api.get(`/expenses?${params.toString()}`);
      if (res.data.success) {
        setExpenses(res.data.expenses);
        setTotalExpenseAmount(res.data.totalExpenseAmount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setForm({
      category: 'Ingredients',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setForm({
      category: exp.category,
      amount: exp.amount,
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
      description: exp.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) {
      error('Category and amount are required');
      return;
    }

    try {
      setSaving(true);
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, form);
        success('Expense updated successfully');
      } else {
        await api.post('/expenses', form);
        success('New expense recorded');
      }
      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      error(err.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/expenses/${deleteConfirmId}`);
      success('Expense deleted successfully');
      setDeleteConfirmId(null);
      fetchExpenses();
    } catch (err) {
      error(err.message || 'Could not delete expense');
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold font-serif text-bakery-accent mb-1">Bakery Expense Management</h3>
          <p className="text-muted small mb-0">Record and track ingredient raw materials, utility bills, packaging, and commercial equipment overheads.</p>
        </div>
        <button
          type="button"
          className="btn btn-bakery-accent text-white rounded-pill px-4 shadow-sm fw-semibold"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-circle-fill me-2"></i> Record New Expense
        </button>
      </div>

      {/* Summary card & Filter toolbar */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-4 border-danger h-100">
            <span className="small text-muted fw-bold text-uppercase d-block mb-1">Total Operating Expenses</span>
            <h3 className="fw-bold text-danger mb-0">{formatCurrency(totalExpenseAmount)}</h3>
            <small className="text-muted mt-2 d-block">Cumulative bakery overheads</small>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 d-flex justify-content-center">
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
              <div>
                <strong className="d-block text-cream">Filter By Cost Category</strong>
                <small className="text-muted">Analyze where bakery budget is allocated</small>
              </div>
              <select
                className="form-select"
                style={{ maxWidth: '240px' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Expense Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List Table */}
      {loading ? (
        <LoadingSpinner message="Auditing bakery expense ledgers..." />
      ) : expenses.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-wallet2 fs-1 text-muted mb-2"></i>
          <h5 className="fw-bold font-serif text-dark">No Expenses Recorded</h5>
          <p className="text-muted small mb-3">No expenses logged for the chosen category.</p>
          <div>
            <button
              type="button"
              className="btn btn-outline-bakery btn-sm rounded-pill px-3"
              onClick={handleOpenAdd}
            >
              Add Expense Now
            </button>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Date</th>
                  <th scope="col" className="py-3">Expense Category</th>
                  <th scope="col" className="py-3">Description</th>
                  <th scope="col" className="py-3">Amount</th>
                  <th scope="col" className="py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td className="ps-4 py-3 small text-muted">
                      {formatDate(exp.date)}
                    </td>
                    <td>
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1 small">
                        {exp.category}
                      </span>
                    </td>
                    <td className="small text-dark">
                      {exp.description || 'Bakery general expense'}
                    </td>
                    <td className="fw-bold text-danger fs-6">
                      -{formatCurrency(exp.amount)}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-circle p-2"
                          onClick={() => handleOpenEdit(exp)}
                          title="Edit Expense"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-circle p-2"
                          onClick={() => setDeleteConfirmId(exp._id)}
                          title="Delete Expense"
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

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-bakery-accent text-white">
                <h5 className="modal-title font-serif fw-bold text-white">
                  {editingExpense ? 'Edit Expense' : 'Record Bakery Expense'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Expense Category *</label>
                    <select
                      className="form-select"
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      min="1"
                      placeholder="e.g. 2500"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Expense Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description / Vendor Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Purchased 20kg Belgian Dark Chocolate from supplier"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    ></textarea>
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
                    {saving ? 'Saving...' : editingExpense ? 'Update Expense' : 'Record Expense'}
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
        title="Delete Expense"
        message="Are you sure you want to delete this expense record from the bakery accounts?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default ExpenseManagement;
