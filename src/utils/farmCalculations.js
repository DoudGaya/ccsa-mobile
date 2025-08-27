/**
 * Calculate the area of a polygon using the Shoelace formula
 * Coordinates should be in [longitude, latitude] format or [{lat, lng}] format
 * Returns area in square meters
 */
export function calculatePolygonArea(coordinates) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
    return 0;
  }

  // Convert latitude/longitude to approximate meters using spherical approximation
  // This is a simplified calculation suitable for small areas
  const earthRadius = 6371000; // Earth's radius in meters
  
  // Normalize coordinates format - handle both [lng, lat] and {latitude, longitude} formats
  const normalizedCoords = coordinates.map(coord => {
    if (Array.isArray(coord)) {
      return [coord[0], coord[1]]; // [lng, lat]
    } else if (coord.latitude !== undefined && coord.longitude !== undefined) {
      return [coord.longitude, coord.latitude]; // Convert {lat, lng} to [lng, lat]
    } else if (coord.lng !== undefined && coord.lat !== undefined) {
      return [coord.lng, coord.lat]; // Convert {lat, lng} to [lng, lat]
    }
    return coord;
  });
  
  // Convert degrees to radians and calculate area using the Shoelace formula
  let area = 0;
  const n = normalizedCoords.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    
    const lat1 = normalizedCoords[i][1] * Math.PI / 180;
    const lon1 = normalizedCoords[i][0] * Math.PI / 180;
    const lat2 = normalizedCoords[j][1] * Math.PI / 180;
    const lon2 = normalizedCoords[j][0] * Math.PI / 180;
    
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
 * Returns size in hectares rounded to 2 decimal places
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
 * Process and calculate farm size, then update form data
 * This function integrates farm size calculation with form data
 */
export function processFarmDataWithSize(farmData) {
  try {
    const processedData = { ...farmData };
    
    // Calculate farm size if polygon exists
    if (farmData.farmPolygon && Array.isArray(farmData.farmPolygon)) {
      const calculatedSize = calculateFarmSizeFromPolygon(farmData.farmPolygon);
      processedData.farmSize = calculatedSize.toString(); // Store as string to match expected format
      
      console.log('🌾 Farm size calculated:', {
        polygonPoints: farmData.farmPolygon.length,
        sizeInHectares: calculatedSize,
        sizeString: processedData.farmSize
      });
    }
    
    // Ensure farmPolygon is properly formatted for storage
    if (processedData.farmPolygon) {
      // Convert to GeoJSON-like format for consistent storage
      processedData.farmBoundaries = {
        type: 'Polygon',
        coordinates: [processedData.farmPolygon.map(point => [point.longitude, point.latitude])],
        calculatedArea: processedData.farmSize
      };
    }
    
    return processedData;
  } catch (error) {
    console.error('Error processing farm data with size:', error);
    return farmData; // Return original data if calculation fails
  }
}

/**
 * Validate and format farm coordinates
 * Enhanced validation for Nigerian farm boundaries
 */
export function validateFarmCoordinates(coordinates) {
  try {
    if (!coordinates || !Array.isArray(coordinates)) {
      return { valid: false, error: 'Coordinates must be an array' };
    }
    
    if (coordinates.length < 3) {
      return { valid: false, error: 'A farm boundary must have at least 3 points to form a valid polygon' };
    }
    
    // Check if each coordinate is valid
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i];
      let lat, lon;
      
      // Handle different coordinate formats
      if (Array.isArray(coord) && coord.length === 2) {
        [lon, lat] = coord; // [longitude, latitude] format
      } else if (coord.latitude !== undefined && coord.longitude !== undefined) {
        lat = coord.latitude;
        lon = coord.longitude;
      } else if (coord.lat !== undefined && coord.lng !== undefined) {
        lat = coord.lat;
        lon = coord.lng;
      } else {
        return { valid: false, error: `Coordinate ${i + 1} must be in format [longitude, latitude] or {latitude, longitude}` };
      }
      
      if (typeof lon !== 'number' || typeof lat !== 'number') {
        return { valid: false, error: `Coordinate ${i + 1} must contain valid numbers` };
      }
      
      // Check if coordinates are within reasonable bounds for Nigeria
      if (lat < 4 || lat > 14 || lon < 2.5 || lon > 15) {
        return { valid: false, error: `Coordinate ${i + 1} (${lat.toFixed(6)}, ${lon.toFixed(6)}) is outside Nigeria bounds` };
      }
    }
    
    // Check if polygon forms a reasonable area (not too small or too large)
    const area = calculateFarmSizeFromPolygon(coordinates);
    if (area < 0.01) { // Less than 100 square meters
      return { valid: false, error: 'Farm area is too small. Please check your boundary points.' };
    }
    if (area > 10000) { // More than 10,000 hectares (unrealistic for most farms)
      return { valid: false, error: 'Farm area is unusually large. Please verify your boundary points.' };
    }
    
    return { valid: true, area, areaText: `${area} hectares` };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export default {
  calculatePolygonArea,
  metersToHectares,
  calculateFarmSizeFromPolygon,
  processFarmDataWithSize,
  validateFarmCoordinates
};
