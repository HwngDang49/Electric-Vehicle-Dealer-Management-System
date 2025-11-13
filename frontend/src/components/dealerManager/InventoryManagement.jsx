import React, { useState, useEffect } from "react";
import "./InventoryManagement.css";
import PageHeader from "./PageHeader";
import { vinApiService } from "../../services";

const InventoryManagement = ({ onNavigateToHome }) => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailedInventory, setDetailedInventory] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [vinList, setVinList] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load data khi component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await vinApiService.getVinList({});
      const data = Array.isArray(response) ? response : response?.data || [];
      setWarehouseData(data);
    } catch {
      setWarehouseData([]);
    }
  };

  const handleViewDetails = async (branch) => {
    try {
      setSelectedBranch(branch);
      setLoadingDetail(true);
      setShowDetailModal(true);

      const response = await vinApiService.getVinList({
        branchId: branch.branchId,
      });

      setDetailedInventory(response || []);
    } catch {
      setDetailedInventory([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedBranch(null);
    setDetailedInventory([]);
    setSelectedStatus(null);
    setVinList([]);
    setExpandedProducts(new Set());
  };

  const handleStatusClick = async (status) => {
    try {
      setSelectedStatus(status);
      setVinList([]);
      setExpandedProducts(new Set()); // Reset expanded products when changing status

      const response = await vinApiService.getDetailVins({
        branchId: selectedBranch.branchId,
        status: status,
      });

      if (response && Array.isArray(response)) {
        const vins = response.map((item) => ({
          vin: item.Vin || item.vin,
          productName: item.ProductName || item.productName,
          colorName: item.ColorName || item.colorName,
          vinNumber: item.Vin || item.vin,
          status: item.Status || item.status,
          orderId: item.OrderId || item.orderId,
          poId: item.PoId || item.poId,
          receivedAt: item.ReceivedAt || item.receivedAt,
        }));
        setVinList(vins);
      } else {
        setVinList([]);
      }
    } catch {
      setVinList([]);
    }
  };

  const toggleProduct = (productKey) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productKey)) {
      newExpanded.delete(productKey);
    } else {
      newExpanded.add(productKey);
    }
    setExpandedProducts(newExpanded);
  };

  // Group VINs by product and color
  const groupVinsByProduct = () => {
    const grouped = {};
    vinList.forEach((vin) => {
      const productName = vin.productName || "N/A";
      const colorName = vin.colorName || "N/A";
      const key = `${productName}-${colorName}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          productName,
          colorName,
          vins: [],
        };
      }
      grouped[key].vins.push(vin);
    });
    return grouped;
  };

  // Calculate pagination
  const totalItems = warehouseData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = warehouseData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="inventory-management">
      <PageHeader
        title="Quản lý kho"
        subtitle="Quản lý và theo dõi các kho của đại lý tại các chi nhánh"
        showBackButton={true}
        onBack={onNavigateToHome}
      />

      <div className="inventory-management-content">
        {/* Inventory Table */}
        <div className="inventory-table-section">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Chi nhánh</th>
                <th>Địa chỉ</th>
                <th>Số lượng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => {
                // Map PascalCase từ backend sang camelCase
                // Calculate inStockQuantity and deliveredQuantity
                const inStockQuantity =
                  item.QuantityInfo?.InStockQuantity ??
                  item.quantityInfo?.inStockQuantity ??
                  0;
                const allocatedQuantity =
                  item.QuantityInfo?.AllocatedQuantity ??
                  item.quantityInfo?.allocatedQuantity ??
                  0;
                const readyQuantity =
                  item.QuantityInfo?.ReadyQuantity ??
                  item.quantityInfo?.readyQuantity ??
                  0;
                const deliveredQuantity =
                  item.QuantityInfo?.DeliveredQuantity ??
                  item.quantityInfo?.deliveredQuantity ??
                  0;

                // Tính lại tổng số lượng
                const totalQuantity = Math.max(
                  0,
                  inStockQuantity + allocatedQuantity + readyQuantity
                );

                const branch = {
                  branchId: item.BranchId || item.branchId,
                  branchName: item.BranchName || item.branchName,
                  branchCode: item.BranchCode || item.branchCode,
                  branchAddress: item.BranchAddress || item.branchAddress,
                  quantityInfo: {
                    totalQuantity: totalQuantity,
                    inStockQuantity: inStockQuantity,
                    allocatedQuantity: allocatedQuantity,
                    readyQuantity: readyQuantity,
                    deliveredQuantity: deliveredQuantity,
                  },
                };

                return (
                  <tr key={branch.branchId}>
                    <td>
                      <div className="branch-info">
                        <div className="branch-name">{branch.branchName}</div>
                        <div className="branch-code">{branch.branchCode}</div>
                      </div>
                    </td>
                    <td>
                      <div className="warehouse-location-info">
                        <div className="branch-address">
                          {branch.branchAddress}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="quantity-info">
                        <div className="total-quantity-badge">
                          <span className="total-quantity">
                            {branch.quantityInfo.totalQuantity} xe
                          </span>
                        </div>
                        <div className="quantity-details">
                          InStock: {branch.quantityInfo.inStockQuantity} |
                          Allocated: {branch.quantityInfo.allocatedQuantity} |
                          Ready: {branch.quantityInfo.readyQuantity} |
                          Delivered: {branch.quantityInfo.deliveredQuantity}
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleViewDetails(branch)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {warehouseData.length === 0 && (
            <div className="no-data">
              <div className="no-data-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 6H16L14 4H10L8 6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM20 19H4V8H6.83L8.83 6H15.17L17.17 8H20V19ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17Z" />
                </svg>
              </div>
              <h3>Không tìm thấy dữ liệu</h3>
              <p>Không có kho nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          )}

          {/* Pagination */}
          {warehouseData.length > 0 && totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong
                tổng số {totalItems} kho
              </div>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  ««
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${
                        page === currentPage ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Chi tiết kho */}
        {showDetailModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                <h2>Chi tiết kho - {selectedBranch?.branchName}</h2>
                <button className="btn-secondary" onClick={handleCloseModal}>
                  Đóng
                </button>
              </div>

              <div className="modal-body">
                {loadingDetail ? (
                  <div className="loading-state">
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : (
                  <div className="inventory-detail">
                    {/* Product Summary - Flex Row */}
                    <div className="detail-summary">
                      <div className="summary-item">
                        <span className="label">Chi nhánh:</span>
                        <span className="value">
                          {selectedBranch?.branchName} ({selectedBranch?.branchCode})
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Địa chỉ:</span>
                        <span className="value">
                          {selectedBranch?.branchAddress}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Quyền sở hữu:</span>
                        <span className="value">Đại lý</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Tổng số xe:</span>
                        <span className="value highlight">
                          {selectedBranch?.quantityInfo.totalQuantity} xe
                        </span>
                      </div>
                    </div>

                    <div className="status-breakdown">
                      <h3>Phân loại theo trạng thái (Click để xem VIN)</h3>
                      <div className="status-grid">
                        <div
                          className={`status-card ${
                            selectedStatus === "InStock" ? "active" : ""
                          }`}
                          onClick={() => handleStatusClick("InStock")}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="status-label">InStock</span>
                          <span className="status-count">
                            {selectedBranch?.quantityInfo.inStockQuantity}
                          </span>
                        </div>
                        <div
                          className={`status-card ${
                            selectedStatus === "Allocated" ? "active" : ""
                          }`}
                          onClick={() => handleStatusClick("Allocated")}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="status-label">Allocated</span>
                          <span className="status-count">
                            {selectedBranch?.quantityInfo.allocatedQuantity}
                          </span>
                        </div>
                        <div
                          className={`status-card ${
                            selectedStatus === "Ready" ? "active" : ""
                          }`}
                          onClick={() => handleStatusClick("Ready")}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="status-label">Ready</span>
                          <span className="status-count">
                            {selectedBranch?.quantityInfo.readyQuantity}
                          </span>
                        </div>
                        <div
                          className={`status-card ${
                            selectedStatus === "Delivered" ? "active" : ""
                          }`}
                          onClick={() => handleStatusClick("Delivered")}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="status-label">Delivered</span>
                          <span className="status-count">
                            {selectedBranch?.quantityInfo.deliveredQuantity}
                          </span>
                        </div>
                      </div>

                      {/* Danh sách VIN */}
                      {selectedStatus && (
                        <div className="vin-list-section">
                          <h4>
                            Danh sách VIN - {selectedStatus} ({vinList.length})
                          </h4>
                          {vinList.length > 0 ? (
                            <div className="product-group-list">
                              {Object.entries(groupVinsByProduct()).map(
                                ([productKey, group]) => {
                                  const isExpanded = expandedProducts.has(productKey);
                                  return (
                                    <div
                                      key={productKey}
                                      className="product-group-item"
                                    >
                                      <div
                                        className="product-group-header"
                                        onClick={() => toggleProduct(productKey)}
                                      >
                                        <div className="product-group-info">
                                          <span className="expand-icon">
                                            {isExpanded ? (
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                              >
                                                <path d="M18 15l-6-6-6 6" />
                                              </svg>
                                            ) : (
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                              >
                                                <path d="M6 9l6 6 6-6" />
                                              </svg>
                                            )}
                                          </span>
                                          <span className="product-name">
                                            {group.productName} - {group.colorName}
                                          </span>
                                          <span className="product-count">
                                            ({group.vins.length} VIN)
                                          </span>
                                        </div>
                                      </div>
                                      {isExpanded && (
                                        <div className="product-vins-container">
                                          <table className="vin-table">
                                            <thead>
                                              <tr>
                                                <th>STT</th>
                                                <th>VIN</th>
                                                <th>Order ID</th>
                                                <th>PO ID</th>
                                                <th>Ngày nhận</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {group.vins.map((vin, index) => {
                                                const formatDate = (dateString) => {
                                                  if (!dateString) return "N/A";
                                                  try {
                                                    const date = new Date(dateString);
                                                    return date.toLocaleDateString("vi-VN", {
                                                      year: "numeric",
                                                      month: "2-digit",
                                                      day: "2-digit",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    });
                                                  } catch {
                                                    return dateString;
                                                  }
                                                };

                                                return (
                                                  <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td className="vin-code">
                                                      {vin.vinNumber || vin.vin}
                                                    </td>
                                                    <td>
                                                      {vin.orderId ? (
                                                        <span className="id-badge">
                                                          {vin.orderId}
                                                        </span>
                                                      ) : (
                                                        "N/A"
                                                      )}
                                                    </td>
                                                    <td>
                                                      {vin.poId ? (
                                                        <span className="id-badge">
                                                          {vin.poId}
                                                        </span>
                                                      ) : (
                                                        "N/A"
                                                      )}
                                                    </td>
                                                    <td>{formatDate(vin.receivedAt)}</td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <p className="no-vins">
                              Không có VIN nào trong trạng thái này.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {detailedInventory.length > 0 &&
                      detailedInventory[0]?.QuantityInfo?.ProductBreakdown && (
                        <div className="product-breakdown">
                          <h3>Phân loại theo sản phẩm</h3>
                          <table className="product-table">
                            <thead>
                              <tr>
                                <th>Sản phẩm</th>
                                <th>Màu sắc</th>
                                <th>Tổng</th>
                                <th>InStock</th>
                                <th>Allocated</th>
                                <th>Ready</th>
                                <th>Delivered</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailedInventory[0].QuantityInfo.ProductBreakdown.map(
                                (product, idx) => (
                                  <tr key={idx}>
                                    <td>{product.ProductName}</td>
                                    <td>{product.ColorName || "N/A"}</td>
                                    <td>
                                      <strong>{product.TotalCount}</strong>
                                    </td>
                                    <td>{product.InStockCount}</td>
                                    <td>{product.AllocatedCount}</td>
                                    <td>{product.ReadyCount}</td>
                                    <td>{product.DeliveredCount}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                    {(!detailedInventory[0]?.QuantityInfo?.ProductBreakdown ||
                      detailedInventory[0].QuantityInfo.ProductBreakdown
                        .length === 0) &&
                      selectedBranch?.quantityInfo.inStockQuantity === 0 && (
                        <div className="no-products">
                          <p>Không có sản phẩm nào trong kho này.</p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
