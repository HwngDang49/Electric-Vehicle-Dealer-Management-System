// Custom hook for Delivery API operations
import { useState, useCallback } from "react";
import deliveryApiService from "../services/deliveryApi";
import { API_STATUS } from "../services/constants";

/**
 * Custom hook for delivery API operations
 * Provides state management and error handling for delivery-related API calls
 */
export const useDeliveryApi = () => {
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

  // Delivery Schedule Operations
  const getDeliverySchedules = useCallback(
    async (filters = {}) => {
      return handleApiCall(deliveryApiService.getDeliverySchedules, filters);
    },
    [handleApiCall]
  );

  const getDeliveryScheduleById = useCallback(
    async (id) => {
      return handleApiCall(deliveryApiService.getDeliveryScheduleById, id);
    },
    [handleApiCall]
  );

  const getDeliveryScheduleByOrder = useCallback(
    async (orderId) => {
      return handleApiCall(
        deliveryApiService.getDeliveryScheduleByOrder,
        orderId
      );
    },
    [handleApiCall]
  );

  const createDeliverySchedule = useCallback(
    async (deliveryData) => {
      return handleApiCall(
        deliveryApiService.createDeliverySchedule,
        deliveryData
      );
    },
    [handleApiCall]
  );

  const updateDeliverySchedule = useCallback(
    async (id, updateData) => {
      return handleApiCall(
        deliveryApiService.updateDeliverySchedule,
        id,
        updateData
      );
    },
    [handleApiCall]
  );

  const deleteDeliverySchedule = useCallback(
    async (id) => {
      return handleApiCall(deliveryApiService.deleteDeliverySchedule, id);
    },
    [handleApiCall]
  );

  const updateDeliveryStatus = useCallback(
    async (id, status, additionalData = {}) => {
      return handleApiCall(
        deliveryApiService.updateDeliveryStatus,
        id,
        status,
        additionalData
      );
    },
    [handleApiCall]
  );

  const scheduleDelivery = useCallback(
    async (id, scheduleData) => {
      return handleApiCall(
        deliveryApiService.scheduleDelivery,
        id,
        scheduleData
      );
    },
    [handleApiCall]
  );

  const markAsDelivered = useCallback(
    async (id, deliveryData = {}) => {
      return handleApiCall(
        deliveryApiService.markAsDelivered,
        id,
        deliveryData
      );
    },
    [handleApiCall]
  );

  const getDeliveryStatistics = useCallback(
    async (filters = {}) => {
      return handleApiCall(deliveryApiService.getDeliveryStatistics, filters);
    },
    [handleApiCall]
  );

  const searchDeliverySchedules = useCallback(
    async (searchTerm, filters = {}) => {
      return handleApiCall(
        deliveryApiService.searchDeliverySchedules,
        searchTerm,
        filters
      );
    },
    [handleApiCall]
  );

  const getDeliverySchedulesByDateRange = useCallback(
    async (startDate, endDate, additionalFilters = {}) => {
      return handleApiCall(
        deliveryApiService.getDeliverySchedulesByDateRange,
        startDate,
        endDate,
        additionalFilters
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
    getDeliverySchedules,
    getDeliveryScheduleById,
    getDeliveryScheduleByOrder,
    createDeliverySchedule,
    updateDeliverySchedule,
    deleteDeliverySchedule,
    updateDeliveryStatus,
    scheduleDelivery,
    markAsDelivered,
    getDeliveryStatistics,
    searchDeliverySchedules,
    getDeliverySchedulesByDateRange,

    // Utilities
    clearError,
    clearData,
    reset,
  };
};

export default useDeliveryApi;
