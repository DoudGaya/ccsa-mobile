// Simple test to verify SMS sending
// Replace the phone number with your actual number for testing

const testPhoneNumber = '+2348012345678'; // Replace with your actual Nigerian phone number

async function testSMSDirectly() {
  try {
    console.log('🧪 Testing direct SMS sending...');
    console.log('📱 Phone number:', testPhoneNumber);
    console.log('🌍 Backend URL:', 'http://192.168.10.122:3000/api');
    
    const response = await fetch('http://192.168.10.122:3000/api/sms/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testPhoneNumber
      })
    });
    
    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    console.log('📄 Response data:', data);
    
    if (response.ok && data.success) {
      console.log('✅ SMS sent successfully!');
      console.log('🆔 Verification ID:', data.verificationId);
      console.log('📋 Status:', data.status);
      
      alert(`SMS sent successfully! Check your phone for the verification code. Verification ID: ${data.verificationId}`);
    } else {
      console.error('❌ SMS failed to send');
      console.error('Error:', data.error || 'Unknown error');
      alert(`SMS failed: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('🔥 Network error:', error);
    alert(`Network error: ${error.message}`);
  }
}

// Run the test
testSMSDirectly();
