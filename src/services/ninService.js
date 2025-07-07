import { auth } from './firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.10.138:3000/api';

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
      
      // First try the temp endpoint for testing
      const tempUrl = `${API_BASE_URL}/temp-nin/lookup?nin=${nin}`;
      console.log('Making request to temp endpoint:', tempUrl);
      
      const tempResponse = await fetch(tempUrl, {
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
            // Raw data for debugging
            _rawData: result.data
          };

          console.log('Mapped data:', JSON.stringify(mappedData, null, 2));
          console.log('=== NIN LOOKUP SUCCESS (TEMP) ===');
          return mappedData;
        } else {
          throw new Error(result.message || 'Invalid response format');
        }
      } else {
        const error = await tempResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.log('Temp endpoint error, trying authenticated endpoint:', error);
        
        // Fall back to authenticated endpoint (real NIN API)
        console.log('Getting auth token...');
        const token = await getAuthToken();
        console.log('Auth token obtained, making authenticated API request...');
        
        const authUrl = `${API_BASE_URL}/nin/lookup?nin=${nin}`;
        console.log('Making authenticated request to:', authUrl);
        
        const authResponse = await fetch(authUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Authenticated response status:', authResponse.status);
        console.log('Authenticated response headers:', Object.fromEntries(authResponse.headers.entries()));
        
        if (!authResponse.ok) {
          const authError = await authResponse.json().catch(() => ({ message: 'Unknown error' }));
          console.log('Authenticated API error response:', authError);
          throw new Error(authError.error || authError.message || `HTTP ${authResponse.status}: ${authResponse.statusText}`);
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
            // Raw data for debugging
            _rawData: authResult.data
          };

          console.log('Mapped data (auth):', JSON.stringify(mappedData, null, 2));
          console.log('=== NIN LOOKUP SUCCESS (AUTH) ===');
          return mappedData;
        } else {
          throw new Error(authResult.message || 'Invalid response format');
        }
      }
    } catch (error) {
      console.error('NIN lookup error:', error);
      
      // Provide more specific error messages
      if (error.message === 'User not authenticated') {
        throw new Error('Please log in to continue');
      } else if (error.message.includes('Network request failed')) {
        throw new Error('Unable to connect to server. Please check your internet connection and server status.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      } else if (error.message.includes('fetch')) {
        throw new Error('Network error occurred. Please check your internet connection.');
      } else if (error.message.includes('Invalid token')) {
        throw new Error('Authentication session expired. Please log out and log in again.');
      } else {
        throw error;
      }
    }
  },
};

// Test function for debugging network connectivity
export const testNetworkConnectivity = async (nin) => {
  try {
    const url = `${API_BASE_URL}/test?nin=${nin}`;
    console.log('Testing network connectivity to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Test response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Test response data:', result);
    
    return result;
  } catch (error) {
    console.error('Network test failed:', error);
    
    // Provide more specific error messages
    if (error.message.includes('timeout')) {
      throw new Error('Network request timed out. Please check your internet connection and try again.');
    } else if (error.message.includes('Network request failed')) {
      throw new Error('Unable to connect to server. Please check if the server is running and accessible.');
    } else if (error.message.includes('fetch')) {
      throw new Error('Network error occurred. Please check your internet connection.');
    }
    
    throw error;
  }
};
