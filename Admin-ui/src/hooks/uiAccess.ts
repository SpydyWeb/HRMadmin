// src/hooks/useUIAccess.ts
import { useQuery } from '@tanstack/react-query';
import { uiAccessService, UIAccessResponse, UIMenuItem, TAB_SECTION_MAP } from '@/services/uiAccessService';
import { useAuth } from '@/hooks/useAuth';
import { getCntrlId, getFieldName } from '@/utils/fieldControlMapping';

export const useUIAccess = (section: string, type: string = 'Screen') => {
  // Get the current user's role ID from your auth store
  const { user } = useAuth();
  const roleId = user?.roleId ?? 0; // Use 0 as default as per API requirement

  const {
    data: uiAccessData,
    isLoading,
    isError,
    error
  } = useQuery<UIAccessResponse>({
    queryKey: ['ui-access', roleId, section, type],
    queryFn: () => {
      console.log('🔍 Calling UI Access API with:', { roleId, searchFor: 1, section, type });
      return uiAccessService.getUIAccessPermissions(roleId, 1);
    },
    enabled: true, // Always enable - API accepts roleId: 0
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1
  });

  // Log the response for debugging
  if (uiAccessData) {
    console.log('📦 UI Access Data received:', uiAccessData);
    console.log('🌳 Full UI Access Response Structure:', JSON.stringify(uiAccessData, null, 2));
    console.log('🔎 Looking for section:', section, 'type:', type);
  }

  // Find the specific screen (menu item) for the given section and type
  const findScreen = (items: UIMenuItem[] = [], section: string, type: string): UIMenuItem | null => {
    for (const item of items) {
      // API uses "Agent" but we pass "agent", so compare case-insensitively
      if (item.section?.toLowerCase() === section.toLowerCase() && item.type === type) {
        return item;
      }
    }
    return null;
  };

  const screen = findScreen(uiAccessData?.uiMenuResponse?.uiMenu || [], section, type);
  
  // Log found screen for debugging
  if (screen) {
    console.log('✅ Found screen:', screen);
    console.log('📋 Available tabs:', screen.subSection?.map(tab => ({ section: tab.section, type: tab.type })));
  } else {
    console.log('⚠️ Screen not found for section:', section, 'type:', type);
    console.log('📋 Available screens:', uiAccessData?.uiMenuResponse?.uiMenu?.map(item => ({ section: item.section, type: item.type })));
  }
  
  // Check if a specific tab is visible
  const isTabVisible = (tabValue: string): boolean => {
    if (!screen || !screen.subSection) {
      console.log(`🔍 Tab "${tabValue}": No screen or tabs, defaulting to visible`);
      return true; // Default to visible if no restrictions
    }
    
    // Map tab value to API section name
    const apiSectionName = TAB_SECTION_MAP[tabValue] || tabValue;
    
    const tab = screen.subSection.find(t => 
      t.type === 'Tab' && t.section?.toLowerCase() === apiSectionName.toLowerCase()
    );
    
    const isVisible = !!tab;
    console.log(`🔍 Tab "${tabValue}" (API: "${apiSectionName}"): ${isVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`, tab ? { section: tab.section, type: tab.type } : 'not found');
    return isVisible; // If tab is in the list, it's visible
  };
  
  // Helper to find all fields in a tab (across all sections within the tab)
  const findFieldsInTab = (tabValue: string): Array<{ cntrlid: number; cntrlName: string; render: boolean; allowedit: boolean }> => {
    if (!screen || !screen.subSection) return [];
    
    const apiSectionName = TAB_SECTION_MAP[tabValue] || tabValue;
    const tab = screen.subSection.find(t => 
      t.type === 'Tab' && t.section?.toLowerCase() === apiSectionName.toLowerCase()
    );
    
    if (!tab || !tab.subSection) return [];
    
    // Collect all fields from all sections within this tab
    const allFields: Array<{ cntrlid: number; cntrlName: string; render: boolean; allowedit: boolean }> = [];
    tab.subSection.forEach(section => {
      if (section.type === 'Section' && section.fieldList) {
        section.fieldList.forEach(field => {
          allFields.push({
            cntrlid: field.cntrlid,
            cntrlName: field.cntrlName,
            render: field.render,
            allowedit: field.allowedit
          });
        });
      }
    });
    
    console.log(`📋 Fields found in tab "${tabValue}":`, allFields);
    return allFields;
  };
  
  // Helper to normalize field names for matching
  const normalizeFieldName = (name: string): string => {
    return name.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/agent\s*/gi, '')
      .replace(/bank\s*/gi, '')
      .replace(/\s*type/gi, '')
      .trim();
  };

  // Check if a specific field is visible
  const isFieldVisible = (tabValue: string, fieldIdentifier: string, fieldLabel?: string): boolean => {
    const fields = findFieldsInTab(tabValue);
    
    if (fields.length === 0) {
      console.log(`🔍 Field "${fieldIdentifier}"${fieldLabel ? ` (${fieldLabel})` : ''} in tab "${tabValue}": No field restrictions, defaulting to visible`);
      return true; // Default to visible if no field restrictions
    }
    
    // Try to match by cntrlid first (if fieldIdentifier is a number or we can map it)
    const cntrlid = getCntrlId(fieldIdentifier);
    let field = cntrlid 
      ? fields.find(f => f.cntrlid === cntrlid)
      : undefined;
    
    // Debug: Log cntrlid matching attempt for accountType specifically
    if (fieldIdentifier === 'accountType' || fieldLabel?.includes('Bank Account Type')) {
      console.log(`   🔎 [accountType] Trying to match by cntrlid ${cntrlid}...`, field ? `✅ FOUND: ${field.cntrlName}` : `❌ NOT FOUND (cntrlid ${cntrlid} not in API)`);
    }
    
    // If not found by cntrlid, try matching by cntrlName, field name, or label
    if (!field) {
      const normalizedIdentifier = normalizeFieldName(fieldIdentifier);
      const normalizedLabel = fieldLabel ? normalizeFieldName(fieldLabel) : '';
      
      // Debug for accountType
      if (fieldIdentifier === 'accountType' || fieldLabel?.includes('Bank Account Type')) {
        console.log(`   🔎 [accountType] Trying name/label matching...`);
        console.log(`      normalizedIdentifier: "${normalizedIdentifier}"`);
        console.log(`      normalizedLabel: "${normalizedLabel}"`);
      }
      
      field = fields.find(f => {
        const fieldName = getFieldName(f.cntrlid);
        const normalizedCntrlName = normalizeFieldName(f.cntrlName || '');
        const normalizedMappedName = fieldName ? normalizeFieldName(fieldName) : '';
        
        // Try matching by field name/identifier
        // Prioritize exact matches, then use includes only if strings are similar length
        // This prevents "account" from matching "accountno"
        const exactMatchByName = 
          normalizedMappedName === normalizedIdentifier ||
          normalizedCntrlName === normalizedIdentifier;
        
        const partialMatchByName = !exactMatchByName && (
          // Only use includes if the shorter string is at least 80% of the longer string
          // This prevents "account" from matching "accountno" (6/9 = 67% < 80%)
          (normalizedCntrlName.length > 0 && normalizedIdentifier.length > 0 && 
           Math.min(normalizedCntrlName.length, normalizedIdentifier.length) / 
           Math.max(normalizedCntrlName.length, normalizedIdentifier.length) >= 0.8 &&
           (normalizedCntrlName.includes(normalizedIdentifier) ||
            normalizedIdentifier.includes(normalizedCntrlName))) ||
          // Also check original field names (case-insensitive)
          (f.cntrlName && fieldIdentifier && 
           Math.min(f.cntrlName.toLowerCase().length, fieldIdentifier.toLowerCase().length) / 
           Math.max(f.cntrlName.toLowerCase().length, fieldIdentifier.toLowerCase().length) >= 0.8 &&
           (f.cntrlName.toLowerCase().includes(fieldIdentifier.toLowerCase()) ||
            fieldIdentifier.toLowerCase().includes(f.cntrlName.toLowerCase())))
        );
        
        const matchesByName = exactMatchByName || partialMatchByName;
        
        // Try matching by label if provided
        const exactMatchByLabel = normalizedLabel && (
          normalizedCntrlName === normalizedLabel
        );
        
        const partialMatchByLabel = normalizedLabel && !exactMatchByLabel && (
          // Only use includes if strings are similar length
          Math.min(normalizedCntrlName.length, normalizedLabel.length) / 
          Math.max(normalizedCntrlName.length, normalizedLabel.length) >= 0.6 &&
          (normalizedCntrlName.includes(normalizedLabel) ||
           normalizedLabel.includes(normalizedCntrlName)) ||
          // Also check original labels
          (f.cntrlName && fieldLabel &&
           Math.min(f.cntrlName.toLowerCase().length, fieldLabel.toLowerCase().length) / 
           Math.max(f.cntrlName.toLowerCase().length, fieldLabel.toLowerCase().length) >= 0.6 &&
           (f.cntrlName.toLowerCase().includes(fieldLabel.toLowerCase()) ||
            fieldLabel.toLowerCase().includes(f.cntrlName.toLowerCase())))
        );
        
        const matchesByLabel = exactMatchByLabel || partialMatchByLabel;
        
        const matches = matchesByName || matchesByLabel;
        
        // Debug for accountType
        if ((fieldIdentifier === 'accountType' || fieldLabel?.includes('Bank Account Type')) && matches) {
          console.log(`   ⚠️ [accountType] FALSE MATCH detected with field:`, {
            cntrlid: f.cntrlid,
            cntrlName: f.cntrlName,
            matchesByName,
            matchesByLabel,
            exactMatchByName,
            partialMatchByName,
            exactMatchByLabel,
            partialMatchByLabel
          });
        }
        
        return matches;
      });
      
      if (fieldIdentifier === 'accountType' || fieldLabel?.includes('Bank Account Type')) {
        console.log(`   🔎 [accountType] Name/label matching result:`, field ? `✅ FOUND: ${field.cntrlName}` : '❌ NOT FOUND');
      }
    }
    
    // If field restrictions exist but field is not found, hide it
    // If no field restrictions exist, show it (default behavior)
    const isVisible = field ? field.render : (fields.length === 0 ? true : false);
    
    // Enhanced logging
    if (!field && fields.length > 0) {
      console.log(`❌ Field "${fieldIdentifier}"${fieldLabel ? ` (${fieldLabel})` : ''} NOT FOUND in API restrictions for tab "${tabValue}"`);
      console.log(`   Available fields in API:`, fields.map(f => ({ cntrlid: f.cntrlid, cntrlName: f.cntrlName, render: f.render })));
      console.log(`   Tried matching with: fieldIdentifier="${fieldIdentifier}", fieldLabel="${fieldLabel}", cntrlid=${cntrlid || 'N/A'}`);
    }
    
    console.log(`🔍 Field "${fieldIdentifier}"${fieldLabel ? ` (${fieldLabel})` : ''} (cntrlid: ${cntrlid || 'N/A'}) in tab "${tabValue}": ${isVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`, field ? { cntrlid: field.cntrlid, cntrlName: field.cntrlName, render: field.render } : `not found (${fields.length} fields in restrictions)`);
    return isVisible;
  };
  
  // Check if a specific field is editable
  const isFieldEditable = (tabValue: string, fieldIdentifier: string, fieldLabel?: string): boolean => {
    const fields = findFieldsInTab(tabValue);
    
    if (fields.length === 0) return true; // Default to editable if no field restrictions
    
    // Try to match by cntrlid first (if fieldIdentifier is a number or we can map it)
    const cntrlid = getCntrlId(fieldIdentifier);
    let field = cntrlid 
      ? fields.find(f => f.cntrlid === cntrlid)
      : undefined;
    
    // If not found by cntrlid, try matching by cntrlName, field name, or label
    if (!field) {
      const normalizedIdentifier = normalizeFieldName(fieldIdentifier);
      const normalizedLabel = fieldLabel ? normalizeFieldName(fieldLabel) : '';
      
      field = fields.find(f => {
        const fieldName = getFieldName(f.cntrlid);
        const normalizedCntrlName = normalizeFieldName(f.cntrlName || '');
        const normalizedMappedName = fieldName ? normalizeFieldName(fieldName) : '';
        
        // Try matching by field name/identifier
        const matchesByName = 
          normalizedMappedName === normalizedIdentifier ||
          normalizedCntrlName === normalizedIdentifier ||
          normalizedCntrlName.includes(normalizedIdentifier) ||
          normalizedIdentifier.includes(normalizedCntrlName) ||
          f.cntrlName?.toLowerCase().includes(fieldIdentifier.toLowerCase()) ||
          fieldIdentifier.toLowerCase().includes(f.cntrlName?.toLowerCase() || '');
        
        // Try matching by label if provided
        const matchesByLabel = normalizedLabel && (
          normalizedCntrlName === normalizedLabel ||
          normalizedCntrlName.includes(normalizedLabel) ||
          normalizedLabel.includes(normalizedCntrlName) ||
          f.cntrlName?.toLowerCase().includes(fieldLabel?.toLowerCase() || '') ||
          fieldLabel?.toLowerCase().includes(f.cntrlName?.toLowerCase() || '')
        );
        
        return matchesByName || matchesByLabel;
      });
    }
    
    const isEditable = field ? field.allowedit : (fields.length === 0 ? true : false);
    console.log(`🔍 Field "${fieldIdentifier}"${fieldLabel ? ` (${fieldLabel})` : ''} (cntrlid: ${cntrlid || 'N/A'}) in tab "${tabValue}": ${isEditable ? '✅ EDITABLE' : '❌ READ-ONLY'}`, field ? { cntrlid: field.cntrlid, cntrlName: field.cntrlName, allowedit: field.allowedit } : `not found (${fields.length} fields in restrictions)`);
    return isEditable;
  };

  return {
    isLoading,
    isError,
    error,
    menuItem: screen, // Keep for backward compatibility
    isTabVisible,
    isFieldVisible,
    isFieldEditable
  };
};