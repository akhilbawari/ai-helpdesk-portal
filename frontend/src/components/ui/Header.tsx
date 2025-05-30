import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { LogOut, Menu, X } from 'lucide-react';

interface HeaderProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {toggleSidebar && (
            <button 
              onClick={toggleSidebar} 
              className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="font-heading font-bold text-primary text-xl">AI-First Helpdesk</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="hidden md:block">
                <div className="text-sm text-zinc-600">
                  {user.name}
                  <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                aria-label="Logout"
                className="text-zinc-500 hover:text-error"
              >
                <LogOut size={18} />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;