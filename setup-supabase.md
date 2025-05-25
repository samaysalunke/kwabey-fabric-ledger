# Supabase Setup Guide for Fabric Ledger Management System

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `kwabey-fab-check`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your location)
5. Click "Create new project"

## Step 2: Get Project Credentials

Once your project is created:

1. Go to Settings → API
2. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string starting with eyJ)

## Step 3: Update Environment Variables

Update your `.env` file with the actual values:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Role-based Access Control
# Define user emails for each role (comma-separated)
REACT_APP_INWARD_CLERK_EMAILS=clerk1@company.com,clerk2@company.com
REACT_APP_QUALITY_CHECKER_EMAILS=quality1@company.com,quality2@company.com
REACT_APP_APPROVER_EMAILS=approver1@company.com,approver2@company.com
REACT_APP_SUPERADMIN_EMAILS=admin@company.com

# Environment
NODE_ENV=development
```

## Step 4: Database Schema Setup

Go to your Supabase project → SQL Editor and run the following SQL commands:

### 1. Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create fabric_entries table
CREATE TABLE fabric_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_name VARCHAR(255) NOT NULL,
    quantity_value DECIMAL(10,2) NOT NULL,
    quantity_unit VARCHAR(20) NOT NULL CHECK (quantity_unit IN ('KG', 'METER')),
    color VARCHAR(100) NOT NULL,
    fabric_type VARCHAR(50) NOT NULL CHECK (fabric_type IN ('KNITTED', 'WOVEN')),
    po_number VARCHAR(100) NOT NULL,
    fabric_composition TEXT NOT NULL,
    date_inwarded DATE NOT NULL DEFAULT CURRENT_DATE,
    inwarded_by VARCHAR(255) NOT NULL,
    uat_value DECIMAL(10,2) NOT NULL,
    uat_unit VARCHAR(20) NOT NULL CHECK (uat_unit IN ('KG', 'METER')),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_QUALITY' CHECK (status IN ('PENDING_QUALITY', 'QUALITY_CHECKED', 'APPROVED', 'ON_HOLD')),
    ftp_document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fabric_rolls table
CREATE TABLE fabric_rolls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fabric_entry_id UUID NOT NULL REFERENCES fabric_entries(id) ON DELETE CASCADE,
    batch_number INTEGER NOT NULL,
    roll_value DECIMAL(10,2) NOT NULL,
    roll_unit VARCHAR(20) NOT NULL CHECK (roll_unit IN ('KG', 'METER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fabric_entry_id, batch_number)
);

-- Create rib_details table
CREATE TABLE rib_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fabric_entry_id UUID NOT NULL REFERENCES fabric_entries(id) ON DELETE CASCADE,
    total_weight DECIMAL(10,2),
    total_rolls INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quality_parameters table
CREATE TABLE quality_parameters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fabric_entry_id UUID NOT NULL REFERENCES fabric_entries(id) ON DELETE CASCADE,
    gsm_value DECIMAL(8,2) NOT NULL,
    width_dia_inches DECIMAL(8,2) NOT NULL,
    shrinkage_percent DECIMAL(5,2) NOT NULL CHECK (shrinkage_percent >= 0 AND shrinkage_percent <= 100),
    color_fastness VARCHAR(20) NOT NULL CHECK (color_fastness IN ('OKAY', 'NOT_OKAY')),
    checked_by VARCHAR(255) NOT NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quantity_approvals table
CREATE TABLE quantity_approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fabric_entry_id UUID NOT NULL REFERENCES fabric_entries(id) ON DELETE CASCADE,
    approval_status VARCHAR(20) NOT NULL CHECK (approval_status IN ('APPROVED', 'ON_HOLD')),
    approved_quantity DECIMAL(10,2),
    hold_reason VARCHAR(50) CHECK (hold_reason IN ('QUANTITY_INSUFFICIENT', 'MATERIAL_DEFECTIVE')),
    not_approved_quantity DECIMAL(10,2),
    approved_by VARCHAR(255) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Create Indexes for Performance

```sql
-- Create indexes for better query performance
CREATE INDEX idx_fabric_entries_status ON fabric_entries(status);
CREATE INDEX idx_fabric_entries_date_inwarded ON fabric_entries(date_inwarded);
CREATE INDEX idx_fabric_entries_inwarded_by ON fabric_entries(inwarded_by);
CREATE INDEX idx_fabric_rolls_fabric_entry_id ON fabric_rolls(fabric_entry_id);
CREATE INDEX idx_quality_parameters_fabric_entry_id ON quality_parameters(fabric_entry_id);
CREATE INDEX idx_quantity_approvals_fabric_entry_id ON quantity_approvals(fabric_entry_id);
```

### 3. Create Updated At Trigger

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for fabric_entries
CREATE TRIGGER update_fabric_entries_updated_at 
    BEFORE UPDATE ON fabric_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE fabric_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE rib_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantity_approvals ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read fabric_entries" ON fabric_entries
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert fabric_entries" ON fabric_entries
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update fabric_entries" ON fabric_entries
    FOR UPDATE TO authenticated USING (true);

-- Similar policies for other tables
CREATE POLICY "Allow authenticated users full access to fabric_rolls" ON fabric_rolls
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to rib_details" ON rib_details
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to quality_parameters" ON quality_parameters
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to quantity_approvals" ON quantity_approvals
    FOR ALL TO authenticated USING (true);
```

### 5. Create Storage Bucket for File Uploads

```sql
-- Create storage bucket for FTP documents
INSERT INTO storage.buckets (id, name, public) VALUES ('ftp-documents', 'ftp-documents', false);

-- Create policy for authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ftp-documents');

CREATE POLICY "Allow authenticated users to view files" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'ftp-documents');
```

## Step 5: Configure Authentication

1. Go to Authentication → Settings
2. Configure your authentication providers (Email/Password is enabled by default)
3. Set up email templates if needed
4. Configure redirect URLs for your domain

## Step 6: Test the Setup

1. Update your `.env` file with the actual credentials
2. Restart your development server: `npm start`
3. Try logging in with a test user
4. Test creating a fabric entry

## Step 7: Add Test Users

Go to Authentication → Users and manually add test users for each role:

- **Inward Clerk**: clerk1@company.com
- **Quality Checker**: quality1@company.com  
- **Approver**: approver1@company.com
- **Superadmin**: admin@company.com

Make sure these emails match what you configure in your `.env` file.

## Troubleshooting

1. **Connection Issues**: Verify your URL and API key are correct
2. **Authentication Issues**: Check if users exist and emails match role configuration
3. **Database Issues**: Verify all tables were created successfully
4. **File Upload Issues**: Ensure storage bucket and policies are set up correctly

## Next Steps

After completing this setup:

1. Test the Fabric Inward form
2. Implement Quality Parameters module
3. Implement Quantity Approval module
4. Set up Reports module
5. Deploy to Netlify with environment variables 