import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./ContractView.css";
import { API_ENDPOINTS } from "../../services/constants";
import apiClient from "../../services/api";

const ContractView = ({ order, onBack, onContractCreated, onReloadOrder, initialToastMessage = null, onToastShown }) => {
  // Check if order has contract
  const [hasContract, setHasContract] = useState(order.hasContract || false);
  const [contractData, setContractData] = useState(
    order.contractData || {
      contractNumber: "",
      fileUrl: "",
      signedAt: "",
      isSigned: false,
      depositAmount: 0, // Thêm field deposit amount
    }
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  // Sync with order data
  useEffect(() => {
    setHasContract(order.hasContract || false);
    const contractDataFromOrder = order.contractData;
    setContractData(
      contractDataFromOrder || {
        contractNumber: "",
        fileUrl: "",
        signedAt: "", // Empty string thay vì null để tránh React warning
        isSigned: false,
        depositAmount: 0,
      }
    );
    // Nếu contractData có signedAt nhưng là null, set thành empty string
    if (contractDataFromOrder && contractDataFromOrder.signedAt === null) {
      setContractData(prev => ({
        ...prev,
        signedAt: "",
      }));
    }
  }, [order.hasContract, order.contractData, order.backendId]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  // Format date function - Backend đã convert sang VN time
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      let date;
      if (typeof dateString === "string") {
        // Backend đã convert sang VN time, nếu không có timezone info, thêm +07:00 để parse đúng
        let dateStr = dateString.trim();
        if (!dateStr.match(/[Z+-]\d{2}:?\d{2}$/)) {
          dateStr += "+07:00";
        }
        date = new Date(dateStr);
      } else if (typeof dateString === "number") {
        date = new Date(dateString);
      } else {
        date = dateString;
      }

      if (isNaN(date.getTime())) {
        return "-";
      }

      // Format với timezone VN (Asia/Ho_Chi_Minh)
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  // Show initial toast message if provided (after ContractView reloads)
  useEffect(() => {
    if (initialToastMessage) {
      showToast(initialToastMessage.type || "success", initialToastMessage.message);
      // Notify parent that toast has been shown
      if (onToastShown) {
        onToastShown();
      }
    }
  }, [initialToastMessage]);

  const handleGenerateNumber = () => {};

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      showToast("error", "Chỉ chấp nhận file PDF!");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("error", "File không được vượt quá 10MB!");
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

      setContractData((prev) => ({
        ...prev,
        fileUrl: fileUrl,
      }));

      showToast("success", `Upload file "${file.name}" thành công!`);
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors ||
        error.response?.data?.message ||
        error.message ||
        "Không thể upload file";
      showToast("error", errorMessage);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSendToESign = () => {
    alert("Đã gửi hợp đồng để ký điện tử");
  };

  const handleMarkAsSigned = async () => {
    try {
      setLoading(true);

      // Validate: Contract must be created first
      if (!order.hasContract) {
        showToast("error", "Vui lòng tạo hợp đồng trước khi ký!");
        setLoading(false);
        return;
      }

      console.log("📤 Marking contract as signed for order:", order.backendId);

      // Call backend API to mark contract as signed
      const response = await apiClient.patch(
        `/orders/${order.backendId}/mark-as-signed`
      );

      console.log("✅ Contract signed successfully:", response.data);

      // Extract signed date from response - Backend đã convert sang VN time
      const signedAtData =
        response.data?.value || response.data?.data || new Date().toISOString();
      const formattedDate = formatDate(signedAtData);

      // Update local state
      setContractData((prev) => ({
        ...prev,
        isSigned: true,
        signedAt: formattedDate,
      }));

      showToast("success", `Hợp đồng đã được ký thành công! Thời gian: ${formattedDate}`);

      // Notify parent to reload order data
      if (onContractCreated) {
        onContractCreated(order.id, {
          orderId: order.id,
          backendOrderId: order.backendId,
          isSigned: true,
          signedAt: formattedDate,
        });
      }
    } catch (error) {
      console.error("❌ Error signing contract:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors ||
        error.response?.data?.message ||
        error.message ||
        "Không thể ký hợp đồng";
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewContract = () => {
    setHasContract(true);
  };

  const handleConfirmOrder = () => {
    alert("Đã xác nhận đơn hàng với hợp đồng");
  };

  return (
    <div className="contract-view-app">
      {toast && ReactDOM.createPortal(
        <div className={`contract-toast ${toast.type === 'error' ? 'contract-toast-error' : ''}`} style={{ zIndex: 99999 }}>
          <div className="toast-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {toast.type === 'error' ? (<path d="M18 6L6 18M6 6l12 12" />) : (<path d="M20 6L9 17l-5-5" />)}
            </svg>
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.type === 'error' ? 'Thất bại' : 'Thành công'}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div className="toast-progress"></div>
        </div>, document.body)}

      <div className="contract-view">
      <div className="contract-content">
        {/* Header */}
        <div className="contract-header">
          <div className="header-info">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1>Hợp đồng đơn hàng {order.id}</h1>
              {order.hasContract && (
                <span
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ✓ Đã có hợp đồng
                </span>
              )}
            </div>
          </div>
          <button className="back-btn" onClick={onBack}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Contract Content */}
        <div className="contract-body">
          {!hasContract && !order.hasContract ? (
            // No contract - show create button
            <div className="no-contract-section">
              <div className="no-contract-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <polyline
                    points="14,2 14,8 20,8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="16"
                    y1="13"
                    x2="8"
                    y2="13"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="16"
                    y1="17"
                    x2="8"
                    y2="17"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <polyline
                    points="10,9 9,9 8,9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2>Chưa có hợp đồng</h2>
              <p>Đơn hàng này chưa có hợp đồng. Bạn có thể tạo hợp đồng mới.</p>
              <button
                className="create-contract-btn"
                onClick={handleCreateNewContract}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Tạo hợp đồng mới
              </button>
            </div>
          ) : (
            // Has contract - show contract form
            <div className="contract-form">
              {/* Contract File Section */}
              <div className="form-section">
                <h3>File hợp đồng (PDF)</h3>
                <div className="upload-area">
                  {uploading ? (
                    <div className="upload-zone">
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            border: "4px solid #e5e7eb",
                            borderTop: "4px solid #20c997",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 12px",
                          }}
                        />
                        <p style={{ color: "#20c997", fontWeight: "500" }}>
                          Đang upload file...
                        </p>
                      </div>
                    </div>
                  ) : selectedFile || contractData.fileUrl ? (
                    <div className={order.hasContract ? "file-display-card" : "uploaded-file"}>
                      <div className="file-info">
                        <div className="file-icon">
                          <svg
                            width="32"
                            height="32"
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
                      {contractData.fileUrl && (
                        <a
                          href={contractData.fileUrl}
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
                      {!order.hasContract && (
                        <button
                          className="remove-file-btn"
                          onClick={() => {
                            setSelectedFile(null);
                            setContractData((prev) => ({
                              ...prev,
                              fileUrl: "",
                            }));
                          }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="upload-zone">
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
                      <small style={{ color: "#666", marginTop: "4px" }}>
                        Tối đa 10MB
                      </small>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="pdf-upload"
                    disabled={order.hasContract || uploading}
                  />
                  {!order.hasContract && (
                    <label
                      htmlFor="pdf-upload"
                      className={`upload-btn ${uploading ? "disabled" : ""}`}
                      style={{
                        pointerEvents: uploading ? "none" : "auto",
                        opacity: uploading ? 0.5 : 1,
                      }}
                    >
                      {selectedFile || contractData.fileUrl
                        ? "Thay đổi PDF"
                        : "Chọn file PDF"}
                    </label>
                  )}
                </div>
              </div>

              {/* Deposit Amount Section */}
              <div className="form-section">
                <h3>Thông tin đặt cọc</h3>
                {order.hasContract ? (
                  // Display formatted deposit amount for existing contract
                  <div className="deposit-display">
                    <div className="deposit-label">Số tiền đặt cọc yêu cầu</div>
                    <div className="deposit-amount">
                      {new Intl.NumberFormat('vi-VN').format(contractData.depositAmount)} ₫
                    </div>
                  </div>
                ) : (
                  // Input for new contract
                  <div className="form-group">
                    <label>Số tiền đặt cọc yêu cầu (VND) *</label>
                    <input
                      type="number"
                      value={contractData.depositAmount}
                      onChange={(e) =>
                        setContractData((prev) => ({
                          ...prev,
                          depositAmount: e.target.value,
                        }))
                      }
                      placeholder="Nhập số tiền đặt cọc (VD: 50000000)"
                      min="0"
                      step="1000000"
                    />
                  </div>
                )}
              </div>

              {/* Sign Section - Only show when contract exists */}
              {order.hasContract && (
                <div className="form-section">
                  <h3>Sign</h3>
                  <div className="sign-actions">
                    <button
                      className="manual-sign-btn"
                      onClick={handleMarkAsSigned}
                      disabled={contractData.isSigned || loading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M9 12l2 2 4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      {loading
                        ? "Đang xử lý..."
                        : contractData.isSigned
                        ? "Đã ký"
                        : "Đánh dấu đã ký (thủ công)"}
                    </button>
                    <div className="signed-at-field">
                      <label>Thời gian ký</label>
                      <input
                        type="text"
                        value={contractData.signedAt ? formatDate(contractData.signedAt) : ""}
                        placeholder="—"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Contract Button - Only show when creating new contract */}
              {!order.hasContract && (
                <div className="form-section">
                  <button
                    className="confirm-contract-btn"
                    disabled={loading}
                    onClick={async () => {
                    try {
                      setLoading(true);

                      // Validate required fields
                      if (
                        !contractData.depositAmount ||
                        contractData.depositAmount <= 0
                      ) {
                        alert("Vui lòng nhập số tiền đặt cọc yêu cầu!");
                        setLoading(false);
                        return;
                      }

                      console.log(
                        "📤 Creating contract for order:",
                        order.backendId
                      );

                      // Call backend API to create contract
                      const response = await apiClient.post(
                        API_ENDPOINTS.ORDERS.CREATE_CONTRACT(order.backendId),
                        {
                          ContractFileUrl: contractData.fileUrl || null,
                          RequiredDepositAmount:
                            parseFloat(contractData.depositAmount) || 0,
                        }
                      );

                      console.log(
                        "✅ Contract created successfully:",
                        response.data
                      );

                      // Extract contract number from response
                      const contractNo =
                        response.data?.value ||
                        response.data?.data ||
                        "UNKNOWN";

                      // Save contract data for frontend display
                      const contractInfo = {
                        orderId: order.id,
                        backendOrderId: order.backendId,
                        contractNumber: contractNo,
                        fileUrl: contractData.fileUrl,
                        signedAt: contractData.signedAt,
                        isSigned: contractData.isSigned,
                        depositAmount: contractData.depositAmount,
                      };

                      // Reload order data first
                      if (onReloadOrder) {
                        await onReloadOrder();
                      }

                      // Small delay to ensure order data is updated
                      await new Promise(resolve => setTimeout(resolve, 50));

                      // Update local state to reflect contract creation
                      setHasContract(true);
                      setContractData((prev) => ({
                        ...prev,
                        contractNumber: contractNo,
                      }));

                      // Notify parent about contract creation - this will trigger ContractView reload and show toast
                      // Toast will be shown in the reloaded ContractView via initialToastMessage prop
                      if (onContractCreated) {
                        onContractCreated(order.id, contractInfo);
                      }
                    } catch (error) {
                      console.error("❌ Error creating contract:", error);
                      const errorMessage =
                        error.response?.data?.errors?.[0] ||
                        error.response?.data?.errors ||
                        error.response?.data?.message ||
                        error.message ||
                        "Không thể tạo hợp đồng";
                      showToast("error", errorMessage);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Đang xử lý..." : "Tạo hợp đồng"}
                </button>
              </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ContractView;
