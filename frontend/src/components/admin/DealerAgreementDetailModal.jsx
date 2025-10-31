import React, { useState, useEffect } from "react";
import "./DealerAgreementDetailModal.css";
import dealerAgreementApiService from "../../services/dealerAgreementApi";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "./CustomDropdown";

const DealerAgreementDetailModal = ({ agreementId, onClose, onUpdate }) => {
  const [agreement, setAgreement] = useState(null);
  const [rebateTiers, setRebateTiers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    code: "",
    title: "",
    startDate: "",
    endDate: "",
    paymentTerms: "",
    fileUrl: "",
    status: "",
  });
  const [editErrors, setEditErrors] = useState({});

  // Add rebate tier state
  const [showAddTier, setShowAddTier] = useState(false);
  const [newTier, setNewTier] = useState({
    period: "",
    tierQty: "",
    rebatePerUnit: "",
    capAmount: "",
  });
  const [addTierError, setAddTierError] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");

  useEffect(() => {
    loadData();
  }, [agreementId]);

  useEffect(() => {
    if (agreement) {
      setEditData({
        code: agreement.code || "",
        title: agreement.title || "",
        startDate: agreement.startDate ? agreement.startDate.split('T')[0] : "",
        endDate: agreement.endDate ? agreement.endDate.split('T')[0] : "",
        paymentTerms: agreement.paymentTerms || "",
        fileUrl: agreement.fileUrl || "",
        status: agreement.status || "",
      });
    }
  }, [agreement]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [agreementRes, dealersRes, rebatesRes] = await Promise.all([
        dealerAgreementApiService.getDealerAgreementById(agreementId),
        dealerApiService.getDealers(),
        dealerAgreementApiService.getRebateTiers(agreementId),
      ]);

      const agreementData = agreementRes.data || agreementRes;
      setAgreement(agreementData);
      setDealers(dealersRes.data || dealersRes || []);
      
      const tiers = rebatesRes.data || rebatesRes || [];
      setRebateTiers(Array.isArray(tiers) ? tiers : []);
    } catch (err) {
      console.error("Error loading agreement details:", err);
      setError("Lỗi khi tải thông tin hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { text: "Hoạt động", class: "status-active" },
      Inactive: { text: "Không hoạt động", class: "status-inactive" },
      Expired: { text: "Hết hạn", class: "status-discontinued" },
    };

    const config = statusConfig[status] || {
      text: status,
      class: "status-default",
    };
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  const statusOptions = [
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", icon: "⏸️" },
    { value: "Expired", label: "Hết hạn", icon: "❌" },
  ];

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (editErrors[name]) {
      setEditErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editData.code.trim()) {
      errors.code = "Mã hợp đồng là bắt buộc";
    }

    if (!editData.title.trim()) {
      errors.title = "Tiêu đề hợp đồng là bắt buộc";
    }

    if (!editData.startDate) {
      errors.startDate = "Ngày bắt đầu là bắt buộc";
    }

    if (
      editData.endDate &&
      editData.startDate >= editData.endDate
    ) {
      errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return;

    try {
      setLoading(true);
      const updateData = {
        code: editData.code.trim(),
        title: editData.title.trim(),
        startDate: editData.startDate,
        endDate: editData.endDate || null,
        paymentTerms: editData.paymentTerms || null,
        fileUrl: editData.fileUrl || null,
        status: editData.status,
      };

      await dealerAgreementApiService.updateDealerAgreement(agreementId, updateData);
      await loadData();
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error updating agreement:", err);
      setError(err.message || "Lỗi khi cập nhật hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAgreement = async () => {
    if (!window.confirm("Bạn có chắc muốn đóng hợp đồng này?")) {
      return;
    }

    try {
      setLoading(true);
      await dealerAgreementApiService.closeDealerAgreement(agreementId);
      await loadData();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error closing agreement:", err);
      setError(err.message || "Lỗi khi đóng hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = async () => {
    // Validate
    if (!newTier.period.trim()) {
      setAddTierError("Kỳ là bắt buộc (VD: 2025-01)");
      return;
    }
    
    // Validate period format YYYY-MM
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(newTier.period)) {
      setAddTierError("Kỳ phải có định dạng YYYY-MM (VD: 2025-01)");
      return;
    }

    if (!newTier.tierQty || parseInt(newTier.tierQty) <= 0) {
      setAddTierError("Số lượng tier phải lớn hơn 0");
      return;
    }

    if (!newTier.rebatePerUnit || parseFloat(newTier.rebatePerUnit) <= 0) {
      setAddTierError("Rebate per unit phải lớn hơn 0");
      return;
    }

    // Check duplicate (Period, TierQty)
    if (rebateTiers.some(
      t => t.period === newTier.period && 
           parseInt(t.tierQty) === parseInt(newTier.tierQty)
    )) {
      setAddTierError("Đã tồn tại tier này cho kỳ " + newTier.period);
      return;
    }

    try {
      setLoading(true);
      setAddTierError("");

      await dealerAgreementApiService.createRebateTier(agreementId, {
        period: newTier.period.trim(),
        tierQty: parseInt(newTier.tierQty),
        rebatePerUnit: parseFloat(newTier.rebatePerUnit),
        capAmount: newTier.capAmount ? parseFloat(newTier.capAmount) : null,
      });

      await loadData();
      setShowAddTier(false);
      setNewTier({ period: "", tierQty: "", rebatePerUnit: "", capAmount: "" });
      
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error adding tier:", err);
      setAddTierError(err.response?.data?.message || err.message || "Lỗi khi thêm rebate tier");
    } finally {
      setLoading(false);
    }
  };

  const filteredTiers = periodFilter
    ? rebateTiers.filter(t => t.period === periodFilter)
    : rebateTiers;

  // Get unique periods for filter
  const uniquePeriods = [...new Set(rebateTiers.map(t => t.period))].sort().reverse();

  if (loading && !agreement) {
    return (
      <div className="admin-agreement-detail-app">
        <div className="modal-overlay">
          <div className="agreement-detail-modal">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getDealerName = (dealerId) => {
    if (!dealerId) return "-";
    const dealer = dealers.find((d) => (d.id || d.dealerId) === dealerId);
    return dealer ? `${dealer.code} - ${dealer.name || dealer.dealerName}` : `Dealer #${dealerId}`;
  };

  return (
    <div className="admin-agreement-detail-app">
      <div className="modal-overlay">
        <div className={`agreement-detail-modal ${isEditing ? "edit-mode" : ""}`}>
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                  </svg>
                </div>
                <div>
                  <h2 className="modal-title">Chi Tiết Hợp Đồng Rebate</h2>
                  <p className="modal-subtitle">
                    Quản lý thông tin và rebate tiers
                  </p>
                </div>
              </div>
              <div className="modal-header-actions">
                {!isEditing && (
                  <button
                    className="edit-btn"
                    onClick={handleEditToggle}
                    disabled={loading || agreement?.status === "Expired"}
                    title={agreement?.status === "Expired" ? "Không thể chỉnh sửa hợp đồng đã hết hạn" : ""}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    Chỉnh sửa
                  </button>
                )}
                <button className="secondary-btn" onClick={onClose}>
                  Đóng
                </button>
              </div>
            </div>

            {/* Edit Mode Banner */}
            {isEditing && (
              <div className="edit-banner">
                <div className="edit-banner-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </div>
                <div className="edit-banner-text">
                  <p className="edit-banner-title">
                    Chế độ chỉnh sửa
                  </p>
                  <p className="edit-banner-subtitle">
                    Bạn đang chỉnh sửa thông tin hợp đồng. Nhấn "Lưu thay đổi" để hoàn tất.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="detail-grid-container">
              {/* Cột trái: Thông tin cơ bản */}
              <div className="detail-section">
                <div className="info-card">
                  <div className="card-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    <h4>Thông Tin Hợp Đồng</h4>
                  </div>
                  <div className="info-body">
                    {isEditing ? (
                      <>
                        <div className="field">
                          <label className="field-label">
                            Mã hợp đồng <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="code"
                            value={editData.code}
                            onChange={handleEditChange}
                            className={`field-input ${editErrors.code ? "error" : ""}`}
                            placeholder="Nhập mã hợp đồng"
                            disabled={loading}
                          />
                          {editErrors.code && (
                            <span className="field-error">{editErrors.code}</span>
                          )}
                        </div>

                        <div className="field">
                          <label className="field-label">
                            Tiêu đề <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={editData.title}
                            onChange={handleEditChange}
                            className={`field-input ${editErrors.title ? "error" : ""}`}
                            placeholder="Nhập tiêu đề hợp đồng"
                            disabled={loading}
                          />
                          {editErrors.title && (
                            <span className="field-error">{editErrors.title}</span>
                          )}
                        </div>

                        <div className="field">
                          <label className="field-label">
                            Ngày bắt đầu <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={editData.startDate}
                            onChange={handleEditChange}
                            className={`field-input ${editErrors.startDate ? "error" : ""}`}
                            disabled={loading}
                          />
                          {editErrors.startDate && (
                            <span className="field-error">{editErrors.startDate}</span>
                          )}
                        </div>

                        <div className="field">
                          <label className="field-label">
                            Ngày kết thúc
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={editData.endDate}
                            onChange={handleEditChange}
                            className={`field-input ${editErrors.endDate ? "error" : ""}`}
                            disabled={loading}
                          />
                          {editErrors.endDate && (
                            <span className="field-error">{editErrors.endDate}</span>
                          )}
                        </div>

                        <div className="field">
                          <label className="field-label">
                            Điều khoản thanh toán
                          </label>
                          <input
                            type="text"
                            name="paymentTerms"
                            value={editData.paymentTerms}
                            onChange={handleEditChange}
                            className="field-input"
                            placeholder="Nhập điều khoản thanh toán"
                            disabled={loading}
                          />
                        </div>

                        <div className="field">
                          <label className="field-label">
                            File hợp đồng (URL)
                          </label>
                          <input
                            type="text"
                            name="fileUrl"
                            value={editData.fileUrl}
                            onChange={handleEditChange}
                            className="field-input"
                            placeholder="Nhập URL file hợp đồng"
                            disabled={loading}
                          />
                        </div>

                        <div className="field">
                          <label className="field-label">
                            Trạng Thái
                          </label>
                          <CustomDropdown
                            value={editData.status}
                            onChange={(val) => {
                              setEditData((prev) => ({ ...prev, status: val }));
                            }}
                            options={statusOptions}
                            minWidth="100%"
                            compact={true}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="fields-grid">
                        <div className="field">
                          <label className="field-label">ID Hợp Đồng</label>
                          <div className="field-value">
                            {agreement?.agreementId || "-"}
                          </div>
                        </div>

                        <div className="field">
                          <label className="field-label">Mã Hợp Đồng</label>
                          <div className="field-value">
                            {agreement?.code || "-"}
                          </div>
                        </div>

                        <div className="field">
                          <label className="field-label">Tiêu Đề</label>
                          <div className="field-value">
                            {agreement?.title || "-"}
                          </div>
                        </div>

                        <div className="field">
                          <label className="field-label">Dealer</label>
                          <div className="field-value">
                            {getDealerName(agreement?.dealerId)}
                          </div>
                        </div>

                        {agreement?.createdAt && (
                          <div className="field">
                            <label className="field-label">Ngày Tạo</label>
                            <div className="field-value date-value">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                              </svg>
                              {formatDate(agreement.createdAt)}
                            </div>
                          </div>
                        )}

                        <div className="field">
                          <label className="field-label">Ngày Bắt Đầu</label>
                          <div className="field-value date-value">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                            </svg>
                            {formatDate(agreement?.startDate)}
                          </div>
                        </div>

                        <div className="field">
                          <label className="field-label">Ngày Kết Thúc</label>
                          <div className="field-value date-value">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                            </svg>
                            {agreement?.endDate
                              ? formatDate(agreement.endDate)
                              : "Không giới hạn"}
                          </div>
                        </div>

                        <div className="field">
                          <label className="field-label">Điều Khoản Thanh Toán</label>
                          <div className="field-value">
                            {agreement?.paymentTerms || "-"}
                          </div>
                        </div>

                        <div className="field">
                          <label className="field-label">Trạng Thái</label>
                          <div className="field-value">
                            {getStatusBadge(agreement?.status)}
                          </div>
                        </div>

                        <div className="field full-width">
                          <label className="field-label">File Hợp Đồng</label>
                          <div className="field-value">
                            {agreement?.fileUrl ? (
                              <a href={agreement.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#20c997", textDecoration: "none" }}>
                                Xem file
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột phải: Rebate Tiers */}
              <div className="detail-section">
                <div className="rebate-tiers-card">
                  {/* Header với Stats */}
                  <div className="rebate-header">
                    <div className="rebate-header-left">
                      <div className="rebate-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="rebate-title">Rebate Tiers</h3>
                        <p className="rebate-subtitle">{rebateTiers.length} tier{rebateTiers.length !== 1 ? 's' : ''} đã thiết lập</p>
                      </div>
                    </div>
                    {!showAddTier && !isEditing && (
                      <button
                        className="rebate-add-btn"
                        onClick={() => setShowAddTier(true)}
                        disabled={loading || isEditing || agreement?.status === "Expired"}
                        title={agreement?.status === "Expired" ? "Không thể thêm rebate tier vào hợp đồng đã hết hạn" : ""}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Thêm Tier
                      </button>
                    )}
                  </div>

                  {/* Filter và Actions Bar */}
                  {rebateTiers.length > 0 && !showAddTier && (
                    <div className="rebate-toolbar">
                      <div className="rebate-filter">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#6c757d" }}>
                          <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                        </svg>
                        <CustomDropdown
                          value={periodFilter}
                          onChange={(val) => setPeriodFilter(val)}
                          options={[
                            { value: "", label: "Tất cả kỳ", icon: "📋" },
                            ...uniquePeriods.map(period => ({
                              value: period,
                              label: period,
                              icon: "📅"
                            }))
                          ]}
                          minWidth="160px"
                          compact={true}
                        />
                      </div>
                      <div className="rebate-stats">
                        <span className="stat-text">Hiển thị: <strong>{filteredTiers.length}</strong> / {rebateTiers.length}</span>
                      </div>
                    </div>
                  )}

                  {/* Add Tier Form */}
                  {showAddTier && (
                    <div className="rebate-add-form">
                      <div className="add-form-header">
                        <h4>Thêm Rebate Tier Mới</h4>
                        <button
                          className="close-form-btn"
                          onClick={() => {
                            setShowAddTier(false);
                            setNewTier({ period: "", tierQty: "", rebatePerUnit: "", capAmount: "" });
                            setAddTierError("");
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      </div>

                      {addTierError && (
                        <div className="rebate-form-error">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                          {addTierError}
                        </div>
                      )}

                      <div className="rebate-form-grid">
                        <div className="rebate-form-field">
                          <label>Kỳ (YYYY-MM) <span className="required">*</span></label>
                          <input
                            type="text"
                            placeholder="VD: 2025-01"
                            value={newTier.period}
                            onChange={(e) => {
                              setNewTier({ ...newTier, period: e.target.value });
                              setAddTierError("");
                            }}
                            disabled={loading}
                          />
                        </div>
                        <div className="rebate-form-field">
                          <label>Số lượng Tier <span className="required">*</span></label>
                          <input
                            type="number"
                            placeholder="VD: 10"
                            min="1"
                            value={newTier.tierQty}
                            onChange={(e) => {
                              setNewTier({ ...newTier, tierQty: e.target.value });
                              setAddTierError("");
                            }}
                            disabled={loading}
                          />
                        </div>
                        <div className="rebate-form-field">
                          <label>Rebate Per Unit (VND) <span className="required">*</span></label>
                          <input
                            type="number"
                            placeholder="VD: 1000000"
                            min="0"
                            step="1000"
                            value={newTier.rebatePerUnit}
                            onChange={(e) => {
                              setNewTier({ ...newTier, rebatePerUnit: e.target.value });
                              setAddTierError("");
                            }}
                            disabled={loading}
                          />
                        </div>
                        <div className="rebate-form-field">
                          <label>Cap Amount (VND) <span className="optional">(Tùy chọn)</span></label>
                          <input
                            type="number"
                            placeholder="VD: 50000000"
                            min="0"
                            step="1000"
                            value={newTier.capAmount}
                            onChange={(e) => {
                              setNewTier({ ...newTier, capAmount: e.target.value });
                              setAddTierError("");
                            }}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="rebate-form-actions">
                        <button
                          className="rebate-cancel-btn"
                          onClick={() => {
                            setShowAddTier(false);
                            setNewTier({ period: "", tierQty: "", rebatePerUnit: "", capAmount: "" });
                            setAddTierError("");
                          }}
                          disabled={loading}
                        >
                          Hủy
                        </button>
                        <button
                          className="rebate-submit-btn"
                          onClick={handleAddTier}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <svg className="spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                              </svg>
                              Đang thêm...
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                              Thêm Tier
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tiers Table */}
                  {!showAddTier && (
                    <>
                      {rebateTiers.length === 0 ? (
                        <div className="rebate-empty-state">
                          <div className="empty-icon-wrapper">
                            <svg
                              width="80"
                              height="80"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z" />
                            </svg>
                          </div>
                          <h4>Chưa có rebate tier nào</h4>
                          <p>Bắt đầu bằng cách thêm rebate tier đầu tiên cho hợp đồng này</p>
                          <button
                            className="rebate-empty-add-btn"
                            onClick={() => setShowAddTier(true)}
                            disabled={loading || isEditing || agreement?.status === "Expired"}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                            Thêm Tier Đầu Tiên
                          </button>
                        </div>
                      ) : (
                        <div className="rebate-table-wrapper">
                          <table className="rebate-tiers-table">
                            <thead>
                              <tr>
                                <th>Kỳ</th>
                                <th>Tier Qty</th>
                                <th>Rebate/Unit</th>
                                <th>Cap Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTiers
                                .sort((a, b) => {
                                  if (a.period !== b.period) {
                                    return b.period.localeCompare(a.period);
                                  }
                                  return parseInt(a.tierQty) - parseInt(b.tierQty);
                                })
                                .map((tier, index) => (
                                  <tr key={tier.rebateId || `${tier.period}-${tier.tierQty}`} className={index % 2 === 0 ? "even-row" : ""}>
                                    <td>
                                      {tier.period}
                                    </td>
                                    <td>
                                      {tier.tierQty}
                                    </td>
                                    <td className="amount-cell">
                                      {formatCurrency(tier.rebatePerUnit)}
                                    </td>
                                    <td className="amount-cell">
                                      {tier.capAmount ? (
                                        formatCurrency(tier.capAmount)
                                      ) : (
                                        <span className="amount-empty">Không giới hạn</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="modal-footer">
              {isEditing ? (
                <div className="edit-actions">
                  <button
                    className="cancel-btn"
                    onClick={handleEditToggle}
                    disabled={loading}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                    Hủy
                  </button>
                  <button className="save-btn" onClick={handleSaveEdit} disabled={loading}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              ) : (
                <div className="view-actions"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerAgreementDetailModal;

