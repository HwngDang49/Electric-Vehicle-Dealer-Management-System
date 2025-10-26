import React, { useState, useEffect } from "react";
import "./PricebookDetailModal.css";
import pricebookApiService from "../../services/pricebookApi";
import productApiService from "../../services/productApi";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "./CustomDropdown";

const PricebookDetailModal = ({ pricebookId, onClose, onUpdate }) => {
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
      setDealers(dealersRes.data || dealersRes || []);
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

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return;

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
    } catch (err) {
      console.error("Error updating pricebook:", err);
      setError(err.message || "Lỗi khi cập nhật bảng giá");
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
    if (newItem.msrpPrice <= 0) {
      setAddItemError("Giá MSRP phải lớn hơn 0");
      return;
    }
    if (newItem.floorPrice <= 0) {
      setAddItemError("Giá sàn phải lớn hơn 0");
      return;
    }
    if (newItem.floorPrice > newItem.msrpPrice) {
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
        msrpPrice: parseFloat(newItem.msrpPrice),
        floorPrice: parseFloat(newItem.floorPrice),
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
    const dealer = dealers.find((d) => (d.id || d.dealerId) === dealerId);
    return dealer ? `${dealer.name} (${dealer.code})` : `Dealer #${dealerId}`;
  };

  const getProductName = (productId) => {
    const product = products.find((p) => (p.productId || p.id) === productId);
    return product
      ? `${product.name || product.model}`
      : `Product #${productId}`;
  };

  // Filter out products already in the pricebook
  const availableProducts = products.filter(
    (p) => !items.some((item) => item.productId === (p.productId || p.id))
  );

  return (
    <div className="admin-pricebook-detail-app">
      <div className="modal-overlay">
        <div className="pricebook-detail-modal">
          <div className="modal-content">
            {/* Header với nút đóng */}
            <div className="modal-header">
              <h2>Chi Tiết Bảng Giá</h2>
              <button className="close-btn" onClick={onClose}>
                ✕
              </button>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="detail-grid-container">
              {/* Cột trái: Thông tin cơ bản */}
              <div className="detail-section">
                <div className="section-header">
                  <h3>Thông Tin Bảng Giá</h3>
                  {!isEditing && (
                    <button
                      className="edit-toggle-btn"
                      onClick={handleEditToggle}
                      disabled={loading || pricebook?.status === "Expired"}
                      title={pricebook?.status === "Expired" ? "Không thể chỉnh sửa bảng giá đã hết hạn" : ""}
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
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      )}
                      Chỉnh sửa
                    </button>
                  )}
                </div>

              {isEditing ? (
                <div className="edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Tên Bảng giá *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        className={editErrors.name ? "error" : ""}
                        disabled={loading}
                      />
                      {editErrors.name && (
                        <span className="error-text">{editErrors.name}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="status">Trạng Thái</label>
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
                  </div>

                  <div className="form-group">
                    <label htmlFor="dealerId">
                      Dealer (Để trống cho Global)
                    </label>
                    <CustomDropdown
                      value={editData.dealerId ? String(editData.dealerId) : ""}
                      onChange={(val) => {
                        setEditData((prev) => ({ ...prev, dealerId: val }));
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
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="effectiveFrom">Ngày bắt đầu *</label>
                      <input
                        type="date"
                        id="effectiveFrom"
                        name="effectiveFrom"
                        value={editData.effectiveFrom}
                        onChange={handleEditChange}
                        className={editErrors.effectiveFrom ? "error" : ""}
                        disabled={loading}
                      />
                      {editErrors.effectiveFrom && (
                        <span className="error-text">
                          {editErrors.effectiveFrom}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="effectiveTo">Ngày kết thúc</label>
                      <input
                        type="date"
                        id="effectiveTo"
                        name="effectiveTo"
                        value={editData.effectiveTo}
                        onChange={handleEditChange}
                        className={editErrors.effectiveTo ? "error" : ""}
                        disabled={loading}
                      />
                      {editErrors.effectiveTo && (
                        <span className="error-text">
                          {editErrors.effectiveTo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="edit-actions">
                    <button
                      className="cancel-btn"
                      onClick={handleEditToggle}
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      className="submit-btn"
                      onClick={handleSaveEdit}
                      disabled={loading}
                    >
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Tên Bảng giá</label>
                    <span className="highlight-name">
                      {pricebook?.name}
                    </span>
                  </div>

                  <div className="detail-item">
                    <label>Trạng thái</label>
                    {getStatusBadge(pricebook?.status)}
                  </div>

                  <div className="detail-item">
                    <label>Dealer</label>
                    <span>{getDealerName(pricebook?.dealerId)}</span>
                  </div>

                  <div className="detail-item">
                    <label>Ngày tạo</label>
                    <span>{formatDate(pricebook?.createdAt)}</span>
                  </div>

                  <div className="detail-item">
                    <label>Ngày bắt đầu</label>
                    <span>{formatDate(pricebook?.effectiveFrom)}</span>
                  </div>

                  <div className="detail-item">
                    <label>Ngày kết thúc</label>
                    <span>
                      {pricebook?.effectiveTo
                        ? formatDate(pricebook?.effectiveTo)
                        : "Không giới hạn"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <label>Số sản phẩm</label>
                    <span className="highlight-count">
                      {items.length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Cột phải: Danh sách sản phẩm */}
            <div className="detail-section">
              <div className="section-header">
                <h3>Sản Phẩm Trong Bảng Giá ({items.length})</h3>
                {!showAddItem && (
                  <button
                    className="add-product-btn"
                    onClick={() => setShowAddItem(true)}
                    disabled={loading || isEditing || pricebook?.status === "Expired"}
                    title={pricebook?.status === "Expired" ? "Không thể thêm sản phẩm vào bảng giá đã hết hạn" : ""}
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
                    <div className="error-message">
                      {addItemError}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Sản phẩm *</label>
                    <CustomDropdown
                      value={newItem.productId ? String(newItem.productId) : ""}
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
                          <td>
                            {getProductName(item.productId)}
                          </td>
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
                              disabled={loading || pricebook?.status === "Expired"}
                              title={pricebook?.status === "Expired" ? "Không thể xóa sản phẩm khỏi bảng giá đã hết hạn" : "Xóa sản phẩm"}
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
        </div>
      </div>
      </div>
    </div>
  );
};

export default PricebookDetailModal;
