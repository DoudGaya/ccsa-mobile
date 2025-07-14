import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhoneVerificationService from '../services/phoneVerificationService';

/**
 * Simple Phone Verification Test Component
 * 
 * This component demonstrates how to use the phone verification service.
 * In development mode, it will use mock verification (any 6-digit code works).
 * In production, it will attempt to use your backend SMS service.
 */

const PhoneVerificationTest = ({ onClose, onVerified }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [networkStatus, setNetworkStatus] = useState('checking');
  const [apiStatus, setApiStatus] = useState('checking');

  const verificationService = new PhoneVerificationService();

  // Check connectivity on mount
  React.useEffect(() => {
    checkConnectivity();
  }, []);

  const checkConnectivity = async () => {
    setNetworkStatus('checking');
    setApiStatus('checking');

    try {
      // Check network connectivity
      const networkConnected = await verificationService.checkNetworkConnectivity();
      setNetworkStatus(networkConnected ? 'connected' : 'disconnected');

      // Check SMS service if network is available
      if (networkConnected) {
        const smsTest = await verificationService.testSMSService();
        setApiStatus(smsTest.success ? 'available' : 'unavailable');
      } else {
        setApiStatus('unavailable');
      }
    } catch (error) {
      console.error('Connectivity check failed:', error);
      setNetworkStatus('disconnected');
      setApiStatus('unavailable');
    }
  };

  const sendCode = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      const id = await verificationService.sendVerificationCode(phoneNumber);
      setVerificationId(id);
      setCodeSent(true);
      
      if (__DEV__) {
        Alert.alert(
          'Development Mode', 
          'Verification code sent! In development mode, you can use any 6-digit code (e.g., 123456).'
        );
      } else {
        Alert.alert('Success', 'Verification code sent to your phone');
      }
    } catch (error) {
      console.error('Send code error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      const verified = await verificationService.verifyCode(code);
      
      if (verified) {
        Alert.alert('Success', 'Phone number verified successfully!');
        if (onVerified) {
          onVerified(phoneNumber);
        }
        resetForm();
      }
    } catch (error) {
      console.error('Verify code error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setCode('');
    setCodeSent(false);
    setVerificationId('');
    verificationService.clearVerification();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'available':
        return '#10b981';
      case 'disconnected':
      case 'unavailable':
        return '#ef4444';
      case 'checking':
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = (type, status) => {
    if (type === 'network') {
      switch (status) {
        case 'connected': return 'Connected';
        case 'disconnected': return 'No Internet';
        case 'checking': return 'Checking...';
        default: return 'Unknown';
      }
    } else {
      switch (status) {
        case 'available': return 'Available';
        case 'unavailable': return 'Unavailable';
        case 'checking': return 'Testing...';
        default: return 'Unknown';
      }
    }
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return `+234${cleaned.substring(1)}`;
    }
    return phone;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Phone Verification Test</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {__DEV__ && (
          <View style={styles.devNotice}>
            <Ionicons name="information-circle" size={20} color="#ff9500" />
            <Text style={styles.devNoticeText}>
              Development Mode: Mock verification enabled
            </Text>
          </View>
        )}

        {/* Network Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>System Status</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(networkStatus) }]} />
              <Text style={styles.statusLabel}>Network</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(networkStatus) }]}>
                {getStatusText('network', networkStatus)}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(apiStatus) }]} />
              <Text style={styles.statusLabel}>SMS Service</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(apiStatus) }]}>
                {getStatusText('api', apiStatus)}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={checkConnectivity}
            disabled={networkStatus === 'checking' || apiStatus === 'checking'}
          >
            <Ionicons name="refresh" size={16} color="#013358" />
            <Text style={styles.refreshText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>

        {!codeSent ? (
          <View style={styles.section}>
            <Text style={styles.label}>Nigerian Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="08012345678"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <Text style={styles.hint}>
              Format: 08012345678 (will be converted to +2348012345678)
            </Text>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={sendCode}
              disabled={loading || !phoneNumber.trim()}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.label}>Verification Code</Text>
            <Text style={styles.subtitle}>
              Code sent to: {formatPhoneDisplay(phoneNumber)}
            </Text>
            
            <TextInput
              style={styles.codeInput}
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
            />
            
            {__DEV__ && (
              <Text style={styles.devHint}>
                💡 Development tip: Use any 6-digit code (e.g., 123456)
              </Text>
            )}
            
            <TouchableOpacity 
              style={[
                styles.button, 
                (loading || code.length !== 6) && styles.buttonDisabled
              ]} 
              onPress={verifyCode}
              disabled={loading || code.length !== 6}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                resetForm();
                sendCode();
              }} 
              disabled={loading}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Resend Code</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={resetForm} 
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            • In <Text style={styles.bold}>development mode</Text>: Always uses mock verification (any 6-digit code works)
          </Text>
          <Text style={styles.infoText}>
            • In <Text style={styles.bold}>production</Text>: Attempts backend SMS, falls back to mock if unavailable
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Network issues</Text>: Automatically handles timeouts and provides fallbacks
          </Text>
          <Text style={styles.infoText}>
            • Supports Nigerian phone number formats
          </Text>

          {(networkStatus === 'disconnected' || apiStatus === 'unavailable') && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={16} color="#f59e0b" />
              <Text style={styles.warningText}>
                {networkStatus === 'disconnected' 
                  ? 'No internet connection detected. Using offline mode.'
                  : 'SMS service unavailable. Mock verification will be used.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#013358',
  },
  closeButton: {
    padding: 5,
  },
  devNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  devNoticeText: {
    marginLeft: 8,
    color: '#856404',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#013358',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#013358',
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#013358',
    letterSpacing: 4,
    marginBottom: 15,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  devHint: {
    fontSize: 12,
    color: '#ff9500',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#013358',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#013358',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#013358',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
    color: '#013358',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#013358',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  refreshText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#013358',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#92400e',
    flex: 1,
  },
});

export default PhoneVerificationTest;
