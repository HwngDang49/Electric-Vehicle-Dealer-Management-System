import apiClient from "./api";

class RebateApiService {
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
}

const rebateApiService = new RebateApiService();
export default rebateApiService;
