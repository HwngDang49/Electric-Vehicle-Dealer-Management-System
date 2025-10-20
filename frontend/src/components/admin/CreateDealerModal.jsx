import React, { useState } from "react";
import "./CreateDealerModal.css";
import dealerApiService from "../../services/dealerApi";

const CreateDealerModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    legalName: "",
    taxId: "",
    creditLimit: "",
    status: "Onboarding"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = "Mã dealer là bắt buộc";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên dealer là bắt buộc";
    }
    
    if (formData.creditLimit && isNaN(parseFloat(formData.creditLimit))) {
      newErrors.creditLimit = "Hạn mức tín dụng phải là số";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0
      };
      
      await dealerApiService.createDealer(submitData);
      onSuccess();
    } catch (error) {
      console.error("Error creating dealer:", error);
      setErrors({ submit: "Không thể tạo dealer. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tạo Dealer Mới</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="code">Mã Dealer *</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Nhập mã dealer"
              className={errors.code ? "error" : ""}
            />
            {errors.code && <span className="error-text">{errors.code}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name">Tên Dealer *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên dealer"
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="legalName">Tên Pháp Lý</label>
            <input
              type="text"
              id="legalName"
              name="legalName"
              value={formData.legalName}
              onChange={handleInputChange}
              placeholder="Nhập tên pháp lý"
            />
          </div>

          <div className="form-group">
            <label htmlFor="taxId">Mã Số Thuế</label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              placeholder="Nhập mã số thuế"
            />
          </div>

          <div className="form-group">
            <label htmlFor="creditLimit">Hạn Mức Tín Dụng (VND)</label>
            <input
              type="number"
              id="creditLimit"
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleInputChange}
              placeholder="Nhập hạn mức tín dụng"
              min="0"
              step="1000000"
              className={errors.creditLimit ? "error" : ""}
            />
            {errors.creditLimit && <span className="error-text">{errors.creditLimit}</span>}
          </div>

          {errors.submit && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {errors.submit}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Đang tạo..." : "Tạo Dealer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealerModal;
