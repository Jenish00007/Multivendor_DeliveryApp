/**
 * Validates and returns a safe image URI for React Native Image components
 * @param {any} uri - The URI to validate
 * @returns {string|null} - Returns the URI if valid, null otherwise
 */
export const validateImageUri = (uri) => {
  if (typeof uri === 'string' && uri.trim() !== '') {
    return uri.trim();
  }
  return null;
};

/**
 * Gets a validated image source object for React Native Image components
 * @param {any} uri - The URI to validate
 * @param {any} fallback - Optional fallback source (can be require() or { uri: string })
 * @returns {object} - Returns a valid source object
 */
export const getImageSource = (uri, fallback = null) => {
  const validUri = validateImageUri(uri);
  
  if (validUri) {
    return { uri: validUri };
  }
  
  if (fallback) {
    return fallback;
  }
  
  // Return null to allow component to handle the fallback
  return null;
};

