import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from "../components/ui/card";
import { 
  Clipboard, 
  ClipboardCheck, 
  FileCheck, 
  BarChart3, 
  ArrowRight 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, role, hasRole } = useAuth();

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case 'INWARD_CLERK':
        return 'Inward Clerk';
      case 'QUALITY_CHECKER':
        return 'Quality Checker';
      case 'APPROVER':
        return 'Approver';
      case 'SUPERADMIN':
        return 'Super Admin';
      default:
        return 'User';
    }
  };

  // Map icons to actions
  const getActionIcon = (title: string) => {
    switch (title) {
      case 'Fabric Inward':
        return <Clipboard className="h-6 w-6 text-white" />;
      case 'Quality Approval':
        return <ClipboardCheck className="h-6 w-6 text-white" />;
      case 'Quantity Approval':
        return <FileCheck className="h-6 w-6 text-white" />;
      case 'Reports':
        return <BarChart3 className="h-6 w-6 text-white" />;
      default:
        return <Clipboard className="h-6 w-6 text-white" />;
    }
  };

  const quickActions = [
    {
      title: 'Fabric Inward',
      description: 'Add new fabric entries to the system',
      path: '/inward',
      roles: ['INWARD_CLERK', 'SUPERADMIN'],
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'group-hover:from-blue-600 group-hover:to-blue-700',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      title: 'Quality Approval',
      description: 'Add quality parameters to fabric entries',
      path: '/quality',
      roles: ['QUALITY_CHECKER', 'SUPERADMIN'],
      color: 'from-green-500 to-green-600',
      hoverColor: 'group-hover:from-green-600 group-hover:to-green-700',
      bgLight: 'bg-green-100',
      textColor: 'text-green-700',
    },
    {
      title: 'Quantity Approval',
      description: 'Approve or hold fabric quantities',
      path: '/approval',
      roles: ['APPROVER', 'SUPERADMIN'],
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'group-hover:from-amber-600 group-hover:to-amber-700',
      bgLight: 'bg-amber-100',
      textColor: 'text-amber-700',
    },
    {
      title: 'Reports',
      description: 'View comprehensive fabric reports',
      path: '/reports',
      roles: ['INWARD_CLERK', 'QUALITY_CHECKER', 'APPROVER', 'SUPERADMIN'],
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'group-hover:from-purple-600 group-hover:to-purple-700',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-700',
    },
  ];

  const availableActions = quickActions.filter(action => hasRole(action.roles));

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <Card className="border-none shadow-md bg-gradient-to-r from-background to-background/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Fabric Ledger Management
              </h1>
              <p className="text-muted-foreground">
                Logged in as <span className="font-medium text-foreground">{getRoleDisplayName(role)}</span> • <span className="text-muted-foreground/80">{user?.email}</span>
              </p>
            </div>
            <div className="hidden md:block">
              <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group block"
            >
              <Card className="h-full border transition-all duration-300 hover:shadow-lg hover:border-border/50 group-hover:translate-y-[-2px]">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} ${action.hoverColor} flex items-center justify-center mb-5 transition-all duration-300 shadow-sm group-hover:shadow-md`}>
                    {getActionIcon(action.title)}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
                  <p className="text-muted-foreground mb-4 flex-grow">{action.description}</p>
                  <div className="flex items-center mt-auto">
                    <span className={`text-sm font-medium ${action.textColor}`}>Access now</span>
                    <ArrowRight className={`ml-2 h-4 w-4 ${action.textColor} transition-transform group-hover:translate-x-1`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 