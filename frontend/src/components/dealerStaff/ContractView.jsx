import React, { useState, useEffect } from "react";
import "./ContractView.css";
import { API_ENDPOINTS } from "../../services/constants";
import apiClient from "../../services/api";

const ContractView = ({ order, onBack, onContractCreated }) => {
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

  // Sync with order data
  useEffect(() => {
    setHasContract(order.hasContract || false);
    setContractData(
      order.contractData || {
        contractNumber: "",
        fileUrl: "",
        signedAt: "",
        isSigned: false,
        depositAmount: 0,
      }
    );
  }, [order.hasContract, order.contractData]);

  const handleGenerateNumber = () => {};

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

      const response = await apiClient.post("/files/upload", formData, {
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

      alert(`✅ Upload thành công!\nURL: ${fileUrl}`);
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

  const handleSendToESign = () => {
    alert("Đã gửi hợp đồng để ký điện tử");
  };

  const handleMarkAsSigned = async () => {
    try {
      setLoading(true);

      // Validate: Contract must be created first
      if (!order.hasContract) {
        alert("Vui lòng tạo hợp đồng trước khi ký!");
        setLoading(false);
        return;
      }

      console.log("📤 Marking contract as signed for order:", order.backendId);

      // Call backend API to mark contract as signed
      const response = await apiClient.patch(
        `/orders/${order.backendId}/mark-as-signed`
      );

      console.log("✅ Contract signed successfully:", response.data);

      // Extract signed date from response
      const signedAtData =
        response.data?.value || response.data?.data || new Date().toISOString();
      const signedAtDate = new Date(signedAtData);
      const formattedDate = signedAtDate.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Update local state
      setContractData((prev) => ({
        ...prev,
        isSigned: true,
        signedAt: formattedDate,
      }));

      alert(`✅ Hợp đồng đã được ký thành công!\nThời gian: ${formattedDate}`);

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
        error.response?.data?.message ||
        error.message ||
        "Không thể ký hợp đồng";
      alert(`Lỗi: ${errorMessage}`);
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
                            borderTop: "4px solid #6366f1",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 12px",
                          }}
                        />
                        <p style={{ color: "#6366f1", fontWeight: "500" }}>
                          Đang upload file...
                        </p>
                      </div>
                    </div>
                  ) : selectedFile || contractData.fileUrl ? (
                    <div className={order.hasContract ? "file-display-card" : "uploaded-file"}>
                      <div className="file-info">
                        <div className="file-icon">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={order.hasContract ? "#dc2626" : "#6366f1"}
                            strokeWidth="2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                            <text x="7" y="17" fontSize="8" fill={order.hasContract ? "#dc2626" : "#6366f1"} fontWeight="bold">PDF</text>
                          </svg>
                        </div>
                        <div className="file-details">
                          <p className="file-name">
                            {selectedFile?.name || "File hợp đồng đã upload"}
                          </p>
                          {selectedFile && (
                            <p className="file-size">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                          {contractData.fileUrl && (
                            <a
                              href={contractData.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-file-link"
                            >
                              Xem file →
                            </a>
                          )}
                        </div>
                      </div>
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
                        : "Mark as Signed (manual)"}
                    </button>
                    <div className="signed-at-field">
                      <label>Signed at</label>
                      <input
                        type="text"
                        value={contractData.signedAt}
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

                      // Show success message
                      alert(
                        `✅ Hợp đồng đã được tạo thành công!\nMã hợp đồng: ${contractNo}`
                      );

                      // Update order status to "has contract" (this will close modal and reload data)
                      if (onContractCreated) {
                        onContractCreated(order.id, contractInfo);
                      }
                    } catch (error) {
                      console.error("❌ Error creating contract:", error);
                      const errorMessage =
                        error.response?.data?.errors?.[0] ||
                        error.response?.data?.message ||
                        error.message ||
                        "Không thể tạo hợp đồng";
                      alert(`Lỗi: ${errorMessage}`);
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
  );
};

export default ContractView;
