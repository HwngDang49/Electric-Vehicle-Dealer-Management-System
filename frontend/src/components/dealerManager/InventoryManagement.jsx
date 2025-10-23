import React, { useState, useEffect } from "react";
import "./InventoryManagement.css";
import { vinApiService } from "../../services";

const InventoryManagement = () => {
  const [warehouseData, setWarehouseData] = useState([]);

  // Load data khi component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await vinApiService.getVinList({});

      // Fallback data nếu API không trả về dữ liệu
      const fallbackData = [
        {
          branchId: 1,
          branchName: "Chi nhánh Thủ Đức",
          branchCode: "TD001",
          branchAddress: "123 đường Lê Văn Việt",
          quantityInfo: {
            totalQuantity: 0,
            inStockQuantity: 0,
            allocatedQuantity: 0,
            readyQuantity: 0,
            deliveredQuantity: 0,
            productBreakdown: [],
          },
          lastUpdated: new Date(),
        },
        {
          branchId: 2,
          branchName: "Chi nhánh Hà Nội",
          branchCode: "HN001",
          branchAddress: "456 đường Cầu Giấy",
          quantityInfo: {
            totalQuantity: 15,
            inStockQuantity: 10,
            allocatedQuantity: 3,
            readyQuantity: 2,
            deliveredQuantity: 0,
            productBreakdown: [],
          },
          lastUpdated: new Date(),
        },
      ];

      const dataToUse = data && data.length > 0 ? data : fallbackData;
      setWarehouseData(dataToUse);
    } catch (err) {
      console.error("Error loading warehouse data:", err);
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
              {warehouseData.map((item) => (
                <tr key={item.branchId}>
                  <td>
                    <div className="branch-info">
                      <div className="branch-name">{item.branchName}</div>
                      <div className="branch-code">{item.branchCode}</div>
                    </div>
                  </td>
                  <td>
                    <div className="warehouse-location-info">
                      <div className="branch-address">{item.branchAddress}</div>
                    </div>
                  </td>
                  <td>
                    <div className="quantity-info">
                      <div className="total-quantity">
                        {item.quantityInfo.totalQuantity} xe
                      </div>
                      <div className="quantity-details">
                        Có sẵn: {item.quantityInfo.inStockQuantity} | Đã phân
                        bổ: {item.quantityInfo.allocatedQuantity} | Sẵn sàng:{" "}
                        {item.quantityInfo.readyQuantity} | Đã giao:{" "}
                        {item.quantityInfo.deliveredQuantity}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button className="action-btn">Tổng quan kho</button>
                  </td>
                </tr>
              ))}
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
    </div>
  );
};

export default InventoryManagement;
