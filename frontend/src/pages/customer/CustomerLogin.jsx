import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import '../../styles/Forms.css';

const CustomerLogin = () => {
  // Mode: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState('signin');

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form State
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const { customerLogin, customerRegister } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Handle Sign In (Mobile number OR Email + Password)
  const handleSignIn = async (e) => {
    e.preventDefault();

    const identifier = loginIdentifier.trim();
    const password = loginPassword.trim();

    if (!identifier) {
      error('Please enter your Mobile Number or Email ID');
      return;
    }

    if (!password) {
      error('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      const user = await customerLogin(identifier, password);
      success(`Welcome back, ${user.name || 'Customer'}! Logged in successfully.`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up (Mobile number, Mail ID, New Password, Confirm Password)
  const handleSignUp = async (e) => {
    e.preventDefault();

    const name = signupName.trim();
    const phone = signupPhone.trim().replace(/\D/g, '');
    const email = signupEmail.trim().toLowerCase();
    const password = signupPassword;
    const confirmPassword = signupConfirmPassword;

    if (!phone || phone.length !== 10) {
      error('Please enter a valid 10-digit mobile number');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      error('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match. Please re-check Confirm Password.');
      return;
    }

    try {
      setLoading(true);
      const user = await customerRegister({
        name: name || 'Valued Customer',
        phone,
        email,
        password
      });

      success(`Account created successfully! Welcome to SweetDelight, ${user.name || ''}.`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Header */}
            <div className="bg-bakery-accent text-white p-4 text-center position-relative">
              <div
                className="rounded-circle bg-white p-3 mx-auto mb-2 d-inline-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '60px', height: '60px' }}
              >
                <i className="bi bi-cake2-fill text-bakery-accent fs-2"></i>
              </div>
              <h4 className="fw-bold font-serif mb-1 text-white">SweetDelight Patisserie</h4>
              <p className="small mb-0 text-white-50">
                {activeTab === 'signin'
                  ? 'Sign in to access your orders & checkout faster'
                  : 'Create a new account with your mobile & email'}
              </p>
            </div>

            {/* Tab Pill Switcher */}
            <div className="px-4 pt-4">
              <div
                className="nav nav-pills nav-fill p-1 rounded-pill"
                style={{ backgroundColor: 'var(--bg-secondary, #2a2421)' }}
              >
                <button
                  type="button"
                  className={`nav-link rounded-pill py-2 fw-semibold ${
                    activeTab === 'signin'
                      ? 'active bg-bakery-accent text-white shadow-sm'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('signin')}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                </button>
                <button
                  type="button"
                  className={`nav-link rounded-pill py-2 fw-semibold ${
                    activeTab === 'signup'
                      ? 'active bg-bakery-accent text-white shadow-sm'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('signup')}
                >
                  <i className="bi bi-person-plus-fill me-1"></i> Sign Up
                </button>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              {activeTab === 'signin' ? (
                /* ==================== SIGN IN TAB ==================== */
                <form onSubmit={handleSignIn}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Mobile Number or Email <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <i className="bi bi-person-badge"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="e.g. 9876543210 or name@gmail.com"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="form-text small" style={{ color: 'var(--text-secondary)' }}>
                      Existing users can enter registered Phone Number or Email ID.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold small">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        tabIndex="-1"
                        aria-label="Toggle password visibility"
                      >
                        <i className={`bi ${showLoginPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-bakery-accent w-100 rounded-pill py-2 text-white fw-semibold shadow-sm mb-3"
                    disabled={loading || !loginIdentifier || !loginPassword}
                  >
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Signing In...
                      </span>
                    ) : (
                      <span>
                        <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                      </span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-muted small">New customer? </span>
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-bakery-accent fw-bold text-decoration-none p-0"
                      onClick={() => setActiveTab('signup')}
                    >
                      Create an account (Sign Up)
                    </button>
                  </div>
                </form>
              ) : (
                /* ==================== SIGN UP TAB ==================== */
                <form onSubmit={handleSignUp}>
                  {/* Name (Optional) */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Full Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="e.g. Priya Ramesh"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0 fw-semibold">
                        <small className="opacity-75">+91</small>
                      </span>
                      <input
                        type="tel"
                        className="form-control border-start-0"
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                  </div>

                  {/* Email ID */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0"
                        placeholder="e.g. priya@gmail.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      New Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <i className="bi bi-key"></i>
                      </span>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0"
                        placeholder="Minimum 6 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        tabIndex="-1"
                        aria-label="Toggle password visibility"
                      >
                        <i className={`bi ${showSignupPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold small">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <i className="bi bi-shield-lock"></i>
                      </span>
                      <input
                        type={showSignupConfirmPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0"
                        placeholder="Re-enter password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                        tabIndex="-1"
                        aria-label="Toggle confirm password visibility"
                      >
                        <i className={`bi ${showSignupConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    {signupPassword && signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                      <div className="form-text text-danger small mt-1">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i> Passwords do not match
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-bakery-accent w-100 rounded-pill py-2 text-white fw-semibold shadow-sm mb-3"
                    disabled={
                      loading ||
                      signupPhone.length !== 10 ||
                      !signupEmail ||
                      signupPassword.length < 6 ||
                      signupPassword !== signupConfirmPassword
                    }
                  >
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </span>
                    ) : (
                      <span>
                        <i className="bi bi-person-check-fill me-2"></i> Create Account & Sign In
                      </span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-muted small">Already have an account? </span>
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-bakery-accent fw-bold text-decoration-none p-0"
                      onClick={() => setActiveTab('signin')}
                    >
                      Sign In here
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="card-footer bg-light border-0 py-3 text-center small">
              <span className="text-muted">Are you a store manager or owner? </span>
              <Link to="/owner/login" className="text-bakery-accent fw-bold text-decoration-none">
                Owner Login Here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
