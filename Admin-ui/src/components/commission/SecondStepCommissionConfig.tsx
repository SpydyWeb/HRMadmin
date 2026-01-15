import React, { useMemo, useEffect } from 'react'
import CommissionFormulaEditor from '@/components/commission/CommissionFormulaEditor'


interface SecondStepCommissionConfigProps {
  commissionConfigId?: number; 
  initialData?: any;
  isEditMode?: boolean;
  onSaveSuccess: () => void;
}

const SecondStepCommissionConfig: React.FC<SecondStepCommissionConfigProps> = ({ 
  commissionConfigId = 0,
  initialData,
  isEditMode = false,
  onSaveSuccess
}) => {
  // Log commissionConfigId on mount to debug
  useEffect(() => {
    console.log('SecondStepCommissionConfig - commissionConfigId received:', commissionConfigId);
    console.log('SecondStepCommissionConfig - isEditMode:', isEditMode);
    if (!commissionConfigId || commissionConfigId === 0) {
      console.warn('SecondStepCommissionConfig - Warning: commissionConfigId is missing or 0. Step 1 may not be completed.');
    }
  }, [commissionConfigId, isEditMode]);

  // Extract condition from initialData - check multiple possible field names
  // The condition might be stored as 'condition', 'formula', or other variations
  const initialFormula = useMemo(() => {
    if (!initialData) return '';
    
    // Check for condition field (most common)
    if (initialData.condition) {
      return initialData.condition;
    }
    
    // Check for formula field
    if (initialData.formula) {
      return initialData.formula;
    }
    
    // // Check for commissionFormula field
    // if (initialData.commissionFormula) {
    //   return initialData.commissionFormula;
    // }
    
    // Return empty string if no condition found
    return '';
  }, [initialData]);

  return (
    <CommissionFormulaEditor
      key={isEditMode && initialData ? `edit-${commissionConfigId}` : `new-${commissionConfigId}`}
      commissionConfigId={commissionConfigId}
      onSaveSuccess={onSaveSuccess}
      initialFormula={initialFormula}
    />
  );
};

export { SecondStepCommissionConfig };