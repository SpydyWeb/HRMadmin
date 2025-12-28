import React, { useEffect, useState } from 'react'
import CommissionFormulaEditor from '@/components/commission/CommissionFormulaEditor'


interface SecondStepCommissionConfigProps {
  commissionConfigId?: number; 
  onSaveSuccess: () => void;
}

const SecondStepCommissionConfig: React.FC<SecondStepCommissionConfigProps> = ({ 
  commissionConfigId = 0,
  onSaveSuccess
}) => {
  return (
    <CommissionFormulaEditor
      commissionConfigId={commissionConfigId}
      onSaveSuccess={onSaveSuccess}
      initialFormula=""
    />
  );
};

export { SecondStepCommissionConfig };