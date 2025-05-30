import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/ui/Header';
import { Home, Ticket, FileText, Settings, Users, BarChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isActive, onClick }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary text-white' 
          : 'text-zinc-600 hover:bg-zinc-100'
      }`}
      onClick={onClick}
    >
      <span className="text-current">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`bg-white border-r border-border w-64 shrink-0 fixed inset-y-0 mt-[57px] pt-4 transition-all duration-300 lg:static ${
            isSidebarOpen ? 'left-0' : '-left-64 lg:left-0'
          }`}
        >
          <div className="px-4 mb-6">
            <p className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">
              MAIN MENU
            </p>
          </div>
          
          <nav className="px-2 space-y-1">
            <SidebarItem
              to="/dashboard"
              icon={<Home size={18} />}
              label="Dashboard"
              isActive={location.pathname === '/dashboard'}
              onClick={closeSidebarOnMobile}
            />
            
            <SidebarItem
              to="/tickets"
              icon={<Ticket size={18} />}
              label="Tickets"
              isActive={location.pathname.startsWith('/tickets')}
              onClick={closeSidebarOnMobile}
            />
            
            <SidebarItem
              to="/knowledge"
              icon={<FileText size={18} />}
              label="Knowledge Base"
              isActive={location.pathname.startsWith('/knowledge')}
              onClick={closeSidebarOnMobile}
            />
            
            {/* Show these items only for support agents, team leads, and admins */}
            {user?.role !== 'employee' && (
              <>
                <div className="px-4 pt-5 pb-2">
                  <p className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">
                    SUPPORT
                  </p>
                </div>
                
                <SidebarItem
                  to="/reports"
                  icon={<BarChart size={18} />}
                  label="Reports"
                  isActive={location.pathname.startsWith('/reports')}
                  onClick={closeSidebarOnMobile}
                />
              </>
            )}
            
            {/* Admin only items */}
            {user?.role === 'admin' && (
              <>
                <div className="px-4 pt-5 pb-2">
                  <p className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">
                    ADMIN
                  </p>
                </div>
                
                <SidebarItem
                  to="/users"
                  icon={<Users size={18} />}
                  label="User Management"
                  isActive={location.pathname.startsWith('/users')}
                  onClick={closeSidebarOnMobile}
                />
                
                <SidebarItem
                  to="/settings"
                  icon={<Settings size={18} />}
                  label="Settings"
                  isActive={location.pathname.startsWith('/settings')}
                  onClick={closeSidebarOnMobile}
                />
              </>
            )}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[5] lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardLayout;