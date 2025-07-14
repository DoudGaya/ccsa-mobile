import { auth } from './firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.10.122:3000/api';

// Alternative API endpoints to try if the primary fails
const FALLBACK_API_URLS = [
  'http://192.168.10.122:3000/api',  // Primary from .env
  'http://192.168.10.138:3000/api',  // Fallback 1
  'http://192.168.1.100:3000/api',   // Common router subnet
  'http://192.168.0.100:3000/api',   // Another common subnet
  'http://10.0.0.100:3000/api',      // Corporate network
  'http://localhost:3000/api',       // Local development
  'http://127.0.0.1:3000/api',       // Local development alternative
];

// Alternative ports to try
const FALLBACK_PORTS = [3000, 3001, 8000, 8080, 5000, 4000];

// Network timeout configuration
const NETWORK_TIMEOUT = 15000; // 15 seconds
const RETRY_ATTEMPTS = 2;

// Helper function to find a working API endpoint
const findWorkingEndpoint = async () => {
  const endpointsToTry = [API_BASE_URL, ...FALLBACK_API_URLS];
  
  console.log(`🔍 Searching for working backend server...`);
  console.log(`📋 Will test ${endpointsToTry.length} endpoints`);
  
  for (const endpoint of endpointsToTry) {
    try {
      console.log(`🧪 Testing endpoint: ${endpoint}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${endpoint}/test`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Working endpoint found: ${endpoint}`);
        return endpoint;
      } else {
        console.log(`⚠️ Endpoint responded with status ${response.status}: ${endpoint}`);
      }
    } catch (error) {
      console.log(`❌ Endpoint failed: ${endpoint} - ${error.message}`);
      continue;
    }
  }
  
  console.error('🚨 No working endpoints found!');
  console.log('💡 Possible solutions:');
  console.log('   1. Check if your backend server is running');
  console.log('   2. Verify the correct IP address and port');
  console.log('   3. Use the BackendDiscovery component to find your server');
  console.log('   4. Update your .env file with the correct API_BASE_URL');
  
  // Throw error instead of returning default to make the issue clear
  throw new Error('Backend server not accessible. Please check if the server is running and verify the IP address in your .env file.');
};

// Helper function to check network connectivity
const checkNetworkConnection = async () => {
  try {
    // Try a simple network request to check connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      return false;
    }
  } catch (error) {
    console.warn('Network check failed:', error);
    return true; // Assume connected if we can't check
  }
};

// Helper function to create fetch with timeout
const fetchWithTimeout = async (url, options, timeout = NETWORK_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

// Helper function to retry network requests
const retryNetworkRequest = async (requestFn, maxAttempts = RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`NIN API attempt ${attempt}/${maxAttempts}`);
      return await requestFn();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      // Don't retry for authentication or validation errors
      if (error.message.includes('authenticated') || 
          error.message.includes('11 digits') ||
          error.message.includes('Invalid response format')) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
// Helper function to parse date in dd-mm-yyyy format
const parseNINDate = (dateString) => {
  if (!dateString) return '';
  
  // Handle dd-mm-yyyy format
  const datePattern = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  const match = dateString.match(datePattern);
  
  if (match) {
    const [, day, month, year] = match;
    // Convert to ISO format (yyyy-mm-dd)
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // If it doesn't match dd-mm-yyyy, try to parse as-is
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]; // Return yyyy-mm-dd format
  }
  
  console.warn(`Could not parse date: ${dateString}`);
  return '';
};

const getAuthToken = async () => {
  const user = auth.currentUser;
  console.log('Current user:', user ? 'User logged in' : 'No user logged in');
  if (!user) throw new Error('User not authenticated');
  
  // Force refresh the token to ensure it's valid
  const token = await user.getIdToken(true);
  console.log('Token obtained:', token ? 'Token exists' : 'No token');
  console.log('Token length:', token ? token.length : 'No token');
  console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
  
  return token;
};

export const ninService = {
  // Lookup NIN information using the real API structure
  async lookupNIN(nin) {
    try {
      console.log('=== NIN LOOKUP START ===');
      console.log('NIN:', nin);
      console.log('API_BASE_URL:', API_BASE_URL);
      
      if (!nin || nin.length !== 11) {
        throw new Error('NIN must be 11 digits long');
      }
      
      // Check network connectivity first
      console.log('Checking network connectivity...');
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
      // Find a working API endpoint
      console.log('Finding working API endpoint...');
      const workingEndpoint = await findWorkingEndpoint();
      console.log('Using endpoint:', workingEndpoint);
      
      // Wrap the lookup logic in retry mechanism
      return await retryNetworkRequest(async () => {
        // First try the temp endpoint for testing
        const tempUrl = `${workingEndpoint}/temp-nin/lookup?nin=${nin}`;
        console.log('Making request to temp endpoint:', tempUrl);
        
        const tempResponse = await fetchWithTimeout(tempUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Temp response status:', tempResponse.status);
        console.log('Temp response headers:', Object.fromEntries(tempResponse.headers.entries()));
        
        if (tempResponse.ok) {
          const result = await tempResponse.json();
          console.log('Temp NIN endpoint raw response:', JSON.stringify(result, null, 2));
          
          if (result.success && result.data) {
            // Destructure the API response based on actual structure
            const {
              firstname,
              middlename,
              surname,
              dateofbirth,
              gender,
              email,
              telephoneno,
              msisdn,
              emplymentstatus,
              educationallevel,
              maritalstatus,
              residence_state,
              residence_lga,
              residence_address,
              birthstate,
              birthlga,
              'residence-address1': residenceAddress1,
              photo,
              signature,
              ...rest
            } = result.data;

            console.log('Destructured fields:', {
              firstname,
              middlename,
              surname,
              dateofbirth,
              gender,
              email,
              telephoneno,
              msisdn,
              emplymentstatus,
              educationallevel,
              maritalstatus,
              residence_state,
              residence_lga,
              residence_address,
              birthstate,
              birthlga,
              residenceAddress1,
              photo: photo ? 'present' : 'null',
              signature: signature ? 'present' : 'null'
            });

            // Map the API response to our form structure (only essential fields)
            const mappedData = {
              nin: nin,
              firstName: firstname || '',
              middleName: middlename || '',
              lastName: surname || '',
              dateOfBirth: parseNINDate(dateofbirth), // Convert to proper format
              gender: gender?.toUpperCase() || '',
              state: birthstate || residence_state || '', // Use birthstate as primary, fallback to residence_state
              lga: birthlga || residence_lga || '', // Use birthlga as primary, fallback to residence_lga
              maritalStatus: maritalstatus || '',
              employmentStatus: emplymentstatus || '',
              photoUrl: photo || '', // Add photo URL from NIN API
              // Raw data for debugging
              _rawData: result.data
            };

            console.log('Mapped data:', JSON.stringify(mappedData, null, 2));
            console.log('=== NIN LOOKUP SUCCESS (TEMP) ===');
            return mappedData;
          } else {
            throw new Error(result.message || 'No data found for this NIN');
          }
        } else {
          const error = await tempResponse.json().catch(() => ({ message: 'Server error occurred' }));
          console.log('Temp endpoint error, trying authenticated endpoint:', error);
          
          // Fall back to authenticated endpoint (real NIN API)
          console.log('Getting auth token...');
          const token = await getAuthToken();
          console.log('Auth token obtained, making authenticated API request...');
          
          const authUrl = `${workingEndpoint}/nin/lookup?nin=${nin}`;
          console.log('Making authenticated request to:', authUrl);
          
          const authResponse = await fetchWithTimeout(authUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('Authenticated response status:', authResponse.status);
          console.log('Authenticated response headers:', Object.fromEntries(authResponse.headers.entries()));
          
          if (!authResponse.ok) {
            const authError = await authResponse.json().catch(() => ({ message: 'Server error occurred' }));
            console.log('Authenticated API error response:', authError);
            
            // Handle specific HTTP status codes
            if (authResponse.status === 404) {
              throw new Error('NIN not found in database');
            } else if (authResponse.status === 401) {
              throw new Error('Authentication failed. Please log out and log in again.');
            } else if (authResponse.status === 403) {
              throw new Error('Access denied. Please contact administrator.');
            } else if (authResponse.status === 429) {
              throw new Error('Too many requests. Please wait a moment and try again.');
            } else if (authResponse.status >= 500) {
              throw new Error('Server error. Please try again later.');
            } else {
              throw new Error(authError.error || authError.message || `Server returned error (${authResponse.status})`);
            }
          }

          const authResult = await authResponse.json();
          console.log('Authenticated API raw response:', JSON.stringify(authResult, null, 2));
          
          if (authResult.success && authResult.data) {
            // Destructure the API response based on actual structure
            const {
              firstname,
              middlename,
              surname,
              dateofbirth,
              gender,
              email,
              telephoneno,
              msisdn,
              emplymentstatus,
              educationallevel,
              maritalstatus,
              residence_state,
              residence_lga,
              residence_address,
              birthstate,
              birthlga,
              'residence-address1': residenceAddress1,
              photo,
              signature,
              ...rest
            } = authResult.data;

            console.log('Destructured fields (auth):', {
              firstname,
              middlename,
              surname,
              dateofbirth,
              gender,
              email,
              telephoneno,
              msisdn,
              emplymentstatus,
              educationallevel,
              maritalstatus,
              residence_state,
              residence_lga,
              residence_address,
              birthstate,
              birthlga,
              residenceAddress1,
              photo: photo ? 'present' : 'null',
              signature: signature ? 'present' : 'null'
            });

            // Map the real API response to our form structure (only essential fields)
            const mappedData = {
              nin: nin,
              firstName: firstname || '',
              middleName: middlename || '',
              lastName: surname || '',
              dateOfBirth: parseNINDate(dateofbirth), // Convert to proper format
              gender: gender?.toUpperCase() || '',
              state: birthstate || residence_state || '', // Use birthstate as primary, fallback to residence_state
              lga: birthlga || residence_lga || '', // Use birthlga as primary, fallback to residence_lga
              maritalStatus: maritalstatus || '',
              employmentStatus: emplymentstatus || '',
              photoUrl: photo || '', // Add photo URL from NIN API
              // Raw data for debugging
              _rawData: authResult.data
            };

            console.log('Mapped data (auth):', JSON.stringify(mappedData, null, 2));
            console.log('=== NIN LOOKUP SUCCESS (AUTH) ===');
            return mappedData;
          } else {
            throw new Error(authResult.message || 'No data found for this NIN');
          }
        }
      });
    } catch (error) {
      console.error('NIN lookup error:', error);
      
      // Provide user-friendly error messages
      let userFriendlyMessage;
      
      if (error.message === 'User not authenticated') {
        userFriendlyMessage = 'Authentication required. Please log in to continue.';
      } else if (error.message.includes('Backend server not accessible')) {
        userFriendlyMessage = 'Cannot connect to backend server. Please check if the server is running and verify your network settings.';
      } else if (error.message.includes('No internet connection')) {
        userFriendlyMessage = error.message;
      } else if (error.message.includes('Request timed out')) {
        userFriendlyMessage = 'Request timed out. The server may be slow. Please try again.';
      } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        userFriendlyMessage = 'Network error. Please check your internet connection and server status.';
      } else if (error.message.includes('Invalid token') || error.message.includes('Authentication failed')) {
        userFriendlyMessage = 'Authentication session expired. Please log out and log in again.';
      } else if (error.message.includes('NIN not found')) {
        userFriendlyMessage = 'This NIN was not found in the database. Please verify the NIN and try again.';
      } else if (error.message.includes('11 digits')) {
        userFriendlyMessage = 'Please enter a valid 11-digit NIN.';
      } else if (error.message.includes('Too many requests')) {
        userFriendlyMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.message.includes('Server error')) {
        userFriendlyMessage = 'Server is temporarily unavailable. Please try again later.';
      } else if (error.message.includes('No data found')) {
        userFriendlyMessage = 'No information found for this NIN. Please verify the NIN is correct.';
      } else {
        // Keep the original message for any other errors
        userFriendlyMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      // Throw a new error with the user-friendly message
      const friendlyError = new Error(userFriendlyMessage);
      friendlyError.originalError = error;
      throw friendlyError;
    }
  },

  // Test network connectivity to NIN service
  async testConnection() {
    try {
      console.log('Testing NIN service connectivity...');
      
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        return {
          success: false,
          message: 'No internet connection detected',
          details: 'Device appears to be offline'
        };
      }
      
      // Test all available endpoints
      const endpointResults = [];
      const endpointsToTest = [API_BASE_URL, ...FALLBACK_API_URLS];
      
      for (const endpoint of endpointsToTest) {
        try {
          const testUrl = `${endpoint}/test`;
          const response = await fetchWithTimeout(testUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }, 10000);

          if (response.ok) {
            const result = await response.json();
            endpointResults.push({
              endpoint,
              status: 'success',
              message: 'Accessible',
              data: result
            });
          } else {
            endpointResults.push({
              endpoint,
              status: 'error',
              message: `HTTP ${response.status}: ${response.statusText}`
            });
          }
        } catch (error) {
          endpointResults.push({
            endpoint,
            status: 'error',
            message: error.message
          });
        }
      }
      
      const workingEndpoints = endpointResults.filter(r => r.status === 'success');
      
      return {
        success: workingEndpoints.length > 0,
        message: workingEndpoints.length > 0 
          ? `${workingEndpoints.length} endpoint(s) accessible`
          : 'No endpoints accessible',
        details: {
          workingEndpoints: workingEndpoints.length,
          totalTested: endpointResults.length,
          results: endpointResults
        }
      };
    } catch (error) {
      console.error('NIN service test failed:', error);
      
      let message;
      if (error.message.includes('Request timed out')) {
        message = 'Connection timed out - server may be slow or unreachable';
      } else if (error.message.includes('Network request failed')) {
        message = 'Cannot reach NIN service - check network connection';
      } else {
        message = `Test failed: ${error.message}`;
      }
      
      return {
        success: false,
        message,
        details: error.message
      };
    }
  }
};


