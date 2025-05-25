import { useAuth } from '../contexts/AuthContext';

// Define permissions as simple strings
export const PERMISSIONS = {
  // Fabric Inward
  FABRIC_INWARD_CREATE: 'fabric_inward:create',
  FABRIC_INWARD_READ: 'fabric_inward:read',
  FABRIC_INWARD_UPDATE: 'fabric_inward:update',
  FABRIC_INWARD_DELETE: 'fabric_inward:delete',
  
  // Quality Parameters
  QUALITY_PARAMS_CREATE: 'quality_params:create',
  QUALITY_PARAMS_READ: 'quality_params:read',
  QUALITY_PARAMS_UPDATE: 'quality_params:update',
  
  // Quantity Approval
  QUANTITY_APPROVAL_CREATE: 'quantity_approval:create',
  QUANTITY_APPROVAL_READ: 'quantity_approval:read',
  QUANTITY_APPROVAL_APPROVE: 'quantity_approval:approve',
  QUANTITY_APPROVAL_REJECT: 'quantity_approval:reject',
  
  // Reports
  REPORTS_VIEW_ALL: 'reports:view_all',
  REPORTS_VIEW_OWN: 'reports:view_own',
  REPORTS_EXPORT: 'reports:export',
  
  // System Administration
  SYSTEM_SETTINGS: 'system:settings',
  USER_MANAGEMENT: 'user:management',
} as const;

// Define role permissions mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  INWARD_CLERK: [
    PERMISSIONS.FABRIC_INWARD_CREATE,
    PERMISSIONS.FABRIC_INWARD_READ,
    PERMISSIONS.FABRIC_INWARD_UPDATE,
    PERMISSIONS.REPORTS_VIEW_OWN,
  ],
  
  QUALITY_CHECKER: [
    PERMISSIONS.FABRIC_INWARD_READ,
    PERMISSIONS.QUALITY_PARAMS_CREATE,
    PERMISSIONS.QUALITY_PARAMS_READ,
    PERMISSIONS.QUALITY_PARAMS_UPDATE,
    PERMISSIONS.REPORTS_VIEW_OWN,
  ],
  
  APPROVER: [
    PERMISSIONS.FABRIC_INWARD_READ,
    PERMISSIONS.QUALITY_PARAMS_READ,
    PERMISSIONS.QUANTITY_APPROVAL_CREATE,
    PERMISSIONS.QUANTITY_APPROVAL_READ,
    PERMISSIONS.QUANTITY_APPROVAL_APPROVE,
    PERMISSIONS.QUANTITY_APPROVAL_REJECT,
    PERMISSIONS.REPORTS_VIEW_OWN,
  ],
  
  SUPERADMIN: [
    // All permissions
    PERMISSIONS.FABRIC_INWARD_CREATE,
    PERMISSIONS.FABRIC_INWARD_READ,
    PERMISSIONS.FABRIC_INWARD_UPDATE,
    PERMISSIONS.FABRIC_INWARD_DELETE,
    PERMISSIONS.QUALITY_PARAMS_CREATE,
    PERMISSIONS.QUALITY_PARAMS_READ,
    PERMISSIONS.QUALITY_PARAMS_UPDATE,
    PERMISSIONS.QUANTITY_APPROVAL_CREATE,
    PERMISSIONS.QUANTITY_APPROVAL_READ,
    PERMISSIONS.QUANTITY_APPROVAL_APPROVE,
    PERMISSIONS.QUANTITY_APPROVAL_REJECT,
    PERMISSIONS.REPORTS_VIEW_ALL,
    PERMISSIONS.REPORTS_VIEW_OWN,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.USER_MANAGEMENT,
  ],
};

// Define data access levels
export const DATA_ACCESS_LEVELS = {
  OWN_ONLY: 'own_only',
  DEPARTMENT: 'department',
  ALL: 'all',
} as const;

const ROLE_DATA_ACCESS: Record<string, string> = {
  INWARD_CLERK: DATA_ACCESS_LEVELS.OWN_ONLY,
  QUALITY_CHECKER: DATA_ACCESS_LEVELS.OWN_ONLY,
  APPROVER: DATA_ACCESS_LEVELS.DEPARTMENT,
  SUPERADMIN: DATA_ACCESS_LEVELS.ALL,
};

export function useRBAC() {
  const { user, role } = useAuth();

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  };

  /**
   * Check if current user can access specific data
   */
  const canAccessData = (dataOwnerId: string, dataDepartment?: string): boolean => {
    if (!role || !user) return false;

    const accessLevel = ROLE_DATA_ACCESS[role];
    
    switch (accessLevel) {
      case DATA_ACCESS_LEVELS.OWN_ONLY:
        return dataOwnerId === user.id;
      
      case DATA_ACCESS_LEVELS.DEPARTMENT:
        // For now, approvers can see all data in their workflow
        return true;
      
      case DATA_ACCESS_LEVELS.ALL:
        return true;
      
      default:
        return false;
    }
  };

  /**
   * Check if user can modify a fabric entry based on status and ownership
   */
  const canModifyFabricEntry = (entryStatus: string, entryOwnerId: string): boolean => {
    if (!role || !user) return false;

    // Superadmin can modify anything
    if (role === 'SUPERADMIN') return true;

    switch (role) {
      case 'INWARD_CLERK':
        // Can only modify their own entries that are still pending quality
        return entryOwnerId === user.id && entryStatus === 'PENDING_QUALITY';
      
      case 'QUALITY_CHECKER':
        // Can modify entries that are pending quality check
        return entryStatus === 'PENDING_QUALITY';
      
      case 'APPROVER':
        // Can modify entries that have passed quality check
        return entryStatus === 'QUALITY_CHECKED';
      
      default:
        return false;
    }
  };

  /**
   * Get allowed status transitions for current role
   */
  const getAllowedStatusTransitions = (currentStatus: string): string[] => {
    if (!role) return [];

    switch (role) {
      case 'INWARD_CLERK':
        if (currentStatus === 'PENDING_QUALITY') {
          return ['PENDING_QUALITY']; // Can only keep it pending
        }
        return [];

      case 'QUALITY_CHECKER':
        if (currentStatus === 'PENDING_QUALITY') {
          return ['QUALITY_CHECKED', 'ON_HOLD'];
        }
        return [];

      case 'APPROVER':
        if (currentStatus === 'QUALITY_CHECKED') {
          return ['APPROVED', 'ON_HOLD'];
        }
        return [];

      case 'SUPERADMIN':
        return ['PENDING_QUALITY', 'QUALITY_CHECKED', 'APPROVED', 'ON_HOLD'];

      default:
        return [];
    }
  };

  /**
   * Check if user can perform specific actions
   */
  const canCreateFabricEntry = () => hasPermission(PERMISSIONS.FABRIC_INWARD_CREATE);
  const canUpdateFabricEntry = () => hasPermission(PERMISSIONS.FABRIC_INWARD_UPDATE);
  const canDeleteFabricEntry = () => hasPermission(PERMISSIONS.FABRIC_INWARD_DELETE);
  
  const canCreateQualityParams = () => hasPermission(PERMISSIONS.QUALITY_PARAMS_CREATE);
  const canUpdateQualityParams = () => hasPermission(PERMISSIONS.QUALITY_PARAMS_UPDATE);
  
  const canApproveQuantity = () => hasPermission(PERMISSIONS.QUANTITY_APPROVAL_APPROVE);
  const canRejectQuantity = () => hasPermission(PERMISSIONS.QUANTITY_APPROVAL_REJECT);
  
  const canViewAllReports = () => hasPermission(PERMISSIONS.REPORTS_VIEW_ALL);
  const canExportReports = () => hasPermission(PERMISSIONS.REPORTS_EXPORT);
  
  const canManageUsers = () => hasPermission(PERMISSIONS.USER_MANAGEMENT);
  const canManageSettings = () => hasPermission(PERMISSIONS.SYSTEM_SETTINGS);

  return {
    // Core permission checking
    hasPermission,
    canAccessData,
    canModifyFabricEntry,
    getAllowedStatusTransitions,
    
    // Specific action permissions
    canCreateFabricEntry,
    canUpdateFabricEntry,
    canDeleteFabricEntry,
    canCreateQualityParams,
    canUpdateQualityParams,
    canApproveQuantity,
    canRejectQuantity,
    canViewAllReports,
    canExportReports,
    canManageUsers,
    canManageSettings,
    
    // User info
    currentRole: role,
    currentUser: user,
  };
} 