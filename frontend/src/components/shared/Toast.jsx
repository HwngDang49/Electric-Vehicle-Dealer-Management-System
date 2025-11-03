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

  const getIconSVG = () => {
    const iconProps = {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "3",
    };

    switch (toast.type) {
      case "success":
        return (
          <svg {...iconProps}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
      case "error":
        return (
          <svg {...iconProps}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        );
      case "warning":
        return (
          <svg {...iconProps}>
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "info":
        return (
          <svg {...iconProps}>
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
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
          <span className="toast-icon-text">{getIcon()}</span>
          {getIconSVG()}
        </span>
      </div>
      <div className="toast-content">
        <div className="toast-title">{toast.title || getTitle()}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Đóng">
        <span className="toast-close-text">✕</span>
        <svg
          className="toast-close-svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="toast-progress"></div>
    </div>
  );
};

export default Toast;
