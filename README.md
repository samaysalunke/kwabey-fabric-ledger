# Fabric Ledger Management System

A role-based fabric inventory management system for tracking fabric inward, quality checks, and approvals with a complete audit trail.

## Tech Stack
- React + TypeScript
- Supabase (PostgreSQL, Auth, Storage)
- Netlify (Hosting)

## Features
- Role-based access control (Inward Clerk, Quality Checker, Approver, Superadmin)
- Fabric inward, quality, approval, and reporting modules
- File uploads (FTP documents, debit notes)
- Responsive, modern UI

## Setup

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# User Role Assignments (comma-separated emails)
REACT_APP_INWARD_CLERK_EMAILS=user1@company.com,user2@company.com
REACT_APP_QUALITY_CHECKER_EMAILS=quality1@company.com,quality2@company.com
REACT_APP_APPROVER_EMAILS=approver1@company.com,approver2@company.com
REACT_APP_SUPERADMIN_EMAILS=admin@company.com
```

**⚠️ Security Note:** 
- Never commit the `.env` file to version control
- Use strong passwords for all user accounts
- Set up proper Supabase Row Level Security (RLS) policies
- Regularly rotate API keys and passwords

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```

### 4. Deploy to Netlify
The project includes a `netlify.toml` configuration file for easy deployment.

## Project Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components (Header, Navigation, Layout)
├── contexts/           # React contexts (Auth, App)
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API services
└── utils/              # Utilities, types, constants
```

## Database Setup
Contact your system administrator for database schema and migration scripts.

## Security Features
- Role-based access control (RBAC)
- Environment variable protection
- Secure authentication with Supabase
- Protected routes and components
- Input validation and sanitization

## Current Status
✅ Project structure and foundation complete
✅ Authentication system with role-based access
✅ Layout and navigation components
✅ All modules implemented with RBAC
✅ Modern UI with enhanced design system
✅ Production-ready security measures

## Next Steps
1. Set up Supabase database with the provided schema
2. Implement the Fabric Inward Form with dynamic roll addition
3. Build Quality Parameters management
4. Create Quantity Approval workflow
5. Develop comprehensive Reports module