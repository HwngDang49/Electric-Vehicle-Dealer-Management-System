import React, { useState, useEffect } from "react";
import "./CreateBranchModal.css";
import branchApiService from "../../services/branchApi";
import dealerApiService from "../../services/dealerApi";

const CreateBranchModal = ({ onClose, onSuccess, initialDealerId, lockDealer = false }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    status: "Active",
    dealerId: ""
  });
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadDealers();
  }, []);

  // Prefill dealer if provided from parent (e.g., from Dealer detail)
  useEffect(() => {
    if (initialDealerId) {
      setFormData(prev => ({ ...prev, dealerId: String(initialDealerId) }));
    }
  }, [initialDealerId]);

  const loadDealers = async () => {
    try {
      const response = await dealerApiService.getDealers();
      const fetchedDealers = response.data || response;
      setDealers(fetchedDealers || []);
    } catch (err) {
      console.error("Error loading dealers:", err);
      setError("Không thể tải danh sách dealer");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.code.trim()) {
      errors.code = "Mã chi nhánh là bắt buộc";
    } else if (formData.code.trim().length < 2) {
      errors.code = "Mã chi nhánh phải có ít nhất 2 ký tự";
    }
    
    if (!formData.name.trim()) {
      errors.name = "Tên chi nhánh là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Tên chi nhánh phải có ít nhất 2 ký tự";
    }
    
    if (!formData.dealerId) {
      errors.dealerId = "Vui lòng chọn dealer";
    }
    
    if (!formData.status) {
      errors.status = "Vui lòng chọn trạng thái";
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
      const branchData = {
        ...formData,
        dealerId: parseInt(formData.dealerId)
      };
      
      const response = await branchApiService.createBranch(branchData);
      console.log("Branch created successfully:", response);
      
      onSuccess();
    } catch (err) {
      console.error("Error creating branch:", err);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể tạo chi nhánh. Vui lòng thử lại.");
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
      <div className="create-branch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tạo Chi nhánh Mới</h2>
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
            <label htmlFor="code">Mã Chi nhánh *</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Nhập mã chi nhánh"
              className={validationErrors.code ? "error" : ""}
              disabled={loading}
            />
            {validationErrors.code && (
              <span className="error-text">{validationErrors.code}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Tên Chi nhánh *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên chi nhánh"
              className={validationErrors.name ? "error" : ""}
              disabled={loading}
            />
            {validationErrors.name && (
              <span className="error-text">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ chi nhánh"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dealerId">Dealer *</label>
            <select
              id="dealerId"
              name="dealerId"
              value={formData.dealerId}
              onChange={handleInputChange}
              className={validationErrors.dealerId ? "error" : ""}
              disabled={loading || lockDealer}
            >
              <option value="">Chọn dealer</option>
              {dealers.map((dealer) => (
                <option key={dealer.id || dealer.dealerId} value={dealer.id || dealer.dealerId}>
                  {dealer.name} ({dealer.code})
                </option>
              ))}
            </select>
            {validationErrors.dealerId && (
              <span className="error-text">{validationErrors.dealerId}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status">Trạng thái *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={validationErrors.status ? "error" : ""}
              disabled={loading}
            >
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Không hoạt động</option>
              <option value="Suspended">Tạm dừng</option>
              <option value="Closed">Đã đóng</option>
            </select>
            {validationErrors.status && (
              <span className="error-text">{validationErrors.status}</span>
            )}
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
                "Tạo Chi nhánh"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBranchModal;
