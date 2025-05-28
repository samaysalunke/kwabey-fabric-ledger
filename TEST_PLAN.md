# Comprehensive Test Plan - Fabric Management System

## Test Environment Setup
- **URL**: http://localhost:3000
- **Browser**: Chrome/Firefox with Browser MCP extension
- **Database**: Supabase (ensure clean test data)

## Test Scenarios Overview

### 1. Authentication & Navigation Tests
### 2. Inward Module Tests  
### 3. Quality Module Tests
### 4. Approval Module Tests
### 5. Reports Module Tests
### 6. End-to-End Workflow Tests

---

## Test Case 1: Authentication & Navigation
**Objective**: Verify login and navigation between modules

### Steps:
1. Navigate to http://localhost:3000
2. Verify login page appears
3. Login with test credentials
4. Verify dashboard/home page loads
5. Test navigation to each module:
   - Inward Module
   - Quality Module  
   - Approval Module
   - Reports Module
6. Verify user can logout

**Expected Results**:
- Successful authentication
- All navigation links work
- User role permissions respected

---

## Test Case 2: Inward Module - Create Fabric Entry
**Objective**: Test complete fabric entry creation with rolls

### Steps:
1. Navigate to Inward Module
2. Click "Add New Entry" or similar button
3. Fill fabric entry form:
   - Seller Name: "Test Seller ABC"
   - PO Number: "PO-2024-001"
   - Quantity: 100 KG
   - Fabric Type: KNITTED
   - Color: "Navy Blue"
   - Date: Current date
4. Add individual rolls:
   - Roll 1: 25 KG
   - Roll 2: 30 KG  
   - Roll 3: 45 KG
5. Submit the form
6. Verify success message
7. Verify entry appears in inward list with "PENDING_QUALITY" status

**Expected Results**:
- Form validation works correctly
- Rolls total matches fabric entry quantity
- Entry created successfully
- Status shows as "PENDING_QUALITY"

---

## Test Case 3: Quality Module - Quality Check
**Objective**: Test quality parameter entry and approval

### Steps:
1. Navigate to Quality Module
2. Verify the fabric entry from Test Case 2 appears in pending list
3. Select the fabric entry
4. Fill quality parameters:
   - GSM: 180
   - Width/DIA: 60 inches
   - Shrinkage: 3%
   - Color Fastness: OKAY
   - Checked by: "Quality Inspector 1"
5. Submit quality check
6. Verify success message
7. Verify entry status changes to "QUALITY_CHECKED"
8. Verify entry disappears from quality pending list

**Expected Results**:
- Quality form validation works
- Parameters saved correctly
- Status updated to "QUALITY_CHECKED"
- Entry moves to next workflow stage

---

## Test Case 4: Approval Module - Individual Roll Approval
**Objective**: Test roll-by-roll approval process

### Steps:
1. Navigate to Approval Module
2. Verify the fabric entry appears in approval pending list
3. Select the fabric entry
4. Verify all 3 rolls are displayed with correct quantities
5. **Test Roll 1 - Approve**:
   - Click "Approve" on Roll 1 (25 KG)
   - Add remarks: "Good quality, approved"
   - Confirm approval
   - Verify roll shows "Approved" status
6. **Test Roll 2 - Hold with Partial Quantity**:
   - Click "Hold" on Roll 2 (30 KG)
   - Select hold reason: "QUANTITY_INSUFFICIENT"
   - Set not approved quantity: 5 KG
   - Add remarks: "5 KG damaged, rest approved"
   - Confirm hold
   - Verify roll shows "On Hold" status
7. **Test Roll 3 - Hold with Debit Note**:
   - Click "Hold" on Roll 3 (45 KG)
   - Select hold reason: "MATERIAL_DEFECTIVE"
   - Add remarks: "Material quality issues"
   - Confirm hold
   - Upload debit note (create a test PDF file)
   - Verify debit note upload success
   - Verify "View" button appears for debit note

**Expected Results**:
- Individual roll approvals work correctly
- Partial quantity handling works
- Debit note upload and viewing works
- Roll statuses update properly

---

## Test Case 5: Fabric Entry Completion
**Objective**: Test automatic completion when all rolls are processed

### Steps:
1. Continue from Test Case 4 (all rolls should be processed)
2. Verify completion message appears: "All Rolls Processed!"
3. Wait for auto-redirect (2 seconds)
4. Verify fabric entry disappears from approval pending list
5. Check fabric entry status in system

**Expected Results**:
- Completion message displays correctly
- Auto-redirect works
- Entry removed from approval queue
- Final status is "ON_HOLD" (since some rolls were held)

---

## Test Case 6: Reports Module - View Completed Entry
**Objective**: Verify completed entries appear in reports with correct status

### Steps:
1. Navigate to Reports Module
2. Verify the completed fabric entry appears in the list
3. Check entry status shows "ON_HOLD"
4. Test filtering by status:
   - Filter by "On Hold"
   - Verify entry appears
   - Filter by "Ready to Issue"  
   - Verify entry doesn't appear
5. Test search functionality:
   - Search by seller name "Test Seller ABC"
   - Verify entry appears
6. Test export functionality:
   - Click "Export CSV"
   - Verify file downloads

**Expected Results**:
- Completed entry visible in reports
- Correct status displayed
- Filtering works correctly
- Search functionality works
- Export generates CSV file

---

## Test Case 7: End-to-End Workflow - All Approved
**Objective**: Test complete workflow with all rolls approved

### Steps:
1. **Create Second Fabric Entry**:
   - Seller: "Test Seller XYZ"
   - PO: "PO-2024-002"
   - Quantity: 50 METER
   - Type: WOVEN
   - Color: "Red"
   - Rolls: 2 rolls (25m each)

2. **Quality Check**:
   - Complete quality parameters
   - Submit and verify status change

3. **Approve All Rolls**:
   - Approve Roll 1 with remarks
   - Approve Roll 2 with remarks
   - Verify completion message
   - Verify auto-redirect

4. **Verify in Reports**:
   - Check entry shows "READY_TO_ISSUE" status
   - Verify filtering works

**Expected Results**:
- Complete workflow works smoothly
- All approved entries get "READY_TO_ISSUE" status
- System handles different fabric types and units

---

## Test Case 8: Edge Cases & Error Handling
**Objective**: Test system robustness and error handling

### Steps:
1. **Form Validation Tests**:
   - Try submitting empty forms
   - Enter invalid quantities
   - Test roll quantities that don't match total
   
2. **Navigation Tests**:
   - Test browser back/forward buttons
   - Test page refresh during form filling
   
3. **Data Consistency Tests**:
   - Verify roll approvals persist after page refresh
   - Test concurrent user scenarios (if possible)

4. **File Upload Tests**:
   - Upload invalid file types for debit notes
   - Upload oversized files
   - Test file viewing functionality

**Expected Results**:
- Proper validation messages
- No data loss on navigation
- Graceful error handling
- File upload restrictions work

---

## Test Case 9: User Role & Permission Tests
**Objective**: Verify role-based access control

### Steps:
1. **Test Different User Roles** (if implemented):
   - Login as Inward Clerk
   - Verify access to only Inward Module
   - Login as Quality Checker
   - Verify access to Quality Module
   - Login as Approver
   - Verify access to Approval Module

2. **Test Unauthorized Access**:
   - Try accessing modules without proper role
   - Verify proper error messages or redirects

**Expected Results**:
- Role-based access works correctly
- Unauthorized access prevented
- Proper error handling

---

## Test Case 10: Performance & UI/UX Tests
**Objective**: Verify system performance and user experience

### Steps:
1. **Load Testing**:
   - Create multiple fabric entries
   - Test system responsiveness
   - Verify pagination (if implemented)

2. **UI/UX Testing**:
   - Test responsive design on different screen sizes
   - Verify loading states and animations
   - Test keyboard navigation
   - Verify accessibility features

3. **Data Integrity**:
   - Verify all data persists correctly
   - Test data relationships (entries → rolls → approvals)
   - Verify calculated fields are accurate

**Expected Results**:
- System performs well under load
- UI is responsive and user-friendly
- Data integrity maintained
- Good user experience

---

## Test Execution Checklist

### Pre-Test Setup:
- [ ] Development server running (npm start)
- [ ] Browser MCP extension connected
- [ ] Clean test database
- [ ] Test files prepared (PDF for debit notes)

### Test Execution:
- [ ] Test Case 1: Authentication & Navigation
- [ ] Test Case 2: Inward Module - Create Entry
- [ ] Test Case 3: Quality Module - Quality Check  
- [ ] Test Case 4: Approval Module - Roll Approval
- [ ] Test Case 5: Fabric Entry Completion
- [ ] Test Case 6: Reports Module - View Results
- [ ] Test Case 7: End-to-End All Approved
- [ ] Test Case 8: Edge Cases & Error Handling
- [ ] Test Case 9: User Role & Permission Tests
- [ ] Test Case 10: Performance & UI/UX Tests

### Post-Test:
- [ ] Document any bugs found
- [ ] Verify all test data cleaned up
- [ ] Performance metrics recorded
- [ ] User experience feedback noted

---

## Success Criteria

The system passes testing if:
1. ✅ All core workflows complete successfully
2. ✅ Data integrity maintained throughout
3. ✅ Proper status transitions occur
4. ✅ User interface is intuitive and responsive
5. ✅ Error handling works gracefully
6. ✅ Role-based access control functions
7. ✅ Reports accurately reflect system state
8. ✅ File upload/download works correctly
9. ✅ Auto-completion workflow functions
10. ✅ No critical bugs or data loss

## Test Data Requirements

### Sample Fabric Entries:
1. **Entry 1**: Knitted, Navy Blue, 100 KG, 3 rolls
2. **Entry 2**: Woven, Red, 50 METER, 2 rolls  
3. **Entry 3**: Knitted, Green, 75 KG, 4 rolls

### Sample Files:
- Test debit note PDF (< 5MB)
- Invalid file types for testing
- Oversized files for testing

### User Accounts:
- Admin/Superuser account
- Role-specific accounts (if implemented)
- Test user credentials 