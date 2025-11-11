import React, { useState, useEffect } from "react";
import "./PricebookDetailModal.css";
import pricebookApiService from "../../services/pricebookApi";
import productApiService from "../../services/productApi";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "./CustomDropdown";

const PricebookDetailModal = ({ pricebookId, onClose, onUpdate, onSaveSuccess, onSaveError }) => {
  const [pricebook, setPricebook] = useState(null);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    dealerId: "",
    effectiveFrom: "",
    effectiveTo: "",
    status: "",
  });
  const [editErrors, setEditErrors] = useState({});

  // Add item state
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: "",
    msrpPrice: 0,
    floorPrice: 0,
  });
  const [addItemError, setAddItemError] = useState("");

  useEffect(() => {
    loadData();
  }, [pricebookId]);

  useEffect(() => {
    if (pricebook) {
      setEditData({
        name: pricebook.name || "",
        dealerId: pricebook.dealerId || "",
        effectiveFrom: pricebook.effectiveFrom || "",
        effectiveTo: pricebook.effectiveTo || "",
        status: pricebook.status || "",
      });
    }
  }, [pricebook]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [pricebookRes, productsRes, dealersRes] = await Promise.all([
        pricebookApiService.getPricebookById(pricebookId),
        productApiService.getProducts({}),
        dealerApiService.getDealers(),
      ]);

      const pricebookData = pricebookRes.data || pricebookRes;
      setPricebook(pricebookData);
      setItems(pricebookData.pricebookItems || []); // Items included in pricebook response
      setProducts(productsRes.data || productsRes || []);
      const pagedDealers = dealersRes?.data ?? dealersRes;
      const dealersList = Array.isArray(pagedDealers) ? pagedDealers : (pagedDealers?.items ?? []);
      setDealers(dealersList || []);
    } catch (err) {
      console.error("Error loading pricebook details:", err);
      setError("Lỗi khi tải thông tin bảng giá");
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
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      // Thử parse date với nhiều format khác nhau
      let date;
      if (typeof dateString === "string") {
        date = new Date(dateString);
      } else if (typeof dateString === "number") {
        date = new Date(dateString);
      } else {
        date = dateString;
      }

      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        return "-";
      }

      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "-";
    }
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

    if (!editData.name.trim()) {
      errors.name = "Tên bảng giá là bắt buộc";
    }

    if (!editData.effectiveFrom) {
      errors.effectiveFrom = "Ngày bắt đầu là bắt buộc";
    }

    if (
      editData.effectiveTo &&
      editData.effectiveFrom >= editData.effectiveTo
    ) {
      errors.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Validation: Ngày kết thúc chỉ cho phép gia hạn (phải sau ngày kết thúc hiện tại)
    // Chỉ validate khi người dùng THỰC SỰ thay đổi ngày kết thúc
    if (editData.effectiveTo && pricebook?.effectiveTo) {
      const currentEndDate = new Date(pricebook.effectiveTo);
      const newEndDate = new Date(editData.effectiveTo);
      // So sánh ngày để xem có thay đổi không (chỉ so sánh ngày, không so sánh giờ)
      const currentDateStr = currentEndDate.toISOString().split('T')[0];
      const newDateStr = newEndDate.toISOString().split('T')[0];
      
      // Chỉ validate rule gia hạn nếu ngày kết thúc THỰC SỰ đã thay đổi
      if (currentDateStr !== newDateStr && newEndDate <= currentEndDate) {
        errors.effectiveTo = "Ngày kết thúc phải sau ngày kết thúc hiện tại để gia hạn";
      }
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if there are any changes
  const hasChanges = () => {
    if (!pricebook) return false;

    const original = {
      name: pricebook.name || "",
      dealerId: pricebook.dealerId || "",
      effectiveFrom: pricebook.effectiveFrom || "",
      effectiveTo: pricebook.effectiveTo || "",
      status: pricebook.status || "",
    };

    const current = {
      name: editData.name || "",
      dealerId: editData.dealerId || "",
      effectiveFrom: editData.effectiveFrom || "",
      effectiveTo: editData.effectiveTo || "",
      status: editData.status || "",
    };

    // Compare values
    return (
      original.name !== current.name ||
      String(original.dealerId || "") !== String(current.dealerId || "") ||
      original.effectiveFrom !== current.effectiveFrom ||
      original.effectiveTo !== current.effectiveTo ||
      original.status !== current.status
    );
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return;

    // Check if there are any changes
    if (!hasChanges()) {
      // No changes, just exit edit mode without showing toast
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        name: editData.name,
        dealerId: editData.dealerId ? parseInt(editData.dealerId) : null,
        effectiveFrom: editData.effectiveFrom,
        effectiveTo: editData.effectiveTo || null,
        status: editData.status,
      };

      await pricebookApiService.updatePricebook(pricebookId, updateData);
      await loadData();
      setIsEditing(false);
      if (onUpdate) onUpdate();
      
      // Show success toast if callback provided
      if (onSaveSuccess) {
        onSaveSuccess(`Đã cập nhật thông tin bảng giá "${editData.name}" thành công!`);
      }
    } catch (err) {
      console.error("Error updating pricebook:", err);
      // Parse error message from backend response
      let errorMessage = "Lỗi khi cập nhật bảng giá";
      
      if (err.response?.data) {
        // Try to get message from consistent format
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
          errorMessage = err.response.data.errors[0];
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Keep \n for toast CSS white-space: pre-line to handle
      setError(errorMessage);
      if (onSaveError) {
        onSaveError("Lưu thay đổi thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    // Validate
    if (!newItem.productId) {
      setAddItemError("Vui lòng chọn sản phẩm");
      return;
    }
    
    // Convert to numbers for proper comparison
    const msrpPrice = parseFloat(newItem.msrpPrice) || 0;
    const floorPrice = parseFloat(newItem.floorPrice) || 0;
    
    if (msrpPrice <= 0) {
      setAddItemError("Giá MSRP phải lớn hơn 0");
      return;
    }
    if (floorPrice <= 0) {
      setAddItemError("Giá sàn phải lớn hơn 0");
      return;
    }
    if (floorPrice > msrpPrice) {
      setAddItemError("Giá sàn không được lớn hơn giá MSRP");
      return;
    }

    // Check if product already exists in pricebook
    if (items.some((item) => item.productId === parseInt(newItem.productId))) {
      setAddItemError("Sản phẩm này đã có trong bảng giá");
      return;
    }

    try {
      setLoading(true);
      setAddItemError("");

      await pricebookApiService.addItem(pricebookId, {
        productId: parseInt(newItem.productId),
        msrpPrice: msrpPrice,
        floorPrice: floorPrice,
      });

      await loadData();
      setShowAddItem(false);
      setNewItem({ productId: "", msrpPrice: 0, floorPrice: 0 });

      // Notify parent to refresh the list
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error adding item:", err);
      setAddItemError(err.message || "Lỗi khi thêm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi bảng giá?")) {
      return;
    }

    try {
      setLoading(true);
      await pricebookApiService.removeItem(pricebookId, itemId);
      await loadData();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error removing item:", err);
      setError(err.message || "Lỗi khi xóa sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pricebook) {
    return (
      <div className="admin-pricebook-detail-app">
        <div className="modal-overlay">
          <div className="pricebook-detail-modal">
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
    if (!dealerId) return "Global - Áp dụng cho tất cả dealer";
    const list = Array.isArray(dealers) ? dealers : [];
    const dealer = list.find((d) => (d.id || d.dealerId) === dealerId);
    return dealer ? `${dealer.name} (${dealer.code})` : `Dealer #${dealerId}`;
  };

  const getProductName = (productId) => {
    const product = products.find((p) => (p.productId || p.id) === productId);
    return product
      ? `${product.name || product.model}`
      : `Product #${productId}`;
  };

  // Filter out products already in the pricebook and only show Active products
  const availableProducts = products.filter((p) => {
    const status = p?.status || p?.Status || p?.productStatus || "Active";
    const isActive = status === "Active";

    const notInPricebook = !items.some(
      (item) => item.productId === (p.productId || p.id)
    );

    return isActive && notInPricebook;
  });

  return (
    <div className="admin-pricebook-detail-app">
      <div className="modal-overlay">
        <div className="pricebook-detail-modal">
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
                  <h2 className="modal-title">Chi Tiết Bảng Giá</h2>
                </div>
              </div>
              <div className="modal-header-actions">
                {!isEditing && (
                  <button
                    className="edit-btn"
                    onClick={handleEditToggle}
                    disabled={loading || pricebook?.status === "Expired"}
                    title={
                      pricebook?.status === "Expired"
                        ? "Không thể chỉnh sửa bảng giá đã hết hạn"
                        : ""
                    }
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

            {error && <div className="error-message">{error}</div>}

            {/* Edit Mode Banner */}
            {isEditing && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 20px",
                  background:
                    "linear-gradient(90deg, #20c997 0%, #93edc1 100%)",
                  animation: "editBannerSlideDown 0.3s ease-out",
                  boxShadow: "0 2px 8px rgba(32, 201, 151, 0.2)",
                }}
              >
                <style>{`
                @keyframes editBannerSlideDown {
                  from {
                    opacity: 0;
                    transform: translateY(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#fff",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#20c997"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#ffffff",
                      margin: "0 0 2px 0",
                    }}
                  >
                    Chế độ chỉnh sửa
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#ffffff",
                      margin: 0,
                      opacity: 0.95,
                    }}
                  >
                    Bạn đang chỉnh sửa thông tin bảng giá. Nhấn{" "}
                    <strong>"Lưu thay đổi"</strong> để hoàn tất.
                  </p>
                </div>
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
                    <h4>Thông Tin Bảng Giá</h4>
                  </div>
                  <div className="info-body">
                    {isEditing ? (
                      <>
                        <div className="field">
                          <label className="field-label">
                            Tên Bảng giá{" "}
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleEditChange}
                            className={`field-input ${
                              editErrors.name ? "error" : ""
                            }`}
                            placeholder="Nhập tên bảng giá"
                            disabled={loading}
                          />
                          {editErrors.name && (
                            <span className="field-error">
                              {editErrors.name}
                            </span>
                          )}
                        </div>

                        <div className="field">
                          <label className="field-label">
                            Dealer (Để trống cho Global)
                          </label>
                          <CustomDropdown
                            value={
                              editData.dealerId ? String(editData.dealerId) : ""
                            }
                            onChange={(val) => {
                              setEditData((prev) => ({
                                ...prev,
                                dealerId: val,
                              }));
                            }}
                            options={[
                              {
                                value: "",
                                label: "Global - Áp dụng cho tất cả dealer",
                                icon: "🌐",
                              },
                              ...dealers.map((dealer) => ({
                                value: String(dealer.id || dealer.dealerId),
                                label: `${dealer.name} (${dealer.code})`,
                                icon: "🏢",
                              })),
                            ]}
                            minWidth="100%"
                            compact={true}
                            disabled={true}
                          />
                        </div>

                        <div className="field">
                          <label className="field-label">
                            Ngày bắt đầu{" "}
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <input
                            type="date"
                            name="effectiveFrom"
                            value={editData.effectiveFrom}
                            onChange={handleEditChange}
                            className={`field-input ${
                              editErrors.effectiveFrom ? "error" : ""
                            }`}
                            disabled={true}
                          />
                          {editErrors.effectiveFrom && (
                            <span className="field-error">
                              {editErrors.effectiveFrom}
                            </span>
                          )}
                        </div>

                        <div className="field">
                          <label className="field-label">
                            Ngày kết thúc (Chỉ cho gia hạn)
                          </label>
                          <input
                            type="date"
                            name="effectiveTo"
                            value={editData.effectiveTo}
                            onChange={handleEditChange}
                            className={`field-input ${
                              editErrors.effectiveTo ? "error" : ""
                            }`}
                            disabled={loading}
                            min={
                              (() => {
                                const dates = [];
                                // Ngày bắt đầu hiện tại
                                if (editData.effectiveFrom) {
                                  dates.push(editData.effectiveFrom);
                                }
                                // Ngày kết thúc hiện tại nếu có (để chỉ cho gia hạn)
                                if (pricebook?.effectiveTo) {
                                  dates.push(pricebook.effectiveTo);
                                }
                                // Ngày hiện tại
                                const today = new Date().toISOString().split('T')[0];
                                dates.push(today);
                                // Trả về ngày lớn nhất (gần nhất trong tương lai)
                                return dates.length > 0 
                                  ? dates.sort().reverse()[0]
                                  : today;
                              })()
                            }
                          />
                          {editErrors.effectiveTo && (
                            <span className="field-error">
                              {editErrors.effectiveTo}
                            </span>
                          )}
                          {pricebook?.effectiveTo && (
                            <span className="field-hint" style={{
                              fontSize: "12px",
                              color: "#6c757d",
                              marginTop: "4px",
                              display: "block"
                            }}>
                              Ngày kết thúc hiện tại: {new Date(pricebook.effectiveTo).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>

                        <div className="field">
                          <label className="field-label">Trạng Thái</label>
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
                          <label className="field-label">Tên Bảng giá</label>
                          <div className="field-value">{pricebook?.name}</div>
                        </div>

                        <div className="field">
                          <label className="field-label">Trạng thái</label>
                          <div className="field-value">
                            {getStatusBadge(pricebook?.status)}
                          </div>
                        </div>

                        <div className="field">
                          <label className="field-label">Dealer</label>
                          <div className="field-value">
                            {getDealerName(pricebook?.dealerId)}
                          </div>
                        </div>

                        {(pricebook?.createdAt ||
                          pricebook?.createdDate ||
                          pricebook?.dateCreated) && (
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
                              {formatDate(
                                pricebook.createdAt ||
                                  pricebook.createdDate ||
                                  pricebook.dateCreated
                              )}
                            </div>
                          </div>
                        )}

                        {(pricebook?.updatedAt ||
                          pricebook?.updatedDate ||
                          pricebook?.dateUpdated ||
                          pricebook?.lastModified) && (
                          <div className="field">
                            <label className="field-label">Cập Nhật Lần Cuối</label>
                            <div className="field-value date-value">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                              </svg>
                              {formatDate(
                                pricebook.updatedAt ||
                                  pricebook.updatedDate ||
                                  pricebook.dateUpdated ||
                                  pricebook.lastModified
                              )}
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
                            {formatDate(pricebook?.effectiveFrom)}
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
                            {pricebook?.effectiveTo
                              ? formatDate(pricebook.effectiveTo)
                              : "Không giới hạn"}
                          </div>
                        </div>

                        <div className="field">
                          <label className="field-label">Số Sản Phẩm</label>
                          <div className="field-value">
                            <span className="highlight-count">
                              {items.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột phải: Danh sách sản phẩm */}
              <div className="detail-section">
                <div className="section-header">
                  <h3>Sản Phẩm Trong Bảng Giá ({items.length})</h3>
                  {!showAddItem && (
                    <button
                      className="add-product-btn"
                      onClick={() => setShowAddItem(true)}
                      disabled={
                        loading || isEditing || pricebook?.status === "Expired"
                      }
                      title={
                        pricebook?.status === "Expired"
                          ? "Không thể thêm sản phẩm vào bảng giá đã hết hạn"
                          : ""
                      }
                    >
                      {pricebook?.status === "Expired" ? (
                        <span style={{ fontSize: "14px" }}>🔒</span>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                      )}
                      Thêm sản phẩm
                    </button>
                  )}
                </div>

                {/* Form thêm sản phẩm */}
                {showAddItem && (
                  <div className="add-item-form">
                    <h4>Thêm Sản Phẩm Mới</h4>

                    {addItemError && (
                      <div className="error-message">{addItemError}</div>
                    )}

                    <div className="form-group">
                      <label>Sản phẩm *</label>
                      <CustomDropdown
                        value={
                          newItem.productId ? String(newItem.productId) : ""
                        }
                        onChange={(val) => {
                          setNewItem((prev) => ({ ...prev, productId: val }));
                          setAddItemError("");
                        }}
                        options={[
                          { value: "", label: "Chọn sản phẩm", icon: "📦" },
                          ...availableProducts.map((product) => ({
                            value: String(product.productId || product.id),
                            label: product.name || product.model,
                            icon: "📦",
                          })),
                        ]}
                        minWidth="100%"
                        compact={true}
                      />
                    </div>

                    <div className="add-item-grid">
                      <div className="form-group">
                        <label>Giá MSRP (VND) *</label>
                        <input
                          type="number"
                          value={newItem.msrpPrice}
                          onChange={(e) => {
                            setNewItem((prev) => ({
                              ...prev,
                              msrpPrice: e.target.value,
                            }));
                            setAddItemError("");
                          }}
                          min="0"
                          step="1000000"
                          disabled={loading}
                        />
                      </div>

                      <div className="form-group">
                        <label>Giá sàn (VND) *</label>
                        <input
                          type="number"
                          value={newItem.floorPrice}
                          onChange={(e) => {
                            setNewItem((prev) => ({
                              ...prev,
                              floorPrice: e.target.value,
                            }));
                            setAddItemError("");
                          }}
                          min="0"
                          step="1000000"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="add-item-actions">
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setShowAddItem(false);
                          setNewItem({
                            productId: "",
                            msrpPrice: 0,
                            floorPrice: 0,
                          });
                          setAddItemError("");
                        }}
                        disabled={loading}
                      >
                        Hủy
                      </button>
                      <button
                        className="submit-btn"
                        onClick={handleAddItem}
                        disabled={loading}
                      >
                        {loading ? "Đang thêm..." : "Thêm sản phẩm"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Danh sách items */}
                {items.length === 0 ? (
                  <div className="empty-state">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z" />
                    </svg>
                    <p>Chưa có sản phẩm nào trong bảng giá</p>
                    <p>Click "Thêm sản phẩm" để bắt đầu</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="detail-table">
                      <thead>
                        <tr>
                          <th className="th-product">Sản phẩm</th>
                          <th className="th-price">Giá MSRP (VND)</th>
                          <th className="th-price">Giá sàn (VND)</th>
                          <th className="th-action">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.pricebookItemId || item.id}>
                            <td>{getProductName(item.productId)}</td>
                            <td className="td-price">
                              {formatCurrency(item.msrpPrice)} ₫
                            </td>
                            <td className="td-price">
                              {formatCurrency(item.floorPrice)} ₫
                            </td>
                            <td>
                              <button
                                className="delete-btn"
                                onClick={() =>
                                  handleRemoveItem(
                                    item.pricebookItemId || item.id
                                  )
                                }
                                disabled={
                                  loading || pricebook?.status === "Expired"
                                }
                                title={
                                  pricebook?.status === "Expired"
                                    ? "Không thể xóa sản phẩm khỏi bảng giá đã hết hạn"
                                    : "Xóa sản phẩm"
                                }
                              >
                                {pricebook?.status === "Expired" ? "🔒" : "🗑️"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                  <button
                    className="save-btn"
                    onClick={handleSaveEdit}
                    disabled={loading}
                  >
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

export default PricebookDetailModal;
