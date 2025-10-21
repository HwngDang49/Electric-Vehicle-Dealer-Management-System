// Pricebook Items API Service
// Dedicated service for handling pricebook_items API calls
import apiClient from "./api";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Pricebook Items API Service
 * Handles all API calls related to pricebook_items table
 */
class PricebookItemsApiService {
  /**
   * Get active pricebook items (using existing endpoint but treating as pricebook_items)
   * @returns {Promise<Object>} - API response
   */
  async getActivePricebookItems() {
    try {
      // Use existing endpoint but treat it as if it's from pricebook_items table
      const url = "/pricebooks/active";
      console.log(
        `🔄 Fetching active pricebook items (treating as pricebook_items data)`
      );
      const response = await apiClient.get(url);
      const result = handleApiResponse(response);

      // Extract items and map to pricebook_items format
      const pricebookItems = (result?.items || []).map((item) => ({
        pricebookItemId: item.pricebookItemId,
        pricebookId: result.pricebookId,
        productId: item.productId,
        productName: item.productName,
        modelCode: item.modelCode,
        variantCode: item.variantCode,
        msrpPrice: item.msrpPrice,
        floorPrice: item.floorPrice,
        oemDiscountAmount: item.oemDiscountAmount,
        oemDiscountPercent: item.oemDiscountPercent,
        createdAt: item.createdAt,
      }));

      return {
        data: pricebookItems,
        message:
          "Active pricebook items loaded (mapped as pricebook_items format)",
      };
    } catch (error) {
      console.error(`❌ Error fetching active pricebook items:`, error);
      throw handleApiError(error);
    }
  }
}

// Create and export singleton instance
const pricebookItemsApiService = new PricebookItemsApiService();
export default pricebookItemsApiService;
