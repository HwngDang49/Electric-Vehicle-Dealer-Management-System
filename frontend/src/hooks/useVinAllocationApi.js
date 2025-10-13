// Custom hook for VIN Allocation API operations
import { useState, useCallback } from "react";
import vinAllocationApiService from "../services/vinAllocationApi";
import { API_STATUS } from "../services/constants";

/**
 * Custom hook for VIN allocation API operations
 * Provides state management and error handling for VIN allocation-related API calls
 */
export const useVinAllocationApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Generic API call handler
   * @param {Function} apiCall - API function to call
   * @param {Array} args - Arguments for the API call
   * @returns {Promise<Object>} - API response
   */
  const handleApiCall = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(...args);
      setData(response.data);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // VIN Allocation Operations
  const getVinAllocations = useCallback(
    async (filters = {}) => {
      return handleApiCall(vinAllocationApiService.getVinAllocations, filters);
    },
    [handleApiCall]
  );

  const getVinAllocationById = useCallback(
    async (id) => {
      return handleApiCall(vinAllocationApiService.getVinAllocationById, id);
    },
    [handleApiCall]
  );

  const getAvailableVins = useCallback(
    async (filters = {}) => {
      return handleApiCall(vinAllocationApiService.getAvailableVins, filters);
    },
    [handleApiCall]
  );

  const allocateVinToOrder = useCallback(
    async (orderId, allocationData) => {
      return handleApiCall(
        vinAllocationApiService.allocateVinToOrder,
        orderId,
        allocationData
      );
    },
    [handleApiCall]
  );

  const createVinAllocation = useCallback(
    async (allocationData) => {
      return handleApiCall(
        vinAllocationApiService.createVinAllocation,
        allocationData
      );
    },
    [handleApiCall]
  );

  const updateVinAllocation = useCallback(
    async (id, updateData) => {
      return handleApiCall(
        vinAllocationApiService.updateVinAllocation,
        id,
        updateData
      );
    },
    [handleApiCall]
  );

  const getVinAllocationByOrder = useCallback(
    async (orderId) => {
      return handleApiCall(
        vinAllocationApiService.getVinAllocationByOrder,
        orderId
      );
    },
    [handleApiCall]
  );

  const getVinAllocationByVin = useCallback(
    async (vin) => {
      return handleApiCall(vinAllocationApiService.getVinAllocationByVin, vin);
    },
    [handleApiCall]
  );

  const releaseVinAllocation = useCallback(
    async (id, releaseData = {}) => {
      return handleApiCall(
        vinAllocationApiService.releaseVinAllocation,
        id,
        releaseData
      );
    },
    [handleApiCall]
  );

  const searchVinAllocations = useCallback(
    async (searchTerm, filters = {}) => {
      return handleApiCall(
        vinAllocationApiService.searchVinAllocations,
        searchTerm,
        filters
      );
    },
    [handleApiCall]
  );

  const getVinAllocationStatistics = useCallback(
    async (filters = {}) => {
      return handleApiCall(
        vinAllocationApiService.getVinAllocationStatistics,
        filters
      );
    },
    [handleApiCall]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear data
  const clearData = useCallback(() => {
    setData(null);
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    // State
    loading,
    error,
    data,

    // Actions
    getVinAllocations,
    getVinAllocationById,
    getAvailableVins,
    allocateVinToOrder,
    createVinAllocation,
    updateVinAllocation,
    getVinAllocationByOrder,
    getVinAllocationByVin,
    releaseVinAllocation,
    searchVinAllocations,
    getVinAllocationStatistics,

    // Utilities
    clearError,
    clearData,
    reset,
  };
};

export default useVinAllocationApi;
