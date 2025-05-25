# Manual Testing Guide - Complete Verification

## 🎯 Testing Objective
Verify that all implemented features work correctly before implementing Quality Parameters module.

## ✅ Verification Results Summary

### Database & Connection Status
- ✅ **Supabase Connection**: Working
- ✅ **All Tables**: Created and accessible
- ✅ **Storage Bucket**: Configured
- ✅ **Role Configuration**: Set up correctly
- ⚠️ **RLS Policies**: Working (data insertion requires authentication)

### Application Status
- ✅ **Development Server**: Running on http://localhost:3000
- ✅ **Build System**: No TypeScript errors
- ✅ **Environment**: Properly configured

## 🧪 Step-by-Step Testing

### Test 1: Application Access
1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Expected**: Login page should appear
3. **Check**: 
   - [ ] Login form displays correctly
   - [ ] No console errors
   - [ ] Page loads without issues

### Test 2: Authentication Testing
Test each user role:

#### 2.1 Inward Clerk Login
```
Email: inward@kwabey.com
Password: [your password]
```
- [ ] Login successful
- [ ] Redirected to dashboard
- [ ] Only "Fabric Inward" tab visible
- [ ] Header shows correct email

#### 2.2 Quality Checker Login
```
Email: quality@kwabey.com
Password: [your password]
```
- [ ] Login successful
- [ ] "Quality Parameters" tab visible (but disabled)
- [ ] Cannot access other role's features

#### 2.3 Approver Login
```
Email: quantity@kwabey.com
Password: [your password]
```
- [ ] Login successful
- [ ] "Quantity Approval" tab visible (but disabled)
- [ ] Role-based access working

#### 2.4 Superadmin Login
```
Email: admin@kwabey.com
Password: [your password]
```
- [ ] Login successful
- [ ] All tabs visible
- [ ] Full access to all features

### Test 3: Fabric Inward Form (Complete Test)

**Login as**: Inward Clerk (inward@kwabey.com)

#### 3.1 Form Display
- [ ] All required fields marked with *
- [ ] Dropdowns populate correctly
- [ ] Date Inwarded shows today's date
- [ ] Inwarded By shows user email

#### 3.2 Form Validation
Test empty form submission:
- [ ] Click "Save Entry" without filling fields
- [ ] Validation errors appear
- [ ] Form doesn't submit

#### 3.3 Complete Form Submission
Fill out the form with this test data:

```
Seller Name: Premium Fabrics Ltd
Quantity: 150 KG
Color: Navy Blue
Fabric Type: KNITTED
PO Number: PO-2024-TEST-001
Fabric Composition: 80% Cotton, 20% Polyester
UAT: 145 KG
```

**Roll Details:**
- Roll 1: 50 KG
- Roll 2: 45 KG  
- Roll 3: 55 KG

**Add Rib Details:**
- Total Weight: 8.5
- Total Rolls: 3

**File Upload:**
- Upload a test PDF file

#### 3.4 Submission Test
- [ ] Click "Save Entry"
- [ ] Success notification appears
- [ ] Form resets after submission
- [ ] No errors in browser console

### Test 4: Database Verification

After successful form submission, check Supabase Dashboard:

#### 4.1 Fabric Entries Table
- [ ] New record in `fabric_entries` table
- [ ] All form data saved correctly
- [ ] Status set to "PENDING_QUALITY"
- [ ] Timestamps populated

#### 4.2 Fabric Rolls Table
- [ ] 3 records in `fabric_rolls` table
- [ ] Batch numbers: 1, 2, 3
- [ ] Roll values: 50, 45, 55
- [ ] Correct fabric_entry_id reference

#### 4.3 Rib Details Table
- [ ] 1 record in `rib_details` table
- [ ] Total weight: 8.5
- [ ] Total rolls: 3

#### 4.4 File Storage
- [ ] File uploaded to `ftp-documents` bucket
- [ ] File accessible in Supabase Storage

### Test 5: Advanced Features

#### 5.1 Dynamic Roll Management
- [ ] Add multiple rolls (test up to 5)
- [ ] Remove rolls (ensure minimum 1 remains)
- [ ] Batch numbers increment correctly
- [ ] Validation works for each roll

#### 5.2 File Upload Features
- [ ] Drag and drop works
- [ ] File type validation (try non-PDF)
- [ ] File size validation (try large file)
- [ ] File removal works

#### 5.3 Form Reset
- [ ] Reset button clears all fields
- [ ] Rib details section closes
- [ ] File upload resets
- [ ] Roll count resets to 1

### Test 6: Error Handling

#### 6.1 Network Errors
- [ ] Temporarily disconnect internet
- [ ] Try form submission
- [ ] Error notification appears
- [ ] Form remains filled

#### 6.2 Validation Errors
- [ ] Negative numbers in quantity fields
- [ ] Empty required fields
- [ ] Invalid file types
- [ ] Appropriate error messages

### Test 7: User Experience

#### 7.1 Responsive Design
Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

#### 7.2 Performance
- [ ] Form loads quickly
- [ ] Submissions are responsive
- [ ] No lag in user interactions

## 🎯 Success Criteria

### ✅ Ready for Quality Parameters if:
- [ ] All authentication tests pass
- [ ] Fabric Inward form works completely
- [ ] Data saves to database correctly
- [ ] File uploads work
- [ ] No critical console errors
- [ ] Role-based access functions properly

### ❌ Issues to Fix Before Proceeding:
- [ ] Login failures
- [ ] Form submission errors
- [ ] Database connection issues
- [ ] File upload problems
- [ ] Console errors

## 📊 Test Results Summary

**Date**: ___________
**Tester**: ___________

| Test Category | Status | Notes |
|---------------|--------|-------|
| Application Access | ⭕ Pass / ❌ Fail | |
| Authentication | ⭕ Pass / ❌ Fail | |
| Fabric Inward Form | ⭕ Pass / ❌ Fail | |
| Database Integration | ⭕ Pass / ❌ Fail | |
| File Upload | ⭕ Pass / ❌ Fail | |
| Error Handling | ⭕ Pass / ❌ Fail | |
| Responsive Design | ⭕ Pass / ❌ Fail | |

**Overall Status**: ⭕ Ready for Quality Parameters / ❌ Needs fixes

## 🚀 Next Steps

Once all tests pass:
1. ✅ Mark verification complete
2. 🔄 Proceed with Quality Parameters module implementation
3. 📝 Document any issues found for future reference

## 🆘 Troubleshooting

### Common Issues:
1. **Login fails**: Check user exists in Supabase Auth
2. **Form won't submit**: Check browser console for errors
3. **File upload fails**: Verify storage bucket policies
4. **Data not saving**: Check RLS policies and authentication

### Quick Fixes:
- Refresh browser and try again
- Check network connection
- Verify environment variables
- Restart development server 