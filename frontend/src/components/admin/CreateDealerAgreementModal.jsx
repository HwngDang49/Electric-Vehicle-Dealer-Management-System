import React, { useState, useEffect } from "react";
import "./CreateDealerAgreementModal.css";
import dealerAgreementApiService from "../../services/dealerAgreementApi";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "./CustomDropdown";
import { API_ENDPOINTS } from "../../services/constants";
import apiClient from "../../services/api";

const CreateDealerAgreementModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    dealerId: "",
    code: "",
    title: "",
    startDate: "",
    endDate: "",
    paymentTerms: "",
    fileUrl: "",
  });
  
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
      setErrors({ submit: "Không thể tải danh sách dealer" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing (only if form has been submitted)
    if (hasSubmitted && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.dealerId) {
      newErrors.dealerId = "Dealer là bắt buộc";
    }
    
    if (!formData.code.trim()) {
      newErrors.code = "Mã hợp đồng là bắt buộc";
    }
    
    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề hợp đồng là bắt buộc";
    }
    
    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }
    
    if (formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark form as submitted so errors will be displayed
    setHasSubmitted(true);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const agreementData = {
        dealerId: parseInt(formData.dealerId),
        code: formData.code.trim(),
        title: formData.title.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        paymentTerms: formData.paymentTerms || null,
        fileUrl: formData.fileUrl || null,
      };
      
      console.log("Creating agreement with data:", agreementData);
      const response = await dealerAgreementApiService.createDealerAgreement(agreementData);
      console.log("Agreement created:", response);
      
      onSuccess();
    } catch (error) {
      console.error("Error creating agreement:", error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.join(", ")
        || error.message 
        || "Không thể tạo hợp đồng";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      alert("Chỉ chấp nhận file PDF!");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File không được vượt quá 10MB!");
      return;
    }

    setSelectedFile(file);

    // Auto upload file
    try {
      setUploading(true);
      console.log("📤 Uploading file:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(API_ENDPOINTS.FILES.UPLOAD_CONTRACT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ File uploaded successfully:", response.data);

      const fileUrl =
        response.data?.value || response.data?.data || response.data;

      setFormData((prev) => ({
        ...prev,
        fileUrl: fileUrl,
      }));

      alert(`✅ Upload thành công!`);
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Không thể upload file";
      alert(`Lỗi upload: ${errorMessage}`);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const getDealerOptions = () => {
    const options = [];
    
    dealers.forEach(dealer => {
      options.push({
        value: String(dealer.id || dealer.dealerId),
        label: `${dealer.name || dealer.dealerName} (${dealer.code})`,
        icon: "🏢"
      });
    });
    
    return options;
  };

  return (
    <div className="admin-create-agreement-app">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Thêm Hợp đồng Rebate</h2>
            <button className="close-btn" onClick={onClose} disabled={loading}>
              ✕
            </button>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dealerId">
                  Dealer <span className="required">*</span>
                </label>
                <CustomDropdown
                  value={formData.dealerId}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, dealerId: val }));
                    // Clear error when user selects (only if form has been submitted)
                    if (hasSubmitted && errors.dealerId) {
                      setErrors(prev => ({ ...prev, dealerId: "" }));
                    }
                  }}
                  options={getDealerOptions()}
                  minWidth="100%"
                  placeholder="-- Chọn Dealer --"
                  disabled={loading}
                  compact={true}
                />
                {hasSubmitted && errors.dealerId && (
                  <span className="error-text">{errors.dealerId}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Mã hợp đồng <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="VD: AGR-2025-HCM"
                  className={hasSubmitted && errors.code ? "error" : ""}
                  disabled={loading}
                />
                {hasSubmitted && errors.code && (
                  <span className="error-text">{errors.code}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>
                Tiêu đề hợp đồng <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                  onChange={handleInputChange}
                  placeholder="VD: Hợp đồng khung 2025"
                  className={hasSubmitted && errors.title ? "error" : ""}
                  disabled={loading}
              />
              {hasSubmitted && errors.title && (
                <span className="error-text">{errors.title}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Ngày bắt đầu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={hasSubmitted && errors.startDate ? "error" : ""}
                  disabled={loading}
                />
                {hasSubmitted && errors.startDate && (
                  <span className="error-text">{errors.startDate}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={hasSubmitted && errors.endDate ? "error" : ""}
                  disabled={loading}
                />
                {hasSubmitted && errors.endDate && (
                  <span className="error-text">{errors.endDate}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Điều khoản thanh toán</label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                placeholder="VD: Net 30"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>File hợp đồng</label>
              {formData.fileUrl || selectedFile ? (
                <div className="uploaded-file-card">
                  <div className="file-info">
                    <div className="file-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#20c997"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                        <line x1="9" y1="18" x2="15" y2="18" />
                      </svg>
                    </div>
                    <div className="file-details">
                      <p className="file-name">
                        {selectedFile?.name || "Hợp đồng.pdf"}
                      </p>
                      <p className="file-size">
                        {selectedFile
                          ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                          : "PDF Document"}
                      </p>
                    </div>
                  </div>
                  {formData.fileUrl && (
                    <a
                      href={formData.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-file-link"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Xem file
                    </a>
                  )}
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => {
                      setSelectedFile(null);
                      setFormData((prev) => ({
                        ...prev,
                        fileUrl: "",
                      }));
                    }}
                    disabled={loading || uploading}
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <div className="upload-container">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="contract-file-upload"
                    disabled={loading || uploading}
                  />
                  {uploading ? (
                    <div className="upload-zone uploading">
                      <div className="upload-spinner"></div>
                      <p>Đang upload file...</p>
                    </div>
                  ) : (
                    <label
                      htmlFor="contract-file-upload"
                      className="upload-zone"
                    >
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <polyline
                          points="7,10 12,15 17,10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="12"
                          y1="15"
                          x2="12"
                          y2="3"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <p>Chọn file PDF để upload</p>
                      <small>Tối đa 10MB</small>
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="form-actions">
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
                {loading ? "Đang tạo..." : "Tạo hợp đồng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDealerAgreementModal;

