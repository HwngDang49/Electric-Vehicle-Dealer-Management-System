// Custom hook for Order API operations
import { useState, useCallback } from "react";
import orderApiService from "../services/orderApi";
import { API_STATUS } from "../services/constants";

/**
 * Custom hook for order API operations
 * Provides state management and error handling for order-related API calls
 */
export const useOrderApi = () => {
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

  // Order Operations
  const getOrders = useCallback(
    async (filters = {}) => {
      return handleApiCall(orderApiService.getOrders, filters);
    },
    [handleApiCall]
  );

  const getOrderById = useCallback(
    async (id) => {
      return handleApiCall(orderApiService.getOrderById, id);
    },
    [handleApiCall]
  );

  const createOrder = useCallback(
    async (orderData) => {
      return handleApiCall(orderApiService.createOrder, orderData);
    },
    [handleApiCall]
  );

  const updateOrder = useCallback(
    async (id, updateData) => {
      return handleApiCall(orderApiService.updateOrder, id, updateData);
    },
    [handleApiCall]
  );

  const updateOrderStatus = useCallback(
    async (id, status, additionalData = {}) => {
      return handleApiCall(
        orderApiService.updateOrderStatus,
        id,
        status,
        additionalData
      );
    },
    [handleApiCall]
  );

  const deleteOrder = useCallback(
    async (id) => {
      return handleApiCall(orderApiService.deleteOrder, id);
    },
    [handleApiCall]
  );

  const getOrdersByCustomer = useCallback(
    async (customerId, filters = {}) => {
      return handleApiCall(
        orderApiService.getOrdersByCustomer,
        customerId,
        filters
      );
    },
    [handleApiCall]
  );

  const getOrdersByStatus = useCallback(
    async (status, filters = {}) => {
      return handleApiCall(orderApiService.getOrdersByStatus, status, filters);
    },
    [handleApiCall]
  );

  const searchOrders = useCallback(
    async (searchTerm, filters = {}) => {
      return handleApiCall(orderApiService.searchOrders, searchTerm, filters);
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
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrdersByCustomer,
    getOrdersByStatus,
    searchOrders,

    // Utilities
    clearError,
    clearData,
    reset,
  };
};

export default useOrderApi;
