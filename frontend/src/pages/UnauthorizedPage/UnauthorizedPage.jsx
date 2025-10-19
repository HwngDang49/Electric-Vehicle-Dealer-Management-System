import React from "react";
import { useNavigate } from "react-router-dom";
import "./UnauthorizedPage.css";

function UnauthorizedPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#ff6b6b"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M15 9l-6 6M9 9l6 6"
              stroke="#ff6b6b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="unauthorized-title">403 - Không có quyền truy cập</h1>

        <p className="unauthorized-message">
          Xin lỗi, bạn không có quyền truy cập vào trang này.
          <br />
          Vui lòng liên hệ quản trị viên để được cấp quyền phù hợp.
        </p>

        <div className="unauthorized-actions">
          <button className="btn-secondary" onClick={handleGoBack}>
            Quay lại
          </button>
          <button className="btn-primary" onClick={handleGoHome}>
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
