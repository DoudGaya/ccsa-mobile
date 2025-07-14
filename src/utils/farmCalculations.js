/**
 * Calculate the area of a polygon using the Shoelace formula
 * Coordinates should be in [longitude, latitude] format
 * Returns area in square meters
 */
export function calculatePolygonArea(coordinates) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
    return 0;
  }

  // Convert latitude/longitude to approximate meters using spherical approximation
  // This is a simplified calculation suitable for small areas
  const earthRadius = 6371000; // Earth's radius in meters
  
  // Convert degrees to radians and calculate area
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    
    const lat1 = coordinates[i][1] * Math.PI / 180;
    const lon1 = coordinates[i][0] * Math.PI / 180;
    const lat2 = coordinates[j][1] * Math.PI / 180;
    const lon2 = coordinates[j][0] * Math.PI / 180;
    
    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  
  area = Math.abs(area) * earthRadius * earthRadius / 2;
  
  return area; // Returns area in square meters
}

/**
 * Convert square meters to hectares
 */
export function metersToHectares(squareMeters) {
  return squareMeters / 10000; // 1 hectare = 10,000 square meters
}

/**
 * Calculate farm size from polygon coordinates
 * Returns size in hectares
 */
export function calculateFarmSizeFromPolygon(farmPolygon) {
  try {
    if (!farmPolygon) return 0;
    
    let coordinates;
    
    // Handle different polygon data formats
    if (typeof farmPolygon === 'string') {
      const parsed = JSON.parse(farmPolygon);
      coordinates = parsed.coordinates || parsed;
    } else if (Array.isArray(farmPolygon)) {
      coordinates = farmPolygon;
    } else if (farmPolygon.coordinates) {
      coordinates = farmPolygon.coordinates;
    } else {
      return 0;
    }
    
    // Handle GeoJSON polygon format (array of rings)
    if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])) {
      coordinates = coordinates[0]; // Use the outer ring
    }
    
    const areaInSquareMeters = calculatePolygonArea(coordinates);
    const areaInHectares = metersToHectares(areaInSquareMeters);
    
    return Math.round(areaInHectares * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating farm size:', error);
    return 0;
  }
}

/**
 * Validate and format farm coordinates
 */
export function validateFarmCoordinates(coordinates) {
  try {
    if (!coordinates || !Array.isArray(coordinates)) {
      return { valid: false, error: 'Coordinates must be an array' };
    }
    
    if (coordinates.length < 3) {
      return { valid: false, error: 'A polygon must have at least 3 points' };
    }
    
    // Check if each coordinate is valid
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i];
      if (!Array.isArray(coord) || coord.length !== 2) {
        return { valid: false, error: `Coordinate ${i + 1} must be [longitude, latitude]` };
      }
      
      const [lon, lat] = coord;
      if (typeof lon !== 'number' || typeof lat !== 'number') {
        return { valid: false, error: `Coordinate ${i + 1} must contain numbers` };
      }
      
      // Check if coordinates are within reasonable bounds for Nigeria
      if (lat < 4 || lat > 14 || lon < 2.5 || lon > 15) {
        return { valid: false, error: `Coordinate ${i + 1} is outside Nigeria bounds` };
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export default {
  calculatePolygonArea,
  metersToHectares,
  calculateFarmSizeFromPolygon,
  validateFarmCoordinates
};
