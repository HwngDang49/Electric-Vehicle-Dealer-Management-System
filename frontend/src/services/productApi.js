// Product Management API Service
import apiClient from "./api";
import { API_ENDPOINTS } from "./constants";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Product Management API Service
 * Contains all API calls related to product management
 */
class ProductApiService {
  /**
   * Get all products
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  async getProducts(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `${
            API_ENDPOINTS?.PRODUCTS?.LIST ?? "/api/product/list"
          }?${queryString}`
        : API_ENDPOINTS?.PRODUCTS?.LIST ?? "/api/product/list";

      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get product by ID
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>}
   */
  async getProductById(id) {
    try {
      const url =
        API_ENDPOINTS?.PRODUCTS?.GET_BY_ID?.(id) ?? `/api/product/${id}`;
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>}
   */
  async createProduct(productData) {
    try {
      const url = API_ENDPOINTS?.PRODUCTS?.CREATE ?? "/api/product";
      const response = await apiClient.post(url, productData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update product
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateProduct(id, updateData) {
    try {
      const url = API_ENDPOINTS?.PRODUCTS?.UPDATE?.(id) ?? `/api/product/${id}`;
      const response = await apiClient.put(url, updateData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete product
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async deleteProduct(id) {
    try {
      const url = API_ENDPOINTS?.PRODUCTS?.DELETE?.(id) ?? `/api/product/${id}`;
      const response = await apiClient.delete(url);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search products
   * @param {string} searchTerm
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async searchProducts(searchTerm, filters = {}) {
    try {
      const searchParams = { search: searchTerm, ...filters };
      return await this.getProducts(searchParams);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

const productApiService = new ProductApiService();
export default productApiService;
