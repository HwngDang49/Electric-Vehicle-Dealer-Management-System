import React, { useEffect } from "react";
import "./Toast.css";

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.autoClose !== false) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "ℹ";
    }
  };

  const getTitle = () => {
    switch (toast.type) {
      case "success":
        return "Thành công";
      case "error":
        return "Lỗi";
      case "warning":
        return "Cảnh báo";
      case "info":
        return "Thông tin";
      default:
        return "Thông báo";
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon-wrapper">
        <span className={`toast-icon toast-icon-${toast.type}`}>
          {getIcon()}
        </span>
      </div>
      <div className="toast-content">
        <div className="toast-title">{toast.title || getTitle()}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default Toast;
