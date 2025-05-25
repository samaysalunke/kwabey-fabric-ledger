export const ROLES = {
  INWARD_CLERK: 'INWARD_CLERK',
  QUALITY_CHECKER: 'QUALITY_CHECKER',
  APPROVER: 'APPROVER',
  SUPERADMIN: 'SUPERADMIN',
};

export const QUANTITY_UNITS = ['KG', 'METER'] as const;
export const FABRIC_TYPES = ['KNITTED', 'WOVEN'] as const;
export const UAT_UNITS = ['KG', 'METER'] as const;
export const ROLL_UNITS = ['KG', 'METER'] as const;
export const COLOR_FASTNESS = ['OKAY', 'NOT_OKAY'] as const;
export const FABRIC_STATUS = ['PENDING_QUALITY', 'QUALITY_CHECKED', 'READY_TO_ISSUE', 'ON_HOLD'] as const;
export const APPROVAL_STATUS = ['APPROVED', 'ON_HOLD'] as const;
export const HOLD_REASONS = ['QUANTITY_INSUFFICIENT', 'MATERIAL_DEFECTIVE'] as const; 