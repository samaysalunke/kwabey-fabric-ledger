import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';

interface ProtectedActionProps {
  children: React.ReactNode;
  permission?: string;
  fallback?: React.ReactNode;
  requireAll?: boolean;
  permissions?: string[];
}

/**
 * Component that conditionally renders children based on user permissions
 * Can be used to hide/show buttons, forms, or any UI elements based on RBAC
 */
const ProtectedAction: React.FC<ProtectedActionProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission } = useRBAC();

  // Single permission check
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Multiple permissions check
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every(perm => hasPermission(perm))
      : permissions.some(perm => hasPermission(perm));
    
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // No permissions specified, render children
  return <>{children}</>;
};

export default ProtectedAction; 