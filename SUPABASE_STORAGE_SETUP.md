# Supabase Storage Setup Guide

## Overview
This guide explains how to set up Supabase Storage for handling debit note file uploads and downloads in the Kwabey Fabric Management System.

## Prerequisites
- Supabase project with admin access
- Database already configured with fabric management tables

## Step 1: Using Existing Storage Bucket

**Good News**: If you already have an `ftp-documents` bucket with existing debit notes, you can use it directly! The system has been configured to use your existing `ftp-documents` bucket.

### If you need to create the bucket:

1. **Login to Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Login to your account
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click on "Create a new bucket"

3. **Create FTP Documents Bucket**
   - Bucket name: `ftp-documents`
   - Make it public: `No` (keep private for security)
   - Click "Create bucket"

## Step 2: Set Up Storage Policies

1. **Navigate to Storage Policies**
   - In Storage section, click on "Policies"
   - Click on the `ftp-documents` bucket

2. **Create Upload Policy**
   ```sql
   CREATE POLICY "Allow authenticated users to upload debit notes" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'ftp-documents' AND (storage.foldername(name))[1] = 'debit_notes');
   ```

3. **Create Download Policy**
   ```sql
   CREATE POLICY "Allow authenticated users to download debit notes" ON storage.objects
   FOR SELECT TO authenticated
   USING (bucket_id = 'ftp-documents' AND (storage.foldername(name))[1] = 'debit_notes');
   ```

4. **Create Update Policy (Optional)**
   ```sql
   CREATE POLICY "Allow authenticated users to update debit notes" ON storage.objects
   FOR UPDATE TO authenticated
   USING (bucket_id = 'ftp-documents' AND (storage.foldername(name))[1] = 'debit_notes');
   ```

## Step 3: Configure File Structure

The system will automatically create the following folder structure:
```
ftp-documents/
└── debit_notes/
    └── rolls/
        ├── {rollId}_{timestamp}_{filename}.pdf
        ├── {rollId}_{timestamp}_{filename}.jpg
        └── ...
```

## Step 4: Test Configuration

1. **Test Upload**
   - Go to the Quantity Approval module
   - Put a roll on hold with a debit note
   - Verify the file appears in Storage > ftp-documents > debit_notes > rolls

2. **Test Download**
   - Go to Reports module
   - Click "View Debit Note" on a roll with uploaded debit note
   - Verify the file downloads or opens correctly

## Troubleshooting

### Common Issues

1. **"Storage bucket not configured" Error**
   - Ensure the `ftp-documents` bucket exists
   - Check bucket name spelling (case-sensitive)

2. **"Permission denied" Error**
   - Verify storage policies are created correctly
   - Ensure user is authenticated
   - Check RLS (Row Level Security) settings

3. **"File not found" Error**
   - Check if file exists in storage
   - Verify file path in database matches storage
   - Check if file was deleted manually

### Verification Commands

Run these in the Supabase SQL Editor to verify setup:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'ftp-documents';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'ftp-documents';

-- List files in debit_notes folder
SELECT * FROM storage.objects 
WHERE bucket_id = 'ftp-documents' 
AND name LIKE 'debit_notes/%';
```

## Security Considerations

1. **Private Bucket**: Keep the ftp-documents bucket private to prevent unauthorized access
2. **Authentication**: Only authenticated users can upload/download files
3. **Path Restrictions**: Policies restrict access to debit_notes folder only
4. **File Types**: Consider adding file type restrictions in policies if needed

## File Size Limits

- Default Supabase limit: 50MB per file
- Recommended for debit notes: 10MB max
- Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX

## Backup and Maintenance

1. **Regular Backups**: Set up automated backups for the storage bucket
2. **Cleanup**: Implement periodic cleanup of old files if needed
3. **Monitoring**: Monitor storage usage and costs

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify Supabase project settings
3. Contact your system administrator
4. Refer to [Supabase Storage Documentation](https://supabase.com/docs/guides/storage) 