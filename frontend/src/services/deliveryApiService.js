import apiClient from './api';
import { API_ENDPOINTS } from './constants';

const deliveryApiService = {
  /**
   * Get list of deliveries
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status: 'allocated', 'ready', 'delivered', 'all'
   * @param {number} params.pageNumber - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   */
  getDeliveryList: async (params = {}) => {
    try {
      const { status, pageNumber = 1, pageSize = 10 } = params;
      
      const queryParams = new URLSearchParams();
      queryParams.append('pageNumber', pageNumber.toString());
      queryParams.append('pageSize', pageSize.toString());

      if (status) {
        queryParams.append('status', status);
      }

      const response = await apiClient.get(
        `${API_ENDPOINTS.ORDERS.DELIVERIES}?${queryParams.toString()}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching delivery list:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch delivery list',
      };
    }
  },

  /**
   * Schedule delivery for an order
   * @param {number} orderId - Order ID
   * @param {Object} deliveryData - Delivery information
   */
  scheduleDelivery: async (orderId, deliveryData) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ORDERS.SCHEDULE_DELIVERY,
        {
          orderId: orderId,
          deliveryDate: deliveryData.deliveryDate,
          deliveryTimeSlot: deliveryData.deliveryTimeSlot || 'Morning',
          deliveryAddress: deliveryData.deliveryAddress,
          contactPhone: deliveryData.contactPhone,
          contactName: deliveryData.contactName,
          notes: deliveryData.notes,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to schedule delivery',
      };
    }
  },

  /**
   * Complete delivery for an order
   * @param {number} orderId - Order ID
   * @param {Object} deliveryData - Completion data
   */
  completeDelivery: async (orderId, deliveryData) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ORDERS.COMPLETE_DELIVERY,
        {
          orderId: orderId,
          deliveryDocUrl: deliveryData.deliveryDocUrl,
          notes: deliveryData.notes,
          actualDeliveryTime: deliveryData.actualDeliveryTime,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error completing delivery:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to complete delivery',
      };
    }
  },
};

export default deliveryApiService;

