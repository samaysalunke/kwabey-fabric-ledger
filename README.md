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
# Supabase
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# User Roles (emails)
REACT_APP_INWARD_CLERK_EMAIL=clerk@company.com
REACT_APP_QUALITY_CHECKER_EMAIL=quality@company.com
REACT_APP_APPROVER_EMAIL=approver@company.com
REACT_APP_SUPERADMIN_EMAIL=admin@company.com

# User Passwords (for login)
REACT_APP_CLERK_PASSWORD=clerk123
REACT_APP_QUALITY_PASSWORD=quality123
REACT_APP_APPROVER_PASSWORD=approver123
REACT_APP_ADMIN_PASSWORD=admin123
```

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
See the PRD for detailed Supabase database schema and migration scripts.

## Current Status
✅ Project structure and foundation complete
✅ Authentication system with role-based access
✅ Layout and navigation components
✅ Placeholder pages for all modules
⏳ Module-specific components (Inward Form, Quality Management, etc.)

## Next Steps
1. Set up Supabase database with the provided schema
2. Implement the Fabric Inward Form with dynamic roll addition
3. Build Quality Parameters management
4. Create Quantity Approval workflow
5. Develop comprehensive Reports module