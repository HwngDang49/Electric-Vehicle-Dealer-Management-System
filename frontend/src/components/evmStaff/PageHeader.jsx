import React from "react";
import "./PageHeader.css";

const PageHeader = ({
  title,
  subtitle,
  onBack,
  showBackButton = false,
  children,
}) => {
  return (
    <div className="evm-staff-page-header">
      <div className="page-header-left">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      <div className="page-header-right">
        {showBackButton && onBack && (
          <button className="page-header-back-btn" onClick={onBack}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Quay lại Dashboard
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
