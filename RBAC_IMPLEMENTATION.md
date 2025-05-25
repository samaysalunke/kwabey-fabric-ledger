# Role-Based Access Control (RBAC) Implementation

## 🎯 Overview

The Fabric Ledger Management System now implements a comprehensive Role-Based Access Control (RBAC) system that provides granular permissions and secure access control across all modules.

## 🔐 RBAC Architecture

### Core Components

1. **`useRBAC` Hook** (`src/hooks/useRBAC.ts`)
   - Central permission checking logic
   - Role-based data access control
   - Status transition management

2. **`ProtectedAction` Component** (`src/components/auth/ProtectedAction.tsx`)
   - UI element protection based on permissions
   - Conditional rendering with fallbacks
   - Multiple permission checking support

3. **`ProtectedRoute` Component** (`src/components/auth/ProtectedRoute.tsx`)
   - Route-level access control
   - Role-based navigation protection

## 👥 Roles & Permissions

### Role Hierarchy

```
SUPERADMIN (Full Access)
    ├── APPROVER (Department Level)
    ├── QUALITY_CHECKER (Own Data)
    └── INWARD_CLERK (Own Data)
```

### Detailed Permissions

#### 🔵 **INWARD_CLERK**
**Data Access**: Own entries only
**Permissions**:
- ✅ `fabric_inward:create` - Create new fabric entries
- ✅ `fabric_inward:read` - View fabric entries
- ✅ `fabric_inward:update` - Edit own pending entries
- ✅ `reports:view_own` - View own reports

**Workflow Access**:
- Can create new fabric entries
- Can edit own entries while status is `PENDING_QUALITY`
- Cannot modify entries after quality check starts
- Can view reports for their own entries

#### 🟢 **QUALITY_CHECKER**
**Data Access**: Own quality checks only
**Permissions**:
- ✅ `fabric_inward:read` - View all fabric entries
- ✅ `quality_params:create` - Add quality parameters
- ✅ `quality_params:read` - View quality data
- ✅ `quality_params:update` - Update quality parameters
- ✅ `reports:view_own` - View quality reports

**Workflow Access**:
- Can view all fabric entries pending quality check
- Can add/update quality parameters
- Can change status from `PENDING_QUALITY` to `QUALITY_CHECKED` or `ON_HOLD`
- Cannot modify approved entries

#### 🟡 **APPROVER**
**Data Access**: Department level (all entries in workflow)
**Permissions**:
- ✅ `fabric_inward:read` - View all fabric entries
- ✅ `quality_params:read` - View quality data
- ✅ `quantity_approval:create` - Create approval records
- ✅ `quantity_approval:read` - View approval data
- ✅ `quantity_approval:approve` - Approve quantities
- ✅ `quantity_approval:reject` - Reject/hold quantities
- ✅ `reports:view_own` - View approval reports

**Workflow Access**:
- Can view all entries that passed quality check
- Can approve or reject quantities
- Can change status from `QUALITY_CHECKED` to `APPROVED` or `ON_HOLD`
- Can view comprehensive workflow reports

#### 🔴 **SUPERADMIN**
**Data Access**: All data across system
**Permissions**: All permissions (full access)
- ✅ All fabric inward operations (CRUD)
- ✅ All quality parameter operations (CRUD)
- ✅ All quantity approval operations (CRUD)
- ✅ All reporting capabilities
- ✅ User management
- ✅ System settings

**Workflow Access**:
- Can perform any action on any entry
- Can change status to any valid state
- Can override workflow restrictions
- Can manage users and system settings

## 🔄 Status Workflow & Permissions

### Status Transitions

```
PENDING_QUALITY → QUALITY_CHECKED → APPROVED
       ↓               ↓              ↓
    ON_HOLD         ON_HOLD       ON_HOLD
```

### Role-Based Status Control

| Current Status | INWARD_CLERK | QUALITY_CHECKER | APPROVER | SUPERADMIN |
|----------------|--------------|-----------------|----------|------------|
| `PENDING_QUALITY` | ✅ Keep pending | ✅ → `QUALITY_CHECKED`<br>✅ → `ON_HOLD` | ❌ | ✅ Any status |
| `QUALITY_CHECKED` | ❌ | ❌ | ✅ → `APPROVED`<br>✅ → `ON_HOLD` | ✅ Any status |
| `APPROVED` | ❌ | ❌ | ❌ | ✅ Any status |
| `ON_HOLD` | ❌ | ✅ Resume workflow | ✅ Resume workflow | ✅ Any status |

## 🛠️ Implementation Examples

### 1. Using the RBAC Hook

```typescript
import { useRBAC } from '../hooks/useRBAC';

function MyComponent() {
  const { 
    hasPermission, 
    canCreateFabricEntry, 
    canModifyFabricEntry,
    getAllowedStatusTransitions 
  } = useRBAC();

  // Check specific permission
  if (hasPermission('fabric_inward:create')) {
    // Show create button
  }

  // Check if user can modify specific entry
  if (canModifyFabricEntry('PENDING_QUALITY', 'user-id-123')) {
    // Show edit button
  }

  // Get allowed status transitions
  const allowedStatuses = getAllowedStatusTransitions('PENDING_QUALITY');
}
```

### 2. Protecting UI Elements

```typescript
import ProtectedAction from '../components/auth/ProtectedAction';

function FabricEntryForm() {
  return (
    <div>
      {/* Single permission check */}
      <ProtectedAction permission="fabric_inward:create">
        <Button>Create Entry</Button>
      </ProtectedAction>

      {/* Multiple permissions (any) */}
      <ProtectedAction 
        permissions={['fabric_inward:update', 'fabric_inward:delete']}
        fallback={<div>No edit permissions</div>}
      >
        <Button>Edit Entry</Button>
      </ProtectedAction>

      {/* Multiple permissions (all required) */}
      <ProtectedAction 
        permissions={['quality_params:create', 'quality_params:update']}
        requireAll={true}
      >
        <QualityForm />
      </ProtectedAction>
    </div>
  );
}
```

### 3. Route Protection

```typescript
// Already implemented in App.tsx
<Route
  path="/inward"
  element={
    <ProtectedRoute roles={['INWARD_CLERK', 'SUPERADMIN']}>
      <InwardModule />
    </ProtectedRoute>
  }
/>
```

## 🔒 Data Access Control

### Access Levels

1. **OWN_ONLY**: Users can only access data they created
   - Applied to: INWARD_CLERK, QUALITY_CHECKER

2. **DEPARTMENT**: Users can access data within their workflow scope
   - Applied to: APPROVER

3. **ALL**: Users can access all data
   - Applied to: SUPERADMIN

### Database-Level Security

The system implements Row Level Security (RLS) in Supabase:

```sql
-- Example RLS policy
CREATE POLICY "Users can only see their own entries" ON fabric_entries
  FOR SELECT USING (
    auth.uid() = inwarded_by_id OR 
    auth.jwt() ->> 'role' = 'SUPERADMIN'
  );
```

## 🚀 Benefits

### Security Benefits
- ✅ **Principle of Least Privilege**: Users only get minimum required access
- ✅ **Data Isolation**: Role-based data access prevents unauthorized viewing
- ✅ **Workflow Integrity**: Status transitions follow business rules
- ✅ **Audit Trail**: All actions are tied to authenticated users

### User Experience Benefits
- ✅ **Clean UI**: Users only see relevant features
- ✅ **Clear Feedback**: Permission denied messages guide users
- ✅ **Role-Appropriate Dashboards**: Customized experience per role
- ✅ **Workflow Guidance**: Status transitions guide users through process

### Development Benefits
- ✅ **Reusable Components**: `ProtectedAction` can be used anywhere
- ✅ **Centralized Logic**: All permission logic in one place
- ✅ **Type Safety**: TypeScript ensures correct permission usage
- ✅ **Easy Testing**: Mock roles for comprehensive testing

## 🧪 Testing RBAC

### Test Scenarios

1. **Login as each role** and verify:
   - Correct navigation items appear
   - Appropriate dashboard cards show
   - Form buttons are enabled/disabled correctly

2. **Test workflow transitions**:
   - INWARD_CLERK creates entry → status: PENDING_QUALITY
   - QUALITY_CHECKER adds quality → status: QUALITY_CHECKED
   - APPROVER approves → status: APPROVED

3. **Test permission boundaries**:
   - INWARD_CLERK cannot access quality module
   - QUALITY_CHECKER cannot approve quantities
   - APPROVER cannot create new entries

### Test Users

Use your existing test accounts:
- `admin@kwabey.com` (SUPERADMIN)
- `inward@kwabey.com` (INWARD_CLERK)
- `quality@kwabey.com` (QUALITY_CHECKER)
- `quantity@kwabey.com` (APPROVER)

## 📈 Future Enhancements

### Planned Features
1. **Dynamic Role Assignment**: Admin interface for role management
2. **Permission Groups**: Grouping permissions for easier management
3. **Temporary Permissions**: Time-limited access grants
4. **Department-Based Access**: More granular department controls
5. **Audit Logging**: Comprehensive action logging
6. **API Rate Limiting**: Role-based API usage limits

### Advanced RBAC Features
1. **Attribute-Based Access Control (ABAC)**: Context-aware permissions
2. **Hierarchical Roles**: Role inheritance and delegation
3. **Resource-Level Permissions**: Per-entry access control
4. **Conditional Permissions**: Time/location-based access

## 🎯 CPO Demo Scenarios

### Scenario 1: Complete Workflow Demo
1. **Login as INWARD_CLERK** → Create fabric entry
2. **Login as QUALITY_CHECKER** → Add quality parameters
3. **Login as APPROVER** → Approve quantity
4. **Login as SUPERADMIN** → View comprehensive reports

### Scenario 2: Security Demo
1. **Show permission denied** when INWARD_CLERK tries to access approval
2. **Show data isolation** - each role sees appropriate data
3. **Show workflow enforcement** - status transitions follow rules

### Scenario 3: Admin Capabilities
1. **Login as SUPERADMIN** → Show full system access
2. **Demonstrate override capabilities** → Change any status
3. **Show comprehensive reporting** → All data visibility

## ✅ RBAC Implementation Status

- ✅ **Core RBAC System**: Complete
- ✅ **Permission Definitions**: Complete
- ✅ **Role Mappings**: Complete
- ✅ **UI Protection**: Implemented in InwardForm
- ✅ **Route Protection**: Complete
- ✅ **Status Workflow**: Complete
- ✅ **Data Access Control**: Complete
- ✅ **Documentation**: Complete

**Ready for CPO Demo!** 🚀

The RBAC system provides enterprise-grade security and user experience that will impress stakeholders and ensure proper access control in production. 