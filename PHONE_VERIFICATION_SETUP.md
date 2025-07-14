# Phone Verification Service Setup Guide

This guide explains how to set up phone number verification for the FIMS (Farmers Information Management System) mobile app.

## Current Implementation

The app uses Firebase Authentication for phone verification, with support for both SMS and WhatsApp verification.

## Firebase Setup (Current Implementation)

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Phone** authentication
5. Add your app's package name to Firebase project settings

### 2. Android Configuration

```bash
# Download google-services.json from Firebase Console
# Place it in: android/app/google-services.json
```

1. Add SHA certificate fingerprints to Firebase project:
   ```bash
   # Debug SHA1
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Production SHA1 (replace with your keystore path)
   keytool -list -v -keystore /path/to/your/keystore.jks -alias your-key-alias
   ```

2. Enable SafetyNet for production apps
3. Configure Play Integrity API for enhanced security

### 3. iOS Configuration

```bash
# Download GoogleService-Info.plist from Firebase Console
# Add it to your iOS project in Xcode
```

1. Add URL schemes to `Info.plist`:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLName</key>
       <string>BUNDLE_ID</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>YOUR_REVERSED_CLIENT_ID</string>
       </array>
     </dict>
   </array>
   ```

2. Configure APNs (Apple Push Notification service) for silent push notifications
3. Upload APNs certificates to Firebase Console

### 4. Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: For production
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Alternative SMS Providers

### 1. Twilio Verify API (Recommended for Production)

**Pros:**
- Reliable delivery in Nigeria
- Advanced fraud protection
- WhatsApp and Voice fallback
- Detailed analytics

**Setup:**
```javascript
// Install Twilio SDK
npm install twilio

// Environment variables
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
```

**Code Example:**
```javascript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send verification code
await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verifications
  .create({
    to: '+234' + phoneNumber,
    channel: 'sms' // or 'whatsapp'
  });

// Verify code
const verification = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verificationChecks
  .create({
    to: '+234' + phoneNumber,
    code: userEnteredCode
  });
```

**Pricing:** ~$0.05 per verification (Nigeria)

### 2. Africa's Talking (Nigeria-Specific)

**Pros:**
- Local Nigerian provider
- Competitive pricing
- Good delivery rates in Nigeria
- Supports local payment methods

**Setup:**
```javascript
// Install Africa's Talking SDK
npm install africastalking

// Environment variables
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_USERNAME=your_username
```

**Code Example:**
```javascript
import AfricasTalking from 'africastalking';

const africastalking = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
});

// Send SMS
const result = await africastalking.SMS.send({
  to: ['+234' + phoneNumber],
  message: `Your FIMS verification code is: ${code}`,
  from: 'FIMS' // Optional sender ID
});
```

**Pricing:** ~₦2-5 per SMS

### 3. Termii (Nigerian Provider)

**Pros:**
- Nigerian company
- Good local delivery
- WhatsApp Business API integration
- Competitive pricing

**Setup:**
```bash
# API endpoint
https://api.ng.termii.com/api/sms/otp/send

# Headers
Content-Type: application/json
```

**Code Example:**
```javascript
const sendOTP = async (phoneNumber) => {
  const response = await fetch('https://api.ng.termii.com/api/sms/otp/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      message_type: 'NUMERIC',
      to: phoneNumber,
      from: 'FIMS',
      channel: 'generic',
      pin_attempts: 3,
      pin_time_to_live: 5,
      pin_length: 6,
      pin_placeholder: '<pin>',
      message_text: 'Your FIMS verification code is <pin>',
    }),
  });
  
  return await response.json();
};
```

## WhatsApp Verification

### 1. WhatsApp Business API via Meta

**Requirements:**
- Meta Business Account
- WhatsApp Business API access
- Phone number verification with Meta

**Setup:**
1. Apply for WhatsApp Business API access
2. Configure webhook endpoints
3. Implement message templates

### 2. Twilio WhatsApp API

**Setup:**
```javascript
// Send WhatsApp verification
await client.verify.v2.services(VERIFY_SERVICE_SID)
  .verifications
  .create({
    to: 'whatsapp:+234' + phoneNumber,
    channel: 'whatsapp'
  });
```

### 3. 360Dialog (WhatsApp Partner)

**Pros:**
- Official WhatsApp Business Solution Provider
- Good for Nigerian market
- Template message support

## Production Recommendations

### For Nigerian Farmers (Current Use Case):

1. **Primary:** Twilio Verify API
   - Most reliable delivery
   - Multiple fallback channels
   - Good fraud protection

2. **Secondary:** Africa's Talking
   - Local provider
   - Cost-effective
   - Good for budget-conscious deployments

3. **WhatsApp:** 360Dialog or Twilio WhatsApp
   - For farmers who prefer WhatsApp
   - Higher engagement rates

### Implementation Strategy:

```javascript
// Multi-provider fallback
const verificationProviders = [
  { name: 'twilio', priority: 1 },
  { name: 'africastalking', priority: 2 },
  { name: 'termii', priority: 3 }
];

async function sendVerificationCode(phoneNumber) {
  for (const provider of verificationProviders) {
    try {
      const result = await sendWithProvider(provider.name, phoneNumber);
      if (result.success) return result;
    } catch (error) {
      console.log(`Provider ${provider.name} failed, trying next...`);
      continue;
    }
  }
  throw new Error('All verification providers failed');
}
```

## Security Considerations

1. **Rate Limiting:**
   ```javascript
   // Implement rate limiting per phone number
   const MAX_ATTEMPTS_PER_HOUR = 3;
   const MAX_ATTEMPTS_PER_DAY = 10;
   ```

2. **Phone Number Validation:**
   ```javascript
   // Validate Nigerian phone numbers
   const isValidNigerianPhone = (phone) => {
     return /^(070|080|081|090|091|701|702|703|704|705|706|707|708|709|817|818|819|909|908|901|902|903|905|906|907|915|913|912|911|910)\\d{7}$/.test(phone);
   };
   ```

3. **Code Generation:**
   ```javascript
   // Generate secure 6-digit codes
   const generateSecureCode = () => {
     return Math.floor(100000 + Math.random() * 900000).toString();
   };
   ```

## Testing

### Development Testing:
- Use Firebase Auth emulator for local testing
- Test with virtual phone numbers
- Use Twilio test credentials

### Production Testing:
- Test with real Nigerian phone numbers
- Verify delivery across all major networks (MTN, Airtel, Glo, 9mobile)
- Test fallback mechanisms

## Cost Analysis

| Provider | SMS Cost (Nigeria) | Setup Complexity | Reliability |
|----------|-------------------|------------------|-------------|
| Firebase | Free (with limits) | Low | Medium |
| Twilio | $0.05/SMS | Medium | High |
| Africa's Talking | ₦2-5/SMS | Low | Medium |
| Termii | ₦3-6/SMS | Low | Medium |

## Support and Documentation

- **Firebase Auth:** https://firebase.google.com/docs/auth/web/phone-auth
- **Twilio Verify:** https://www.twilio.com/docs/verify/api
- **Africa's Talking:** https://developers.africastalking.com/
- **Termii:** https://developers.termii.com/

## Troubleshooting

### Common Issues:

1. **SMS not delivered:**
   - Check phone number format (+234...)
   - Verify provider credits
   - Check spam/blocked numbers

2. **Firebase reCAPTCHA issues:**
   - Ensure proper domain configuration
   - Use App Check for production
   - Implement silent push notifications for iOS

3. **Rate limiting:**
   - Implement exponential backoff
   - Use multiple providers
   - Cache verification states

### Support Contacts:

- **Firebase Support:** Firebase Console > Support
- **Twilio Support:** https://support.twilio.com/
- **Africa's Talking:** support@africastalking.com
