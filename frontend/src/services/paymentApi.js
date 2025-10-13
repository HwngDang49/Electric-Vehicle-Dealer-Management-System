import api from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiError } from "./utils";

export const createPayment = async (paymentData) => {
  try {
    const response = await api.post(API_ENDPOINTS.PAYMENTS, paymentData);
    return response.data;
  } catch (error) {
    handleApiError(error, "Error creating payment");
  }
};

export const getPayments = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.PAYMENTS);
    return response.data;
  } catch (error) {
    handleApiError(error, "Error fetching payments");
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.PAYMENTS}/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error, `Error fetching payment with ID ${id}`);
  }
};

export const updatePayment = async (id, paymentData) => {
  try {
    const response = await api.put(
      `${API_ENDPOINTS.PAYMENTS}/${id}`,
      paymentData
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `Error updating payment with ID ${id}`);
  }
};

export const deletePayment = async (id) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.PAYMENTS}/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error, `Error deleting payment with ID ${id}`);
  }
};
