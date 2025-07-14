import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhoneVerificationService from '../services/phoneVerificationService';

const PhoneVerificationModal = ({ 
  visible, 
  onClose, 
  onVerified, 
  phoneNumber,
  title = "Verify Phone Number" 
}) => {
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const verificationService = new PhoneVerificationService();

  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('234')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+234${cleaned.substring(1)}`;
    }
    return `+234${cleaned}`;
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendCode = async () => {
    try {
      setLoading(true);
      const id = await verificationService.sendVerificationCode(phoneNumber);
      setVerificationId(id);
      setCodeSent(true);
      startCountdown();
      
      if (__DEV__) {
        Alert.alert(
          'Development Mode', 
          'Mock verification enabled! Use any 6-digit code (e.g., 123456) to verify.'
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
        Alert.alert('Success', 'Phone number verified successfully');
        onVerified(phoneNumber);
        resetModal();
        onClose();
      }
    } catch (error) {
      console.error('Verify code error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setCode('');
    setCodeSent(false);
    setVerificationId('');
    setCountdown(0);
    verificationService.clearVerification();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.phoneSection}>
              <Ionicons name="phone-portrait" size={24} color="#013358" />
              <Text style={styles.phoneText}>
                {formatPhoneDisplay(phoneNumber)}
              </Text>
            </View>

            <Text style={styles.subtitle}>
              {!codeSent 
                ? "We'll send a verification code to this number" 
                : "Enter the 6-digit code sent to your phone"
              }
            </Text>

            {!codeSent ? (
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={sendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Send Code</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.codeInputContainer}>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="000000"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    maxLength={6}
                    textAlign="center"
                    placeholderTextColor="#999"
                  />
                </View>

                <TouchableOpacity 
                  style={[
                    styles.button, 
                    (loading || code.length !== 6) && styles.buttonDisabled
                  ]} 
                  onPress={verifyCode}
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Verify Code</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={sendCode} 
                  disabled={loading || countdown > 0}
                  style={styles.resendButton}
                >
                  <Text style={[
                    styles.resendText,
                    (countdown > 0) && styles.resendTextDisabled
                  ]}>
                    {countdown > 0 
                      ? `Resend code in ${countdown}s` 
                      : 'Resend Code'
                    }
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer */}
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#013358',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  phoneSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  phoneText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#013358',
    marginLeft: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
  },
  codeInputContainer: {
    marginBottom: 20,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#013358',
    borderRadius: 10,
    padding: 15,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#013358',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#013358',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendButton: {
    padding: 10,
    alignItems: 'center',
  },
  resendText: {
    color: '#013358',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  resendTextDisabled: {
    color: '#999',
    textDecorationLine: 'none',
  },
  cancelButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

export default PhoneVerificationModal;
