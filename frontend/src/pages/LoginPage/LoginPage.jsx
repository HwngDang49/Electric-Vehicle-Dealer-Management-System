import React, { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", formData);
    // Xử lý logic đăng nhập ở đây
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // Xử lý logic quên mật khẩu ở đây
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
              <div className="form-group">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
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
                />
              </div>

              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="login-btn">
                Log In
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
