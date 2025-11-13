import apiClient from "./api";

class RebateApiService {
  /**
   * Get my claims (for Dealer Manager/Staff - their own dealer's claims)
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>}
   */
  async getMyClaims(filters = {}) {
    try {
      const { agreementId, period, status, page = 1, pageSize = 20 } = filters;
      const params = {};
      if (agreementId) params.agreementId = agreementId;
      if (period) params.period = period;
      if (status) params.status = status;
      params.page = page;
      params.pageSize = pageSize;

      const response = await apiClient.get("/my-claims", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching my claims:", error);
      throw error;
    }
  }

  /**
   * Get list of claims (for EVM Staff/Admin)
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>}
   */
  async getClaims(filters = {}) {
    try {
      const {
        dealerId,
        agreementId,
        period,
        status,
        page = 1,
        pageSize = 20,
      } = filters;
      const params = {};
      if (dealerId) params.dealerId = dealerId;
      if (agreementId) params.agreementId = agreementId;
      if (period) params.period = period;
      if (status) params.status = status;
      params.page = page;
      params.pageSize = pageSize;

      const response = await apiClient.get("/claims", {
        params,
      });
      
      // Handle PagedResult response structure and normalize field names
      const data = response.data;
      if (data && data.items && Array.isArray(data.items)) {
        return {
          ...data,
          items: data.items.map(claim => ({
            claimId: claim.claimId ?? claim.ClaimId,
            dealerId: claim.dealerId ?? claim.DealerId,
            dealerName: claim.dealerName ?? claim.DealerName,
            agreementId: claim.agreementId ?? claim.AgreementId,
            agreementCode: claim.agreementCode ?? claim.AgreementCode,
            period: claim.period ?? claim.Period,
            amount: claim.amount ?? claim.Amount,
            status: claim.status ?? claim.Status,
            createdAt: claim.createdAt ?? claim.CreatedAt,
            resolvedAt: claim.resolvedAt ?? claim.ResolvedAt,
          }))
        };
      }
      
      return data;
    } catch (error) {
      console.error("❌ Error fetching claims:", error);
      throw error;
    }
  }

  /**
   * Get list of rebate settlements (claims with settlements)
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>}
   */
  async getSettlements(filters = {}) {
    try {
      const {
        agreementId,
        period,
        claimStatus,
        page = 1,
        pageSize = 20,
      } = filters;
      const params = {};
      if (agreementId) params.agreementId = agreementId;
      if (period) params.period = period;
      if (claimStatus) params.claimStatus = claimStatus;
      params.page = page;
      params.pageSize = pageSize;

      const response = await apiClient.get("/rebates/settlements", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching settlements:", error);
      throw error;
    }
  }

  /**
   * Get rebate calculations
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>}
   */
  async getCalculations(filters = {}) {
    try {
      const { agreementId, period, page = 1, pageSize = 20 } = filters;
      const params = {};
      if (agreementId) params.agreementId = agreementId;
      if (period) params.period = period;
      params.page = page;
      params.pageSize = pageSize;

      const response = await apiClient.get("/rebates/calculations", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching rebate calculations:", error);
      throw error;
    }
  }

  /**
   * Get rebate report
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>}
   */
  async getReport(filters = {}) {
    try {
      const { agreementId, periodFrom, periodTo } = filters;
      const params = {};
      if (agreementId) params.agreementId = agreementId;
      if (periodFrom) params.periodFrom = periodFrom;
      if (periodTo) params.periodTo = periodTo;

      const response = await apiClient.get("/rebates/report", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching rebate report:", error);
      throw error;
    }
  }

  /**
   * Get claim detail by ID (for Admin/EVM Staff)
   * @param {number} claimId - Claim ID
   * @returns {Promise<Object>}
   */
  async getClaimDetail(claimId) {
    try {
      const response = await apiClient.get(`/claims/${claimId}`);
      // Handle Ardalis.Result format or direct response
      const claimData = response.data?.value || response.data?.data || response.data;
      
      // Map PascalCase to camelCase if needed
      if (claimData && typeof claimData === 'object') {
        return {
          claimId: claimData.claimId ?? claimData.ClaimId,
          dealerId: claimData.dealerId ?? claimData.DealerId,
          dealerName: claimData.dealerName ?? claimData.DealerName,
          agreementId: claimData.agreementId ?? claimData.AgreementId,
          agreementCode: claimData.agreementCode ?? claimData.AgreementCode,
          period: claimData.period ?? claimData.Period,
          amount: claimData.amount ?? claimData.Amount,
          status: claimData.status ?? claimData.Status,
          createdAt: claimData.createdAt ?? claimData.CreatedAt,
          resolvedAt: claimData.resolvedAt ?? claimData.ResolvedAt,
          totalPaid: claimData.totalPaid ?? claimData.TotalPaid,
          remainingAmount: claimData.remainingAmount ?? claimData.RemainingAmount,
          settlements: (claimData.settlements ?? claimData.Settlements ?? []).map(s => ({
            settlementId: s.settlementId ?? s.SettlementId,
            paidAmount: s.paidAmount ?? s.PaidAmount,
            paidAt: s.paidAt ?? s.PaidAt,
            referenceNo: s.referenceNo ?? s.ReferenceNo
          }))
        };
      }
      
      return claimData;
    } catch (error) {
      console.error("❌ Error fetching claim detail:", error);
      throw error;
    }
  }

  /**
   * Get my claim detail by ID (for DealerManager/DealerStaff - their own dealer's claim)
   * @param {number} claimId - Claim ID
   * @returns {Promise<Object>}
   */
  async getMyClaimDetail(claimId) {
    try {
      const response = await apiClient.get(`/my-claims/${claimId}`);
      // Handle Ardalis.Result format or direct response
      const claimData = response.data?.value || response.data?.data || response.data;
      
      // Map PascalCase to camelCase if needed
      if (claimData && typeof claimData === 'object') {
        return {
          claimId: claimData.claimId ?? claimData.ClaimId,
          dealerId: claimData.dealerId ?? claimData.DealerId,
          dealerName: claimData.dealerName ?? claimData.DealerName,
          agreementId: claimData.agreementId ?? claimData.AgreementId,
          agreementCode: claimData.agreementCode ?? claimData.AgreementCode,
          period: claimData.period ?? claimData.Period,
          amount: claimData.amount ?? claimData.Amount,
          status: claimData.status ?? claimData.Status,
          createdAt: claimData.createdAt ?? claimData.CreatedAt,
          resolvedAt: claimData.resolvedAt ?? claimData.ResolvedAt,
          totalPaid: claimData.totalPaid ?? claimData.TotalPaid,
          remainingAmount: claimData.remainingAmount ?? claimData.RemainingAmount,
          settlements: (claimData.settlements ?? claimData.Settlements ?? []).map(s => ({
            settlementId: s.settlementId ?? s.SettlementId,
            paidAmount: s.paidAmount ?? s.PaidAmount,
            paidAt: s.paidAt ?? s.PaidAt,
            referenceNo: s.referenceNo ?? s.ReferenceNo
          }))
        };
      }
      
      return claimData;
    } catch (error) {
      console.error("❌ Error fetching my claim detail:", error);
      throw error;
    }
  }

  /**
   * Create new settlement for a claim
   * @param {Object} settlementData - Settlement data
   * @returns {Promise<Object>}
   */
  async createSettlement(settlementData) {
    try {
      console.log("💰 Creating settlement...", settlementData);

      const response = await apiClient.post(
        "/rebates/settlements",
        settlementData
      );

      console.log("✅ Settlement created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating settlement:", error);
      throw error;
    }
  }

  /**
   * Create VNPay payment URL for settlement
   * @param {Object} paymentData - Payment data { claimId, paidAmount }
   * @returns {Promise<Object>} { paymentUrl: string }
   */
  async createSettlementPaymentUrl(paymentData) {
    try {
      console.log(
        "💰 Creating VNPay payment URL for settlement...",
        paymentData
      );

      const response = await apiClient.post(
        "/vnpay/settlement/create",
        paymentData
      );

      console.log("✅ VNPay payment URL created:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating VNPay payment URL:", error);
      throw error;
    }
  }

  /**
   * Approve a claim
   * @param {number} claimId - Claim ID
   * @returns {Promise<Object>}
   */
  async approveClaim(claimId) {
    try {
      const response = await apiClient.post(`/claims/${claimId}/approve`);
      return response.data;
    } catch (error) {
      console.error("❌ Error approving claim:", error);
      throw error;
    }
  }

  /**
   * Reject a claim
   * @param {number} claimId - Claim ID
   * @param {string} reason - Optional rejection reason
   * @returns {Promise<Object>}
   */
  async rejectClaim(claimId, reason = null) {
    try {
      const response = await apiClient.post(`/claims/${claimId}/reject`, {
        reason: reason,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error rejecting claim:", error);
      throw error;
    }
  }
}

const rebateApiService = new RebateApiService();
export default rebateApiService;
