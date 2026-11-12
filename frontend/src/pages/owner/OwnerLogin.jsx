import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import '../../styles/Forms.css';
import '../../styles/AdminDashboard.css';

const OwnerLogin = () => {
  // Main Tab: 'signin' | 'signup'
  const [mainTab, setMainTab] = useState('signin');

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('9042487448');
  const [loginPassword, setLoginPassword] = useState('deepadhiya');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign In sub-mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState('password');
  const [otpPhone, setOtpPhone] = useState('9042487448');
  const [otpStep, setOtpStep] = useState(1); // 1 = send, 2 = verify
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  // Sign Up Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regShopName, setRegShopName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const { ownerLogin, ownerRegister, sendOwnerOTP, verifyOwnerOTP } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/owner/dashboard';

  // Demo Credentials Auto-Fill
  const handleAutoFill = () => {
    setLoginIdentifier('9042487448');
    setLoginPassword('deepadhiya');
    info('Owner demo credentials filled: 9042487448 / deepadhiya');
  };

  // Sign In Submission (Password)
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    const cleanId = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanId) {
      error('Please enter your Mobile Number or Mail ID (மொபைல் எண் அல்லது மின்னஞ்சல் முகவரி உள்ளிடவும்)');
      return;
    }

    if (!cleanPass) {
      error('Please enter your password (கடவுச்சொல்லை உள்ளிடவும்)');
      return;
    }

    try {
      setLoading(true);
      const isEmail = cleanId.includes('@');
      const user = await ownerLogin({
        identifier: cleanId,
        phone: !isEmail ? cleanId.replace(/\D/g, '') : undefined,
        email: isEmail ? cleanId.toLowerCase() : undefined,
        password: cleanPass
      });

      success(`Welcome back, ${user.name || 'Owner'}! Opening Bakery Management Portal...`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Owner authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Sign In OTP Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const cleanPhone = otpPhone.replace(/\D/g, '').trim();

    if (cleanPhone.length !== 10) {
      error('Please enter a valid 10-digit mobile number to receive OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOwnerOTP(cleanPhone);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      success(res.message || 'OTP sent successfully to registered phone!');
      setOtpStep(2);
    } catch (err) {
      error(err.message || 'Failed to send OTP. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  // Sign In OTP Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      error('Please enter the 6-digit OTP received');
      return;
    }

    try {
      setLoading(true);
      const user = await verifyOwnerOTP(otpPhone.trim(), '', otp.trim());
      success(`Welcome back, ${user.name || 'Owner'}! Signed in successfully.`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Submission (New Owner Registration)
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    const cleanName = regName.trim();
    const cleanPhone = regPhone.replace(/\D/g, '').trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanShop = regShopName.trim();
    const cleanPassword = regPassword.trim();
    const cleanConfirmPassword = regConfirmPassword.trim();

    if (!cleanName) {
      error('Please enter your full name (உரிமையாளர் பெயர் உள்ளிடவும்)');
      return;
    }

    if (cleanPhone.length !== 10) {
      error('Please enter a valid 10-digit mobile number (10 இலக்க மொபைல் எண் உள்ளிடவும்)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      error('Please enter a valid email address (சரியான மின்னஞ்சல் முகவரி உள்ளிடவும்)');
      return;
    }

    if (cleanPassword.length < 6) {
      error('Password must be at least 6 characters long (கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துக்கள் இருக்க வேண்டும்)');
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      error('Passwords do not match! (கடவுச்சொற்கள் பொருந்தவில்லை)');
      return;
    }

    try {
      setLoading(true);
      const user = await ownerRegister({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        shopName: cleanShop || `${cleanName}'s Bakery & Patisserie`,
        password: cleanPassword
      });

      success(`Congratulations ${user.name || cleanName}! Your bakery store has been registered and opened.`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Registration failed. An account with this phone or email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="owner-login-page">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-7 col-xl-5">
            <div className="card owner-login-card border-0 shadow-lg rounded-4 overflow-hidden">
              
              {/* Header */}
              <div className="owner-login-header p-4 text-center position-relative">
                <div className="owner-brand-icon mx-auto shadow mb-3">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h4 className="fw-bold font-serif mb-1">Owner & Admin Portal</h4>
                <p className="small mb-0">
                  {mainTab === 'signin'
                    ? 'SweetDelight Bakery & Patisserie Management System'
                    : 'Register as a Store Owner & Manage Your Bakery Online'}
                </p>
              </div>

              <div className="card-body p-4 p-md-4">
                
                {/* Primary Tab Switcher (Sign In vs Sign Up) */}
                <div className="nav nav-pills nav-fill owner-auth-main-tabs mb-4">
                  <button
                    type="button"
                    className={`nav-link ${mainTab === 'signin' ? 'active' : ''}`}
                    onClick={() => setMainTab('signin')}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In (உள்நுழைவு)
                  </button>
                  <button
                    type="button"
                    className={`nav-link ${mainTab === 'signup' ? 'active' : ''}`}
                    onClick={() => setMainTab('signup')}
                  >
                    <i className="bi bi-person-plus-fill me-1"></i> Sign Up (புதிய பதிவு)
                  </button>
                </div>

                {/* ============================================================== */}
                {/* TAB 1: SIGN IN                                                  */}
                {/* ============================================================== */}
                {mainTab === 'signin' && (
                  <div>
                    {/* Demo Credentials Quick-Fill box */}
                    <div className="alert alert-credentials p-3 small rounded-3 mb-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold d-flex align-items-center gap-1">
                          <i className="bi bi-person-badge-fill text-bakery-accent"></i> Demo Credentials:
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline-bakery btn-xs rounded-pill py-0 px-2 fw-semibold"
                          style={{ fontSize: '0.75rem' }}
                          onClick={handleAutoFill}
                        >
                          <i className="bi bi-lightning-charge-fill me-1"></i> Auto-Fill
                        </button>
                      </div>
                      <div style={{ fontSize: '0.82rem', lineHeight: '1.6' }}>
                        <div><strong>Phone:</strong> <code>9042487448</code></div>
                        <div><strong>Email:</strong> <code>owner@bakery.com</code></div>
                        <div><strong>Password:</strong> <code>deepadhiya</code></div>
                      </div>
                    </div>

                    {/* Sub-mode: Password vs Instant OTP */}
                    <div className="owner-mode-switch nav nav-pills nav-fill p-1 rounded-pill mb-4">
                      <button
                        type="button"
                        className={`nav-link rounded-pill py-2 fw-semibold ${
                          authMode === 'password' ? 'active' : ''
                        }`}
                        onClick={() => setAuthMode('password')}
                      >
                        <i className="bi bi-key-fill me-1"></i> Password Sign In
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

                    {/* Sub-tab 1: Password Sign In */}
                    {authMode === 'password' && (
                      <form onSubmit={handleSignInSubmit}>
                        {/* Mobile Number or Email ID */}
                        <div className="mb-3">
                          <label className="form-label small fw-bold mb-1">
                            Mobile Number or Mail ID (தொலைபேசி எண் / மின்னஞ்சல்) <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text border-end-0">
                              <i className="bi bi-person-fill"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0"
                              placeholder="10-digit Phone or email (e.g. 9042487448)"
                              value={loginIdentifier}
                              onChange={(e) => setLoginIdentifier(e.target.value)}
                              required
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                          <label className="form-label small fw-bold mb-1">
                            Password (கடவுச்சொல்) <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text border-end-0">
                              <i className="bi bi-lock-fill"></i>
                            </span>
                            <input
                              type={showLoginPassword ? 'text' : 'password'}
                              className="form-control border-start-0 border-end-0"
                              placeholder="Enter owner password (e.g. deepadhiya)"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="input-group-text password-toggle-btn border-start-0"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              title={showLoginPassword ? 'Hide password' : 'Show password'}
                              tabIndex="-1"
                            >
                              <i className={`bi ${showLoginPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                            </button>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="btn btn-bakery-accent w-100 rounded-pill py-2 fw-bold shadow-sm mb-3"
                          disabled={loading || !loginIdentifier.trim() || !loginPassword.trim()}
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

                    {/* Sub-tab 2: OTP Sign In */}
                    {authMode === 'otp' && (
                      <div>
                        {otpStep === 1 ? (
                          <form onSubmit={handleSendOTP}>
                            <div className="mb-4">
                              <label className="form-label small fw-bold mb-1">
                                Registered Mobile Number (தொலைபேசி எண்) <span className="text-danger">*</span>
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
                                  value={otpPhone}
                                  onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                                  required
                                  autoFocus
                                />
                              </div>
                              <div className="form-text small mt-1">
                                An OTP will be sent to this number for quick verification.
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="btn btn-bakery-accent w-100 rounded-pill py-2 fw-bold shadow-sm mb-3"
                              disabled={loading || otpPhone.trim().length !== 10}
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
                                Phone: +91 {otpPhone}
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
                              className="btn btn-bakery-accent w-100 rounded-pill py-2 fw-bold shadow-sm mb-3"
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

                    {/* Switch to Sign Up Prompt */}
                    <div className="text-center mt-3 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                        Don't have an owner account yet?{' '}
                        <button
                          type="button"
                          className="owner-switch-link fw-bold"
                          onClick={() => setMainTab('signup')}
                        >
                          Sign Up / Register Here (புதிய பதிவு)
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* TAB 2: SIGN UP (NEW OWNER REGISTRATION)                         */}
                {/* ============================================================== */}
                {mainTab === 'signup' && (
                  <form onSubmit={handleSignUpSubmit}>
                    
                    {/* Owner Full Name */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold mb-1">
                        Owner Full Name (உரிமையாளர் பெயர்) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <i className="bi bi-person-badge-fill"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="e.g. Deeparasi / John Doe"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Mobile Number (+91) */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold mb-1">
                        Mobile Number (மொபைல் எண்) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <i className="bi bi-telephone-fill me-1"></i>
                          <small className="opacity-75">+91</small>
                        </span>
                        <input
                          type="tel"
                          className="form-control border-start-0"
                          placeholder="10-digit number (e.g. 9876543210)"
                          maxLength="10"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                      </div>
                    </div>

                    {/* Email ID */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold mb-1">
                        Email Address (மின்னஞ்சல் முகவரி) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <i className="bi bi-envelope-at-fill"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0"
                          placeholder="e.g. owner@bakery.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Bakery / Shop Name (Optional) */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold mb-1">
                        Bakery / Shop Name (பேக்கரி கடை பெயர்)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <i className="bi bi-shop"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="e.g. SweetDelight Bakery & Patisserie"
                          value={regShopName}
                          onChange={(e) => setRegShopName(e.target.value)}
                        />
                      </div>
                      <div className="form-text small mt-1">
                        Defaults to &ldquo;Your Name&apos;s Bakery&rdquo; if left blank.
                      </div>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold mb-1">
                        New Password (புதிய கடவுச்சொல்) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          className="form-control border-start-0 border-end-0"
                          placeholder="Minimum 6 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          minLength="6"
                        />
                        <button
                          type="button"
                          className="input-group-text password-toggle-btn border-start-0"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          title={showRegPassword ? 'Hide password' : 'Show password'}
                          tabIndex="-1"
                        >
                          <i className={`bi ${showRegPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-bold mb-0">
                          Confirm Password (கடவுச்சொல்லை உறுதிசெய்க) <span className="text-danger">*</span>
                        </label>
                        {regConfirmPassword && (
                          <span
                            className={`password-match-badge fw-semibold ${
                              regPassword === regConfirmPassword ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {regPassword === regConfirmPassword ? (
                              <span><i className="bi bi-check-circle-fill me-1"></i> Passwords match</span>
                            ) : (
                              <span><i className="bi bi-x-circle-fill me-1"></i> Passwords don&apos;t match</span>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <i className="bi bi-shield-check"></i>
                        </span>
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          className="form-control border-start-0 border-end-0"
                          placeholder="Re-enter password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="input-group-text password-toggle-btn border-start-0"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                          tabIndex="-1"
                        >
                          <i className={`bi ${showRegConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-bakery-accent w-100 rounded-pill py-2 fw-bold shadow-sm mb-3"
                      disabled={
                        loading ||
                        !regName.trim() ||
                        regPhone.trim().length !== 10 ||
                        !regEmail.trim() ||
                        regPassword.length < 6 ||
                        regPassword !== regConfirmPassword
                      }
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Registering & Opening Dashboard...
                        </span>
                      ) : (
                        <span>
                          <i className="bi bi-person-check-fill me-2"></i> Create Store & Open Dashboard
                        </span>
                      )}
                    </button>

                    {/* Switch to Sign In Prompt */}
                    <div className="text-center mt-3 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                        Already have an owner account?{' '}
                        <button
                          type="button"
                          className="owner-switch-link fw-bold"
                          onClick={() => setMainTab('signin')}
                        >
                          Sign In Here (உள்நுழையவும்)
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {/* Back to Customer Storefront */}
                <div className="text-center pt-3">
                  <Link
                    to="/"
                    className="small text-decoration-none d-inline-flex align-items-center gap-1"
                    style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
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
