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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { role } = await authService.login(
        formData.email,
        formData.password
      );

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // TODO: Implement forgot password logic
  };

  return (
    <div className="login-container">
      <div className="main-container">
        {/* Left Side - Login Form */}
        <div className="login-section">
          <div className="login-card">
            <div className="login-header">
              <h1>Login</h1>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#fee",
                    border: "1px solid #fcc",
                    borderRadius: "8px",
                    color: "#c33",
                    fontSize: "14px",
                    marginBottom: "20px",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  disabled={loading}
                />
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
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Welcome Section */}
        <div className="login-welcome-section">
          <div className="welcome-content">
            <div className="welcome-text">
              <p className="welcome-title">Welcome to,</p>
              <div className="brand-section">
                <div className="brand-logo">
                  <div className="logo-diamond">
                    <div className="logo-diamond-inner"></div>
                  </div>
                </div>
                <h2 className="brand-name">FVDMS</h2>
              </div>
              <p className="brand-subtitle">Dealer Staff Portal</p>
              <div className="brand-description">
                <p>Truy cập nhanh các nghiệp vụ bán hàng & chăm sóc khách</p>
                <p>hàng hàng ngày.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
