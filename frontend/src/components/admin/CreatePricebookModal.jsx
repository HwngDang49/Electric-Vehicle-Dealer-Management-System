import React, { useState, useEffect } from "react";
import "./CreateBranchModal.css";
import pricebookApiService from "../../services/pricebookApi";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "./CustomDropdown";

const CreatePricebookModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    dealerId: "",
    effectiveFrom: "",
    effectiveTo: "",
    status: "Active"
  });
  
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const statusOptions = [
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", icon: "⏸️" }
  ];

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    try {
      const response = await dealerApiService.getDealers();
      const fetchedDealers = response.data || response;
      setDealers(fetchedDealers || []);
    } catch (err) {
      console.error("Error loading dealers:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Tên bảng giá là bắt buộc";
    }
    
    if (!formData.effectiveFrom) {
      errors.effectiveFrom = "Ngày bắt đầu là bắt buộc";
    }
    
    if (formData.effectiveTo && formData.effectiveFrom >= formData.effectiveTo) {
      errors.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const pricebookData = {
        name: formData.name,
        dealerId: formData.dealerId ? parseInt(formData.dealerId) : null,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
        status: formData.status,
        pricebookItems: [] // Tạo rỗng, sẽ thêm items sau
      };
      
      
      const response = await pricebookApiService.createPricebook(pricebookData);
      
      
      onSuccess();
    } catch (err) {
      console.error("Error creating pricebook:", err);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Không thể tạo bảng giá. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="create-branch-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2>Tạo Bảng giá Mới</h2>
          <button className="close-btn" onClick={handleClose} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Tên Bảng giá *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên bảng giá"
              className={validationErrors.name ? "error" : ""}
              disabled={loading}
            />
            {validationErrors.name && (
              <span className="error-text">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dealerId">Dealer (Để trống cho Global)</label>
            <CustomDropdown
              value={formData.dealerId}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, dealerId: val }));
              }}
              options={[
                { value: "", label: "Global - Áp dụng cho tất cả dealer", icon: "🌐" },
                ...dealers.map(dealer => ({
                  value: String(dealer.id || dealer.dealerId),
                  label: `${dealer.name} (${dealer.code})`,
                  icon: "🏢"
                }))
              ]}
              minWidth="100%"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="effectiveFrom">Ngày bắt đầu *</label>
              <input
                type="date"
                id="effectiveFrom"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleInputChange}
                className={validationErrors.effectiveFrom ? "error" : ""}
                disabled={loading}
              />
              {validationErrors.effectiveFrom && (
                <span className="error-text">{validationErrors.effectiveFrom}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="effectiveTo">Ngày kết thúc</label>
              <input
                type="date"
                id="effectiveTo"
                name="effectiveTo"
                value={formData.effectiveTo}
                onChange={handleInputChange}
                className={validationErrors.effectiveTo ? "error" : ""}
                disabled={loading}
              />
              {validationErrors.effectiveTo && (
                <span className="error-text">{validationErrors.effectiveTo}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Trạng thái *</label>
            <CustomDropdown
              value={formData.status}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, status: val }));
              }}
              options={statusOptions}
              minWidth="100%"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Đang tạo...
                </>
              ) : (
                "Tạo Bảng giá"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePricebookModal;

