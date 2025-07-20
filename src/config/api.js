// API Configuration
const API_CONFIG = {
  // Replace this with your actual backend API URL
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000' // Development URL
    : 'https://your-backend-api-url.vercel.app', // Production URL
  
  // API endpoints
  ENDPOINTS: {
    STATES: '/api/locations/states',
    LOCAL_GOVERNMENTS: '/api/locations/local-governments',
    WARDS: '/api/locations/wards',
    POLLING_UNITS: '/api/locations/polling-units',
    
    // Other API endpoints
    FARMERS: '/api/farmers',
    FARMS: '/api/farms',
    AUTH: '/api/auth'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY: {
    attempts: 3,
    delay: 1000
  }
};

export default API_CONFIG;
