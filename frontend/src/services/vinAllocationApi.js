// VIN Allocation API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import {
  handleApiResponse,
  handleApiError,
  validateRequiredFields,
} from "./utils";

/**
 * VIN Allocation API Service
 * Contains all API calls related to VIN allocation
 */
class VinAllocationApiService {
  /**
   * Get all VIN allocations
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getVinAllocations(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS.VIN_ALLOCATION.LIST}?${queryString}`
        : API_ENDPOINTS.VIN_ALLOCATION.LIST;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get VIN allocation by ID
   * @param {string} id - VIN allocation ID
   * @returns {Promise<Object>} - API response
   */
  async getVinAllocationById(id) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.VIN_ALLOCATION.GET_BY_ID(id)
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get available VINs
   * @param {Object} filters - Filter parameters (vehicle type, color, etc.)
   * @returns {Promise<Object>} - API response
   */
  async getAvailableVins(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS.VIN_ALLOCATION.AVAILABLE_VINS}?${queryString}`
        : API_ENDPOINTS.VIN_ALLOCATION.AVAILABLE_VINS;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Allocate VIN to order
   * @param {string} orderId - Order ID
   * @param {Object} allocationData - VIN allocation data
   * @returns {Promise<Object>} - API response
   */
  async allocateVinToOrder(orderId, allocationData) {
    try {
      // Validate required fields
      const requiredFields = ["vin", "vehicleId"];
      const validation = validateRequiredFields(allocationData, requiredFields);

      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const formattedData = {
        ...allocationData,
        allocatedAt: new Date().toISOString(),
        status: "allocated",
      };

      const response = await apiClient.post(
        API_ENDPOINTS.VIN_ALLOCATION.ALLOCATE_VIN(orderId),
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create VIN allocation
   * @param {Object} allocationData - VIN allocation data
   * @returns {Promise<Object>} - API response
   */
  async createVinAllocation(allocationData) {
    try {
      // Validate required fields
      const requiredFields = ["orderId", "vin", "vehicleId"];
      const validation = validateRequiredFields(allocationData, requiredFields);

      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const formattedData = {
        ...allocationData,
        status: "allocated",
        allocatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const response = await apiClient.post(
        API_ENDPOINTS.VIN_ALLOCATION.CREATE,
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update VIN allocation
   * @param {string} id - VIN allocation ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - API response
   */
  async updateVinAllocation(id, updateData) {
    try {
      const formattedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const response = await apiClient.put(
        API_ENDPOINTS.VIN_ALLOCATION.UPDATE(id),
        formattedData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get VIN allocation by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - API response
   */
  async getVinAllocationByOrder(orderId) {
    try {
      const filters = { orderId };
      return await this.getVinAllocations(filters);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get VIN allocation by VIN
   * @param {string} vin - VIN number
   * @returns {Promise<Object>} - API response
   */
  async getVinAllocationByVin(vin) {
    try {
      const filters = { vin };
      return await this.getVinAllocations(filters);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Release VIN allocation
   * @param {string} id - VIN allocation ID
   * @param {Object} releaseData - Release data
   * @returns {Promise<Object>} - API response
   */
  async releaseVinAllocation(id, releaseData = {}) {
    try {
      const updateData = {
        status: "released",
        releasedAt: new Date().toISOString(),
        ...releaseData,
      };

      const response = await apiClient.patch(
        API_ENDPOINTS.VIN_ALLOCATION.UPDATE(id),
        updateData
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search VIN allocations
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - API response
   */
  async searchVinAllocations(searchTerm, filters = {}) {
    try {
      const searchParams = {
        search: searchTerm,
        ...filters,
      };

      return await this.getVinAllocations(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get VIN allocation statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getVinAllocationStatistics(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${API_ENDPOINTS.VIN_ALLOCATION.LIST}/statistics?${queryString}`
        : `${API_ENDPOINTS.VIN_ALLOCATION.LIST}/statistics`;

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Create and export singleton instance
const vinAllocationApiService = new VinAllocationApiService();
export default vinAllocationApiService;
