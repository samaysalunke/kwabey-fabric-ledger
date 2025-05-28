# Role-Based Access Control (RBAC) Test Plan

## Overview
This document outlines the test plan for verifying Role-Based Access Control (RBAC) in the Kwabey Fabric Management System.

## User Roles and Credentials

### 1. Inward Clerk
- **Email**: `inward@kwabey.com`
- **Role**: `INWARD_CLERK`
- **Access**: Fabric Inward Module + Reports

### 2. Quality Checker
- **Email**: `quality@kwabey.com`
- **Role**: `QUALITY_CHECKER`
- **Access**: Quality Approval Module + Reports

### 3. Quantity Approver
- **Email**: `quantity@kwabey.com`
- **Role**: `APPROVER`
- **Access**: Quantity Approval Module + Reports

### 4. Super Admin
- **Email**: `admin@kwabey.com`
- **Role**: `SUPERADMIN`
- **Access**: All Modules (Inward + Quality + Approval + Reports)

## Test Scenarios

### Test Case 1: Inward Clerk Access
**Login**: `inward@kwabey.com`

**Expected Behavior**:
- ✅ Can access Dashboard
- ✅ Can access Fabric Inward module
- ✅ Can access Reports module
- ❌ Cannot access Quality Approval module
- ❌ Cannot access Quantity Approval module

**Navigation Menu Should Show**:
- Fabric Inward
- Reports

**Navigation Menu Should NOT Show**:
- Quality Approval
- Quantity Approval

### Test Case 2: Quality Checker Access
**Login**: `quality@kwabey.com`

**Expected Behavior**:
- ✅ Can access Dashboard
- ✅ Can access Quality Approval module
- ✅ Can access Reports module
- ❌ Cannot access Fabric Inward module
- ❌ Cannot access Quantity Approval module

**Navigation Menu Should Show**:
- Quality Approval
- Reports

**Navigation Menu Should NOT Show**:
- Fabric Inward
- Quantity Approval

### Test Case 3: Quantity Approver Access
**Login**: `quantity@kwabey.com`

**Expected Behavior**:
- ✅ Can access Dashboard
- ✅ Can access Quantity Approval module
- ✅ Can access Reports module
- ❌ Cannot access Fabric Inward module
- ❌ Cannot access Quality Approval module

**Navigation Menu Should Show**:
- Quantity Approval
- Reports

**Navigation Menu Should NOT Show**:
- Fabric Inward
- Quality Approval

### Test Case 4: Super Admin Access
**Login**: `admin@kwabey.com`

**Expected Behavior**:
- ✅ Can access Dashboard
- ✅ Can access Fabric Inward module
- ✅ Can access Quality Approval module
- ✅ Can access Quantity Approval module
- ✅ Can access Reports module

**Navigation Menu Should Show**:
- Fabric Inward
- Quality Approval
- Quantity Approval
- Reports

## Direct URL Access Tests

### Test Case 5: Unauthorized Direct URL Access
For each role, test direct URL access to restricted modules:

**Inward Clerk** (`inward@kwabey.com`):
- Navigate to `/quality` → Should show "Access Denied"
- Navigate to `/approval` → Should show "Access Denied"

**Quality Checker** (`quality@kwabey.com`):
- Navigate to `/inward` → Should show "Access Denied"
- Navigate to `/approval` → Should show "Access Denied"

**Quantity Approver** (`quantity@kwabey.com`):
- Navigate to `/inward` → Should show "Access Denied"
- Navigate to `/quality` → Should show "Access Denied"

## Authentication Tests

### Test Case 6: Unauthenticated Access
- Navigate to any protected route without logging in
- Should redirect to `/login`

### Test Case 7: Invalid Credentials
- Try logging in with non-existent email
- Should show authentication error

### Test Case 8: Role Detection
- Verify that the correct role is displayed in the header/user info
- Verify that role-based permissions are applied immediately after login

## Functional Access Tests

### Test Case 9: Module-Specific Functionality
For each role, verify they can perform actions within their authorized modules:

**Inward Clerk**:
- Can create new fabric entries
- Can add rolls to fabric entries
- Can view reports

**Quality Checker**:
- Can view fabric entries pending quality check
- Can add quality parameters
- Can approve/reject quality
- Can view reports

**Quantity Approver**:
- Can view fabric entries ready for approval
- Can approve/hold individual rolls
- Can add debit notes for held rolls
- Can view reports

**Super Admin**:
- Can perform all above actions across all modules

## Browser Testing Instructions

### Setup
1. Start the development server: `npm start`
2. Open browser to `http://localhost:3000`
3. Connect Browser MCP extension

### Test Execution Steps

1. **Test Inward Clerk**:
   ```
   1. Navigate to http://localhost:3000/login
   2. Login with: inward@kwabey.com
   3. Verify navigation menu shows only "Fabric Inward" and "Reports"
   4. Try accessing /quality directly → Should show "Access Denied"
   5. Try accessing /approval directly → Should show "Access Denied"
   6. Verify can access /inward and /reports successfully
   ```

2. **Test Quality Checker**:
   ```
   1. Logout and login with: quality@kwabey.com
   2. Verify navigation menu shows only "Quality Approval" and "Reports"
   3. Try accessing /inward directly → Should show "Access Denied"
   4. Try accessing /approval directly → Should show "Access Denied"
   5. Verify can access /quality and /reports successfully
   ```

3. **Test Quantity Approver**:
   ```
   1. Logout and login with: quantity@kwabey.com
   2. Verify navigation menu shows only "Quantity Approval" and "Reports"
   3. Try accessing /inward directly → Should show "Access Denied"
   4. Try accessing /quality directly → Should show "Access Denied"
   5. Verify can access /approval and /reports successfully
   ```

4. **Test Super Admin**:
   ```
   1. Logout and login with: admin@kwabey.com
   2. Verify navigation menu shows all modules
   3. Verify can access all routes: /inward, /quality, /approval, /reports
   4. Test functionality in each module
   ```

## Expected Results Summary

| Role | Inward | Quality | Approval | Reports | Dashboard |
|------|--------|---------|----------|---------|-----------|
| Inward Clerk | ✅ | ❌ | ❌ | ✅ | ✅ |
| Quality Checker | ❌ | ✅ | ❌ | ✅ | ✅ |
| Quantity Approver | ❌ | ❌ | ✅ | ✅ | ✅ |
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

## Security Considerations

1. **Client-Side Protection**: Navigation and UI elements are hidden based on roles
2. **Route Protection**: Direct URL access is blocked by ProtectedRoute component
3. **Role Detection**: Roles are determined by email address mapping
4. **Session Management**: Authentication state is managed by Supabase Auth

## Notes for Testing

- Password for all test accounts should be set in Supabase Auth
- Ensure all test emails are registered in Supabase Auth
- Test both navigation menu visibility and direct URL access
- Verify that unauthorized access shows proper "Access Denied" message
- Test logout functionality and session persistence 