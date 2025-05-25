import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  ClipboardCheck, 
  BarChart3 
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItemProps {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const Navigation: React.FC = () => {
  const { hasRole } = useAuth();
  const location = useLocation();

  const navItems: NavItemProps[] = [
    {
      name: 'Fabric Inward',
      path: '/inward',
      icon: <FileText className="h-4 w-4" />,
      roles: ['INWARD_CLERK', 'SUPERADMIN'],
    },
    {
      name: 'Quality Approval',
      path: '/quality',
      icon: <CheckCircle className="h-4 w-4" />,
      roles: ['QUALITY_CHECKER', 'SUPERADMIN'],
    },
    {
      name: 'Quantity Approval',
      path: '/approval',
      icon: <ClipboardCheck className="h-4 w-4" />,
      roles: ['APPROVER', 'SUPERADMIN'],
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ['INWARD_CLERK', 'QUALITY_CHECKER', 'APPROVER', 'SUPERADMIN'],
    },
  ];

  const visibleNavItems = navItems.filter(item => hasRole(item.roles));

  return (
    <nav className="bg-background border-b border-border sticky top-16 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-14">
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 overflow-x-auto no-scrollbar">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "relative px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap",
                  "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive 
                    ? "text-primary bg-accent/30" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn(
                  "transition-colors duration-200",
                  location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    layoutId="navbar-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      duration: 0.3
                    }}
                  />
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Add CSS for hiding scrollbars
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .no-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;  /* Chrome, Safari and Opera */
    }
  `;
  document.head.appendChild(style);
}

export default Navigation; 