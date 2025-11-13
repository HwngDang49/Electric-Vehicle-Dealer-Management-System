import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/AuthService";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email validation
  const validateEmail = (email) => {
    if (!email) {
      return "Email is required";
    }
    // Check for whitespace
    if (email !== email.trim()) {
      return "Email cannot contain leading or trailing spaces";
    }
    if (/\s/.test(email)) {
      return "Email cannot contain spaces";
    }

    // Enhanced email format validation
    // Basic structure: local@domain
    if (!email.includes("@")) {
      return "Email must contain @ symbol";
    }

    const parts = email.split("@");
    if (parts.length !== 2) {
      return "Email must contain exactly one @ symbol";
    }

    const [localPart, domainPart] = parts;

    // Validate local part (before @)
    if (!localPart || localPart.length === 0) {
      return "Email must have a local part before @";
    }
    if (localPart.length > 64) {
      return "Email local part is too long (max 64 characters)";
    }
    if (!/^[a-zA-Z0-9._+-]+$/.test(localPart)) {
      return "Email local part contains invalid characters";
    }
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      return "Email local part cannot start or end with a dot";
    }
    if (localPart.includes("..")) {
      return "Email local part cannot contain consecutive dots";
    }

    // Validate domain part (after @)
    if (!domainPart || domainPart.length === 0) {
      return "Email must have a domain part after @";
    }
    if (!domainPart.includes(".")) {
      return "Email domain must contain at least one dot (e.g., example.com)";
    }

    const domainParts = domainPart.split(".");
    if (domainParts.length < 2) {
      return "Email domain must have at least a domain and TLD (e.g., example.com)";
    }

    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return "Email must have a valid top-level domain (e.g., .com, .org)";
    }
    if (!/^[a-zA-Z]+$/.test(tld)) {
      return "Email top-level domain must contain only letters";
    }

    // Final comprehensive regex check
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address (e.g., user@example.com)";
    }

    return "";
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    // Check for whitespace
    if (password !== password.trim()) {
      return "Password cannot contain leading or trailing spaces";
    }
    if (/\s/.test(password)) {
      return "Password cannot contain spaces";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear general error when user types
    if (error) setError("");

    // Real-time validation (validate immediately when field is touched)
    if (touched[name]) {
      let errorMessage = "";
      if (name === "email") {
        errorMessage = validateEmail(value);
      } else if (name === "password") {
        errorMessage = validatePassword(value);
      }

      setFieldErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate on blur (don't trim, just validate)
    let errorMessage = "";
    if (name === "email") {
      errorMessage = validateEmail(value);
    } else if (name === "password") {
      errorMessage = validatePassword(value);
    }

    setFieldErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // Validate all fields (without trimming - check for spaces)
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setFieldErrors({
      email: emailError,
      password: passwordError,
    });

    // If there are validation errors, don't submit
    if (emailError || passwordError) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Trim before sending to API (but validation already checked for spaces)
      const trimmedEmail = formData.email.trim();
      const trimmedPassword = formData.password.trim();

      const { role } = await authService.login(trimmedEmail, trimmedPassword);

      // Redirect based on role
      switch (role) {
        case "DealerStaff":
          navigate("/dealerStaff");
          break;
        case "DealerManager":
          navigate("/dealerManager");
          break;
        case "EVMStaff":
          navigate("/evmStaff");
          break;
        case "Admin":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      // Handle different error types
      const errorMessage =
        err.message || "Login failed. Please check your credentials.";

      // Check if error is about email not existing
      const lowerErrorMessage = errorMessage.toLowerCase();

      if (
        lowerErrorMessage.includes("email does not exist") ||
        lowerErrorMessage.includes("user not found") ||
        lowerErrorMessage.includes("email not found") ||
        lowerErrorMessage.includes("account does not exist")
      ) {
        // Email doesn't exist - show error on email field
        setTouched({
          email: true,
          password: true,
        });
        setFieldErrors({
          email: "This email address is not registered in the system.",
          password: "",
        });
        setError("");
      } else if (
        lowerErrorMessage.includes("password") &&
        (lowerErrorMessage.includes("incorrect") ||
          lowerErrorMessage.includes("wrong") ||
          lowerErrorMessage.includes("invalid"))
      ) {
        // Password is incorrect - show error on password field
        setTouched({
          email: true,
          password: true,
        });
        setFieldErrors({
          email: "",
          password: "Incorrect password. Please try again.",
        });
        setError("");
      } else if (
        lowerErrorMessage.includes("not active") ||
        lowerErrorMessage.includes("inactive") ||
        lowerErrorMessage.includes("suspended")
      ) {
        // Account is not active
        setError(errorMessage);
        setFieldErrors({
          email: "",
          password: "",
        });
      } else {
        // Other errors - show general error
        setError(errorMessage);
        setFieldErrors({
          email: "",
          password: "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password logic
  };

  return (
    <div className="login-container">
      {/* Welcome Section - Outside Form */}
      <div className="welcome-header">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-lightning">
              <svg
                className="lightning-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <p className="brand-subtitle">
          Electric Vehicle Dealer Management System
        </p>
        <div className="brand-description">
          <p>Truy cập nhanh các nghiệp vụ bán hàng và quản lý đại lý</p>
          <p>hàng hàng ngày.</p>
        </div>
      </div>

      {/* Login Form */}
      <div className="login-card">
        <div className="login-form-section">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="error-message">
                <svg
                  className="error-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8v4M12 16h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="22,6 12,13 2,6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  disabled={loading}
                  className={`form-input ${
                    fieldErrors.email ? "input-error" : ""
                  }`}
                />
              </div>
              {touched.email && fieldErrors.email && (
                <div className="field-error">
                  <svg
                    className="error-icon-small"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{fieldErrors.email}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  disabled={loading}
                  className={`form-input ${
                    fieldErrors.password ? "input-error" : ""
                  }`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="eye-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="1"
                        y1="1"
                        x2="23"
                        y2="23"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="eye-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <div className="field-error">
                  <svg
                    className="error-icon-small"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            <div className="forgot-password">
              <button
                type="button"
                className="forgot-password-btn"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <svg
                    className="spinner"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="32"
                      strokeDashoffset="32"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        dur="2s"
                        values="0 32;16 16;0 32;0 32"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dashoffset"
                        dur="2s"
                        values="0;-16;-32;-32"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <svg
                    className="arrow-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
