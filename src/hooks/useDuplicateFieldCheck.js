import { useState, useCallback } from 'react';
import duplicateFieldService from '../services/duplicateFieldService';

export function useDuplicateFieldCheck() {
  const [checking, setChecking] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState({
    visible: false,
    fieldName: '',
    fieldValue: '',
    existingRecord: null,
  });

  const checkField = useCallback(async (fieldName, fieldValue, excludeId = null) => {
    if (!fieldValue || fieldValue.trim() === '') {
      return { isDuplicate: false, record: null };
    }

    setChecking(true);
    try {
      const result = await duplicateFieldService.checkDuplicateField(
        fieldName, 
        fieldValue, 
        excludeId
      );
      
      if (result.isDuplicate) {
        setDuplicateAlert({
          visible: true,
          fieldName,
          fieldValue,
          existingRecord: result.record,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error checking duplicate field:', error);
      return { isDuplicate: false, record: null };
    } finally {
      setChecking(false);
    }
  }, []);

  const checkFarmerDuplicates = useCallback(async (farmerData, excludeId = null) => {
    setChecking(true);
    try {
      const result = await duplicateFieldService.checkFarmerDuplicates(farmerData, excludeId);
      
      if (result.hasDuplicates && result.duplicates.length > 0) {
        // Show alert for the first duplicate found
        const firstDuplicate = result.duplicates[0];
        setDuplicateAlert({
          visible: true,
          fieldName: firstDuplicate.fieldName,
          fieldValue: firstDuplicate.fieldValue,
          existingRecord: firstDuplicate.record,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error checking farmer duplicates:', error);
      return { hasDuplicates: false, duplicates: [] };
    } finally {
      setChecking(false);
    }
  }, []);

  const hideDuplicateAlert = useCallback(() => {
    setDuplicateAlert({
      visible: false,
      fieldName: '',
      fieldValue: '',
      existingRecord: null,
    });
  }, []);

  const showDuplicateAlert = useCallback((fieldName, fieldValue, existingRecord) => {
    setDuplicateAlert({
      visible: true,
      fieldName,
      fieldValue,
      existingRecord,
    });
  }, []);

  return {
    checking,
    duplicateAlert,
    checkField,
    checkFarmerDuplicates,
    hideDuplicateAlert,
    showDuplicateAlert,
  };
}

export default useDuplicateFieldCheck;
