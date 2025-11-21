/**
 * Utility to decode JWT token with proper UTF-8 handling for Vietnamese characters
 * Fixes the issue where atob() doesn't handle UTF-8 correctly
 */

/**
 * Decode base64 string with proper UTF-8 handling
 * @param {string} base64 - Base64 encoded string
 * @returns {string} - Decoded UTF-8 string
 */
function base64UrlDecode(base64) {
  // Replace URL-safe characters
  let base64String = base64.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  const padding = base64String.length % 4;
  if (padding) {
    base64String += '='.repeat(4 - padding);
  }
  
  // Decode base64
  const binaryString = atob(base64String);
  
  // Convert to UTF-8
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Decode UTF-8
  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    // Fallback for older browsers
    return decodeURIComponent(escape(binaryString));
  }
}

/**
 * Decode JWT token and return payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export function decodeJWT(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Get user info from JWT token
 * @param {string} token - JWT token
 * @returns {object} - User info with name, email, userId, etc.
 */
export function getUserInfoFromToken(token) {
  const payload = decodeJWT(token);
  
  if (!payload) {
    return {
      name: null,
      email: null,
      userId: null,
      role: null,
      dealerId: null,
      branchId: null,
    };
  }

  const result = {
    name:
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      payload['name'] ||
      payload['fullName'] ||
      payload['FullName'] ||
      null,
    email:
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      payload['email'] ||
      payload['Email'] ||
      null,
    userId:
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      payload['sub'] ||
      payload['userId'] ||
      null,
    role:
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload['role'] ||
      payload['Role'] ||
      null,
    dealerId: payload['dealer_id'] || payload['dealerId'] || null,
    branchId: payload['branch_id'] || payload['branchId'] || null,
  };
  
  // Convert dealerId and branchId to numbers if they are strings
  if (result.dealerId && typeof result.dealerId === 'string') {
    result.dealerId = parseInt(result.dealerId, 10) || null;
  }
  if (result.branchId && typeof result.branchId === 'string') {
    result.branchId = parseInt(result.branchId, 10) || null;
  }
  
  return result;
}

export default { decodeJWT, getUserInfoFromToken, base64UrlDecode };

