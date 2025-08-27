import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { 
  Polygon as SvgPolygon, 
  Circle, 
  Text as SvgText, 
  Defs, 
  Pattern, 
  Rect as SvgRect,
  Path,
  G,
  Line
} from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

const PolygonMapMobile = ({ 
  polygonData, 
  width = screenWidth - 48, 
  height = 250, 
  showCoordinates = true 
}) => {
  const [coordinates, setCoordinates] = useState([]);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    if (!polygonData) {
      return;
    }

    try {
      console.log('PolygonMapMobile received data:', polygonData);
      
      let coords = extractCoordinates(polygonData);
      console.log('Extracted coordinates:', coords);
      
      if (coords.length === 0) {
        return;
      }

      setCoordinates(coords);
      
      // Calculate bounds
      const lats = coords.map(coord => parseFloat(coord[1]));
      const lngs = coords.map(coord => parseFloat(coord[0]));
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      setBounds({ minLat, maxLat, minLng, maxLng });
      
    } catch (error) {
      console.error('Error processing polygon data:', error);
    }
  }, [polygonData]);

  const extractCoordinates = (data) => {
    console.log('Extracting from data:', data);
    
    // Handle null or undefined
    if (!data) return [];
    
    // Handle string data (JSON)
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return extractCoordinates(parsed);
      } catch (e) {
        console.error('Failed to parse JSON string:', e);
        return [];
      }
    }
    
    // Handle GPS tracking data format - array of objects with latitude/longitude
    if (Array.isArray(data) && data.length > 0 && data[0].latitude && data[0].longitude) {
      console.log('Found GPS tracking data format');
      return data.map(point => [parseFloat(point.longitude), parseFloat(point.latitude)]);
    }
    
    // Handle GeoJSON Polygon
    if (data.type === 'Polygon' && data.coordinates && Array.isArray(data.coordinates)) {
      console.log('Found GeoJSON Polygon');
      return data.coordinates[0]; // First ring
    }
    
    // Handle GeoJSON Feature with Polygon geometry
    if (data.type === 'Feature' && data.geometry && data.geometry.type === 'Polygon') {
      console.log('Found GeoJSON Feature with Polygon');
      return data.geometry.coordinates[0];
    }
    
    // Handle direct coordinates array (nested arrays)
    if (Array.isArray(data)) {
      // Check if it's an array of coordinate pairs
      if (data.length > 0 && Array.isArray(data[0])) {
        // If first element is array with 2 numbers, it's coordinate pairs
        if (data[0].length >= 2 && typeof data[0][0] === 'number') {
          console.log('Found direct coordinate array');
          return data;
        }
        // If nested deeper (like GeoJSON coordinates)
        if (Array.isArray(data[0][0]) && data[0][0].length >= 2) {
          console.log('Found nested coordinate array');
          return data[0];
        }
      }
    }
    
    // Handle object with coordinates property
    if (data.coordinates) {
      console.log('Found coordinates property');
      return extractCoordinates(data.coordinates);
    }
    
    // Handle object with geometry property
    if (data.geometry) {
      console.log('Found geometry property');
      return extractCoordinates(data.geometry);
    }
    
    // Handle flat array of alternating lng/lat values
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'number' && data.length % 2 === 0) {
      console.log('Found flat coordinate array');
      const pairs = [];
      for (let i = 0; i < data.length; i += 2) {
        pairs.push([data[i], data[i + 1]]);
      }
      return pairs;
    }
    
    console.log('No coordinate extraction pattern matched');
    return [];
  };

  const formatCoordinate = (coord) => parseFloat(coord).toFixed(6);

  if (!polygonData) {
    return (
      <View style={{
        width,
        height,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db'
      }}>
        <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
          No polygon data available
        </Text>
      </View>
    );
  }

  if (coordinates.length === 0) {
    return (
      <View style={{
        width,
        height,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 16
      }}>
        <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
          Invalid polygon data
        </Text>
      </View>
    );
  }

  // Convert geographic coordinates to SVG coordinates
  const padding = 20;
  const svgWidth = width - padding * 2;
  const svgHeight = height - padding * 2;
  
  const latRange = bounds.maxLat - bounds.minLat || 0.001;
  const lngRange = bounds.maxLng - bounds.minLng || 0.001;
  
  const svgCoords = coordinates.map(([lng, lat]) => {
    const x = padding + ((lng - bounds.minLng) / lngRange) * svgWidth;
    const y = padding + ((bounds.maxLat - lat) / latRange) * svgHeight; // Flip Y axis
    return [x, y];
  });

  const polygonPoints = svgCoords.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <View style={{ width, marginBottom: 16 }}>
      <View style={{
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        overflow: 'hidden'
      }}>
        <Svg width={width} height={height} style={{ backgroundColor: '#f9fafb' }}>
          {/* Grid pattern */}
          <Defs>
            <Pattern
              id="grid"
              patternUnits="userSpaceOnUse"
              width="30"
              height="30"
            >
              <Path
                d="M 30 0 L 0 0 0 30"
                stroke="#e5e7eb"
                strokeWidth="0.5"
                opacity="0.7"
                fill="none"
              />
            </Pattern>
          </Defs>
          <SvgRect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Polygon */}
          <SvgPolygon
            points={polygonPoints}
            fill="rgba(34, 197, 94, 0.2)"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* Corner points and labels */}
          {svgCoords.map(([x, y], index) => (
            <G key={index}>
              <Circle
                cx={x}
                cy={y}
                r="4"
                fill="#22c55e"
                stroke="white"
                strokeWidth="2"
              />
              <SvgText
                x={x + 8}
                y={y - 8}
                fontSize="11"
                fill="#374151"
                fontFamily="monospace"
                fontWeight="600"
              >
                {index + 1}
              </SvgText>
            </G>
          ))}
          
          {/* Compass rose */}
          <G transform={`translate(${width - 35}, 35)`}>
            <Circle cx="0" cy="0" r="18" fill="white" stroke="#6b7280" strokeWidth="1" opacity="0.9"/>
            <Path d="M 0,-15 L 4,0 L 0,15 L -4,0 Z" fill="#ef4444"/>
            <SvgText x="0" y="-25" textAnchor="middle" fontSize="10" fill="#374151" fontWeight="bold">N</SvgText>
          </G>
        </Svg>
      </View>
      
      {showCoordinates && bounds && (
        <View style={{ 
          marginTop: 12, 
          padding: 12, 
          backgroundColor: '#f8fafc', 
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#e2e8f0'
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: 8
          }}>
            <View>
              <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600' }}>Bounds:</Text>
              <Text style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
                N: {formatCoordinate(bounds.maxLat)}°
              </Text>
              <Text style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
                S: {formatCoordinate(bounds.minLat)}°
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600' }}>‎</Text>
              <Text style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
                E: {formatCoordinate(bounds.maxLng)}°
              </Text>
              <Text style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
                W: {formatCoordinate(bounds.minLng)}°
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600' }}>
            Points: {coordinates.length}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PolygonMapMobile;
