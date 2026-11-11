import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import '../../styles/Forms.css';
import '../../styles/AdminDashboard.css';

const OwnerLogin = () => {
  // Login form state - dedicated Phone, Email, Password
  const [phone, setPhone] = useState('9042487448');
  const [email, setEmail] = useState('owner@bakery.com');
  const [password, setPassword] = useState('deepadhiya');
  const [showPassword, setShowPassword] = useState(false);

  // Auth mode: 'password' or 'otp'
  const [authMode, setAuthMode] = useState('password');
  const [otpStep, setOtpStep] = useState(1); // 1 = request, 2 = verify
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [loading, setLoading] = useState(false);

  const { ownerLogin, sendOwnerOTP, verifyOwnerOTP } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/owner/dashboard';

  // Quick auto-fill handler for owner credentials
  const handleAutoFill = () => {
    setPhone('9042487448');
    setEmail('owner@bakery.com');
    setPassword('deepadhiya');
    info('Owner demo credentials auto-filled!');
  };

  // Submit Password-based login (Phone + Email + Password)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanPhone && !cleanEmail) {
      error('Please enter either your Phone Number or Mail ID (தொலைபேசி எண் அல்லது மின்னஞ்சல் முகவரி உள்ளிடவும்)');
      return;
    }

    if (!cleanPassword) {
      error('Please enter your password (கடவுச்சொல்லை உள்ளிடவும்)');
      return;
    }

    try {
      setLoading(true);
      const user = await ownerLogin({
        phone: cleanPhone || undefined,
        email: cleanEmail || undefined,
        identifier: cleanPhone || cleanEmail,
        password: cleanPassword
      });

      success(`Welcome back, ${user.name || 'Owner'}! Opening Bakery Management Portal...`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Owner authentication failed. Please check your Phone / Mail ID and Password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to Owner's Phone/Email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanPhone && !cleanEmail) {
      error('Please enter your registered Phone Number or Mail ID to receive OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOwnerOTP(cleanPhone, cleanEmail);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      success(res.message || 'OTP sent successfully to registered phone!');
      setOtpStep(2);
    } catch (err) {
      error(err.message || 'Failed to send OTP. Please check your Phone Number / Mail ID.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      error('Please enter the 6-digit OTP received');
      return;
    }

    try {
      setLoading(true);
      const user = await verifyOwnerOTP(phone.trim(), email.trim(), otp.trim());
      success(`Welcome back, ${user.name || 'Owner'}! Signed in successfully.`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="owner-login-page">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div className="card owner-login-card border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Header */}
              <div className="owner-login-header p-4 text-center position-relative">
                <div className="owner-brand-icon mx-auto shadow">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h4 className="fw-bold font-serif mb-1">Owner & Admin Portal</h4>
                <p className="small mb-0">
                  SweetDelight Bakery & Patisserie Management System
                </p>
              </div>

              <div className="card-body p-4 p-md-4">
                {/* Credentials Quick-Fill helper badge */}
                <div className="alert alert-credentials border p-3 small rounded-3 mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold text-bakery-gold d-flex align-items-center gap-1">
                      <i className="bi bi-person-badge-fill"></i> Demo Credentials:
                    </span>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-bakery rounded-pill py-0 px-2 fw-semibold"
                      style={{ fontSize: '0.75rem' }}
                      onClick={handleAutoFill}
                    >
                      <i className="bi bi-lightning-charge-fill me-1"></i> Auto-Fill
                    </button>
                  </div>
                  <div style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    <div><strong>Phone:</strong> <code>9042487448</code></div>
                    <div><strong>Mail ID:</strong> <code>owner@bakery.com</code></div>
                    <div><strong>Password:</strong> <code>deepadhiya</code></div>
                  </div>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="owner-mode-switch nav nav-pills nav-fill p-1 rounded-pill mb-4">
                  <button
                    type="button"
                    className={`nav-link rounded-pill py-2 fw-semibold ${
                      authMode === 'password' ? 'active' : ''
                    }`}
                    onClick={() => setAuthMode('password')}
                  >
                    <i className="bi bi-key-fill me-1"></i> Password Login
                  </button>
                  <button
                    type="button"
                    className={`nav-link rounded-pill py-2 fw-semibold ${
                      authMode === 'otp' ? 'active' : ''
                    }`}
                    onClick={() => {
                      setAuthMode('otp');
                      setOtpStep(1);
                    }}
                  >
                    <i className="bi bi-phone-vibrate-fill me-1"></i> Instant OTP
                  </button>
                </div>

                {/* MODE 1: PASSWORD LOGIN */}
                {authMode === 'password' && (
                  <form onSubmit={handlePasswordSubmit}>
                    {/* Phone Number Field */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold mb-1">
                        Phone Number (தொலைபேசி எண்) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <i className="bi bi-telephone-fill me-1"></i>
                          <small className="opacity-75">+91</small>
                        </span>
                        <input
                          type="tel"
                          className="form-control border-start-0"
                          placeholder="10-digit number (e.g. 9042487448)"
                          maxLength="10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          required={!email}
                        />
                      </div>
                    </div>

                    {/* Mail ID Field */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold mb-1">
                        Mail ID (மின்னஞ்சல் முகவரி) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <i className="bi bi-envelope-at-fill"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0"
                          placeholder="e.g. owner@bakery.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required={!phone}
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-bold mb-0">
                          Password (கடவுச்சொல்) <span className="text-danger">*</span>
                        </label>
                      </div>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control border-start-0 border-end-0"
                          placeholder="Enter password (e.g. deepadhiya)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="input-group-text password-toggle-btn border-start-0"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Hide password' : 'Show password'}
                          tabIndex="-1"
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-bakery-accent w-100 rounded-pill py-2 text-white fw-bold shadow-sm mb-3"
                      disabled={loading || (!phone && !email) || !password}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Signing In...
                        </span>
                      ) : (
                        <span>
                          <i className="bi bi-box-arrow-in-right me-2"></i> Sign In to Owner Dashboard
                        </span>
                      )}
                    </button>
                  </form>
                )}

                {/* MODE 2: OTP LOGIN */}
                {authMode === 'otp' && (
                  <div>
                    {otpStep === 1 ? (
                      <form onSubmit={handleSendOTP}>
                        {/* Phone Number Field */}
                        <div className="mb-3">
                          <label className="form-label small fw-bold mb-1">
                            Phone Number (தொலைபேசி எண்) <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text border-end-0">
                              <i className="bi bi-telephone-fill me-1"></i>
                              <small className="opacity-75">+91</small>
                            </span>
                            <input
                              type="tel"
                              className="form-control border-start-0"
                              placeholder="10-digit number (e.g. 9042487448)"
                              maxLength="10"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                              required
                            />
                          </div>
                        </div>

                        {/* Mail ID Field */}
                        <div className="mb-4">
                          <label className="form-label small fw-bold mb-1">
                            Mail ID (மின்னஞ்சல் முகவரி)
                          </label>
                          <div className="input-group">
                            <span className="input-group-text border-end-0">
                              <i className="bi bi-envelope-at-fill"></i>
                            </span>
                            <input
                              type="email"
                              className="form-control border-start-0"
                              placeholder="e.g. owner@bakery.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          <div className="form-text small" style={{ color: 'var(--text-secondary)' }}>
                            An OTP will be sent for instant passwordless owner verification.
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-bakery-accent w-100 rounded-pill py-2 text-white fw-bold shadow-sm mb-3"
                          disabled={loading || (!phone && !email)}
                        >
                          {loading ? (
                            <span>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Sending OTP...
                            </span>
                          ) : (
                            <span>
                              <i className="bi bi-send-fill me-2"></i> Send Owner Verification OTP
                            </span>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOTP}>
                        <div className="text-center mb-3">
                          <span className="badge owner-otp-badge border px-3 py-2 rounded-pill small">
                            Owner Phone: +91 {phone}
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-bakery-accent p-0 ms-2 text-decoration-none fw-bold"
                              onClick={() => setOtpStep(1)}
                            >
                              Change
                            </button>
                          </span>
                        </div>

                        {devOtpHint && (
                          <div className="alert alert-warning py-2 px-3 small d-flex align-items-center justify-content-between mb-3 rounded-3">
                            <div>
                              <strong>Dev Mock OTP:</strong> <code className="fs-6 fw-bold ms-1">{devOtpHint}</code>
                            </div>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline-dark btn-sm rounded-pill"
                              onClick={() => setOtp(devOtpHint)}
                            >
                              Auto-Fill
                            </button>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="form-label fw-bold small text-center w-100 mb-2">
                            Enter 6-Digit OTP (OTP குறியீடு உள்ளிடவும்) <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg text-center tracking-widest fw-bold owner-otp-input"
                            placeholder="• • • • • •"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            required
                            autoFocus
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn btn-bakery-accent w-100 rounded-pill py-2 text-white fw-bold shadow-sm mb-3"
                          disabled={loading || otp.length < 4}
                        >
                          {loading ? (
                            <span>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Verifying...
                            </span>
                          ) : (
                            <span>
                              <i className="bi bi-check2-circle me-2"></i> Verify OTP & Open Dashboard
                            </span>
                          )}
                        </button>

                        <div className="text-center">
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-decoration-none"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={handleSendOTP}
                            disabled={loading}
                          >
                            Didn't receive code? <span className="text-bakery-accent fw-bold">Resend OTP</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Navigation link */}
                <div className="text-center pt-2">
                  <Link
                    to="/"
                    className="small text-decoration-none d-inline-flex align-items-center gap-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <i className="bi bi-arrow-left"></i> Return to Customer Storefront
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
