import React, { useState, useEffect } from "react";
import "./PricebookManagement.css";
import pricebookApiService from "../../services/pricebookApi";
import dealerApiService from "../../services/dealerApi";
import CreatePricebookModal from "./CreatePricebookModal";
import PricebookDetailModal from "./PricebookDetailModal";
import CustomDropdown from "./CustomDropdown";

const PricebookManagement = () => {
  const [pricebooks, setPricebooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPricebookId, setSelectedPricebookId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [dealerIdToCode, setDealerIdToCode] = useState({});

  useEffect(() => {
    loadPricebooks();
    loadDealerCodes();
  }, []);

  const loadDealerCodes = async () => {
    try {
      const res = await dealerApiService.getDealers();
      const list = res.data || res || [];
      const map = {};
      list.forEach((d) => {
        const id = d.id || d.dealerId;
        if (id != null) {
          map[id] = d.code;
        }
      });
      setDealerIdToCode(map);
    } catch (e) {
      console.error("Error loading dealer codes", e);
    }
  };

  const loadPricebooks = async (status = "") => {
    setLoading(true);
    setError(null);
    try {
      const filters = status ? { status } : {};
      const response = await pricebookApiService.getPricebooks(filters);
      console.log("Pricebooks API response:", response);
      
      // Backend returns { message: "...", data: [...] }
      // handleApiResponse wraps it as { status, data: { message, data }, ... }
      const fetchedPricebooks = response.data?.data || response.data || response || [];
      
      // Ensure it's an array before sorting
      const pricebooksArray = Array.isArray(fetchedPricebooks) ? fetchedPricebooks : [];
      
      const sortedPricebooks = pricebooksArray.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      setPricebooks(sortedPricebooks);
      return sortedPricebooks;
    } catch (err) {
      setError("Không thể tải danh sách bảng giá");
      console.error("Error loading pricebooks:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim() && !statusFilter) {
      loadPricebooks();
      return;
    }
    
    setLoading(true);
    try {
      const filtered = pricebooks.filter(pb =>
        pb.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const sortedFiltered = filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      setPricebooks(sortedFiltered);
    } catch (err) {
      setError("Không thể tìm kiếm bảng giá");
      console.error("Error searching pricebooks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    loadPricebooks(status);
  };

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", icon: "⏸️" },
    { value: "Expired", label: "Hết hạn", icon: "❌" }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { text: "Hoạt động", class: "status-active" },
      Inactive: { text: "Không hoạt động", class: "status-inactive" },
      Expired: { text: "Hết hạn", class: "status-closed" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString('vi-VN');
    } catch {
      return "-";
    }
  };

  const filteredPricebooks = pricebooks.filter(pb =>
    pb.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-pricebook-management-app">
      <div className="pricebook-management">
      <div className="management-toolbar">
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm bảng giá theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
          <CustomDropdown
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={statusOptions}
            minWidth="220px"
          />
        </div>
        <button
          className="create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Thêm Bảng giá
        </button>
      </div>

      {error && (
        <div className="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="pricebooks-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách bảng giá...</p>
          </div>
        ) : (
          <table className="pricebooks-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Bảng giá</th>
                <th>Dealer</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Số sản phẩm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPricebooks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    {searchTerm ? "Không tìm thấy bảng giá nào" : "Chưa có bảng giá nào"}
                  </td>
                </tr>
              ) : (
                filteredPricebooks.map((pricebook, index) => (
                  <tr key={pricebook.pricebookId || `pricebook-${index}`}>
                    <td>
                      <span className="pricebook-id">{pricebook.pricebookId}</span>
                    </td>
                    <td>
                      <span className="pricebook-name">{pricebook.name}</span>
                    </td>
                    <td>
                      <span className="dealer-name">
                        {pricebook.dealerId 
                          ? (dealerIdToCode[pricebook.dealerId] || `#${pricebook.dealerId}`)
                          : "Global"}
                      </span>
                    </td>
                    <td>
                      <span className="date-value">{formatDate(pricebook.effectiveFrom)}</span>
                    </td>
                    <td>
                      <span className="date-value">{formatDate(pricebook.effectiveTo)}</span>
                    </td>
                    <td>
                      <span className="item-count">{pricebook.itemCount || 0}</span>
                    </td>
                    <td>{getStatusBadge(pricebook.status)}</td>
                    <td>
                      <button
                        className="view-detail-btn"
                        onClick={() => setSelectedPricebookId(pricebook.pricebookId)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <CreatePricebookModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadPricebooks();
          }}
        />
      )}

      {selectedPricebookId && (
        <PricebookDetailModal
          pricebookId={selectedPricebookId}
          onClose={() => setSelectedPricebookId(null)}
          onUpdate={() => loadPricebooks()}
        />
      )}
      </div>
    </div>
  );
};

export default PricebookManagement;

