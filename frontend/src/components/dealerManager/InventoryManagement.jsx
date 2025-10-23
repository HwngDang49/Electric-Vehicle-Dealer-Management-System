import React, { useState, useEffect } from "react";
import "./InventoryManagement.css";
import { vinApiService } from "../../services";

const InventoryManagement = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailedInventory, setDetailedInventory] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [vinList, setVinList] = useState([]);

  // Load data khi component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await vinApiService.getVinList({});

      
        "✅ API Response Type:",
        Array.isArray(response) ? "Array" : typeof response
      );
      

      // Backend trả về array trực tiếp, không có .data wrapper
      const data = Array.isArray(response) ? response : response?.data || [];


      // Log chi tiết từng branch
      data.forEach((branch, index) => {
          branchId: branch.BranchId || branch.branchId,
          branchCode: branch.BranchCode || branch.branchCode,
          branchName: branch.BranchName || branch.branchName,
          totalVins:
            branch.QuantityInfo?.TotalQuantity ||
            branch.quantityInfo?.totalQuantity ||
            0,
          inStock:
            branch.QuantityInfo?.InStockQuantity ||
            branch.quantityInfo?.inStockQuantity ||
            0,
        });
      });

      setWarehouseData(data);
    } catch (err) {
      console.error("❌ Error loading warehouse data:", err);
      setWarehouseData([]);
    }
  };

  const handleViewDetails = async (branch) => {
    try {
      setSelectedBranch(branch);
      setLoadingDetail(true);
      setShowDetailModal(true);

        "🔍 Loading detailed inventory for branch:",
        branch.branchCode
      );

      // Gọi API để lấy chi tiết inventory của branch
      const response = await vinApiService.getVinList({
        branchId: branch.branchId,
      });

      

      setDetailedInventory(response || []);
    } catch (err) {
      console.error("❌ Error loading branch details:", err);
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
  };

  const handleStatusClick = async (status) => {
    try {
      setSelectedStatus(status);
      setVinList([]);
        `🔍 Loading VINs for status: ${status}, branch: ${selectedBranch.branchId}`
      );

      // Gọi API mới để lấy VIN chi tiết thực từ database
      const response = await vinApiService.getDetailVins({
        branchId: selectedBranch.branchId,
        status: status,
      });

      

      // Map response to vinList format
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
    } catch (err) {
      console.error(`❌ Error loading VINs for ${status}:`, err);
      setVinList([]);
    }
  };

  return (
    <div className="inventory-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý kho</h1>
        <p className="page-subtitle">
          Quản lý và theo dõi các kho của đại lý tại các chi nhánh
        </p>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-section">
        <div className="table-header">
          <h3 className="table-title">Danh sách kho đại lý</h3>
        </div>

        <div className="table-container">
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
              {warehouseData.map((item) => {
                // Map PascalCase từ backend sang camelCase
                const branch = {
                  branchId: item.BranchId || item.branchId,
                  branchName: item.BranchName || item.branchName,
                  branchCode: item.BranchCode || item.branchCode,
                  branchAddress: item.BranchAddress || item.branchAddress,
                  quantityInfo: {
                    totalQuantity:
                      item.QuantityInfo?.TotalQuantity ??
                      item.quantityInfo?.totalQuantity ??
                      0,
                    inStockQuantity:
                      item.QuantityInfo?.InStockQuantity ??
                      item.quantityInfo?.inStockQuantity ??
                      0,
                    allocatedQuantity:
                      item.QuantityInfo?.AllocatedQuantity ??
                      item.quantityInfo?.allocatedQuantity ??
                      0,
                    readyQuantity:
                      item.QuantityInfo?.ReadyQuantity ??
                      item.quantityInfo?.readyQuantity ??
                      0,
                    deliveredQuantity:
                      item.QuantityInfo?.DeliveredQuantity ??
                      item.quantityInfo?.deliveredQuantity ??
                      0,
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
                        <div className="total-quantity">
                          {branch.quantityInfo.totalQuantity} xe
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
        </div>

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
      </div>

      {/* Modal Chi tiết kho */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết kho - {selectedBranch?.branchName}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {loadingDetail ? (
                <div className="loading-state">
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : (
                <div className="inventory-detail">
                  <div className="detail-summary">
                    <div className="summary-item">
                      <span className="label">Mã chi nhánh:</span>
                      <span className="value">
                        {selectedBranch?.branchCode}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">
                        {selectedBranch?.branchAddress}
                      </span>
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
                          <div className="vin-table-container">
                            <table className="vin-table">
                              <thead>
                                <tr>
                                  <th>STT</th>
                                  <th>VIN</th>
                                  <th>Sản phẩm</th>
                                  <th>Màu sắc</th>
                                  <th>Trạng thái</th>
                                </tr>
                              </thead>
                              <tbody>
                                {vinList.map((vin, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="vin-code">
                                      {vin.vinNumber}
                                    </td>
                                    <td>{vin.productName}</td>
                                    <td>{vin.colorName || "N/A"}</td>
                                    <td>
                                      <span
                                        className={`vin-status ${vin.status.toLowerCase()}`}
                                      >
                                        {vin.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
                      .length === 0) && (
                    <div className="no-products">
                      <p>Không có sản phẩm nào trong kho này.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
