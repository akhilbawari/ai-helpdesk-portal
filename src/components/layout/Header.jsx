import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../notifications/NotificationCenter';
import { FiMenu, FiX, FiChevronDown, FiUser, FiSettings, FiLogOut, FiHome, FiHelpCircle, FiDatabase, FiFileText } from 'react-icons/fi';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-full opacity-20 blur-sm"></div>
            <svg className={`w-10 h-10 ${isScrolled ? 'text-indigo-600' : 'text-white'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.7274 20.4471C19.2716 19.1713 18.2672 18.0439 16.8701 17.2399C15.4729 16.4358 13.7611 16 12 16C10.2389 16 8.52706 16.4358 7.12991 17.2399C5.73276 18.0439 4.72839 19.1713 4.27259 20.4471" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span className={`text-xl font-display font-bold ${isScrolled ? 'text-navy-800' : 'text-white'}`}>AI Helpdesk</span>
            <div className={`text-xs font-medium ${isScrolled ? 'text-indigo-500' : 'text-indigo-100'}`}>Enterprise Portal</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* Features, Pricing, and About links are hidden as requested */}
          
          {user ? (
            <div className="flex items-center space-x-5">
              <Link to="/dashboard" className={`flex items-center space-x-1 ${isScrolled ? 'text-navy-700 hover:text-indigo-600' : 'text-white hover:text-indigo-100'} font-medium transition-colors`}>
                <FiHome className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/tickets" className={`flex items-center space-x-1 ${isScrolled ? 'text-navy-700 hover:text-indigo-600' : 'text-white hover:text-indigo-100'} font-medium transition-colors`}>
                <FiFileText className="w-4 h-4" />
                <span>Tickets</span>
              </Link>
              <Link to="/knowledge" className={`flex items-center space-x-1 ${isScrolled ? 'text-navy-700 hover:text-indigo-600' : 'text-white hover:text-indigo-100'} font-medium transition-colors`}>
                <FiDatabase className="w-4 h-4" />
                <span>Knowledge Base</span>
              </Link>
              <div className="relative">
                <NotificationCenter />
              </div>
              
              <div className="relative">
                <button 
                  onClick={toggleProfileMenu}
                  className={`flex items-center space-x-2 ${isScrolled ? 'text-navy-700 hover:text-indigo-600' : 'text-white hover:text-indigo-100'} font-medium transition-colors rounded-full p-1 hover:bg-opacity-20 hover:bg-white`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{profile?.full_name || user.email}</span>
                  <FiChevronDown className="w-4 h-4" />
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 transition-all duration-200 transform origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      <FiUser className="w-4 h-4 mr-3" />
                      Your Profile
                    </Link>
                    <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      <FiSettings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className={`px-5 py-2 rounded-lg border ${isScrolled ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50' : 'border-white text-white hover:bg-white hover:bg-opacity-10'} transition-colors`}>
                Log In
              </Link>
              <Link to="/register" className={`px-5 py-2 rounded-lg ${isScrolled ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50'} transition-colors shadow-sm`}>
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className={`md:hidden ${isScrolled ? 'text-navy-800' : 'text-white'} p-1 rounded-md hover:bg-opacity-20 hover:bg-white`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-100 absolute w-full left-0 right-0 z-20 transition-all duration-300 transform">
          <nav className="container mx-auto px-4 py-3 flex flex-col divide-y divide-gray-100">
            {/* Features, Pricing, and About links are hidden as requested */}
            
            {user ? (
              <div className="py-2 space-y-3">
                <div className="px-2 py-3 bg-gray-50 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                
                <Link to="/dashboard" className="flex items-center space-x-3 px-2 py-2 text-navy-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">
                  <FiHome className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link to="/tickets" className="flex items-center space-x-3 px-2 py-2 text-navy-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">
                  <FiFileText className="w-5 h-5" />
                  <span className="font-medium">Tickets</span>
                </Link>
                <Link to="/knowledge" className="flex items-center space-x-3 px-2 py-2 text-navy-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">
                  <FiDatabase className="w-5 h-5" />
                  <span className="font-medium">Knowledge Base</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-3 px-2 py-2 text-navy-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">
                  <FiUser className="w-5 h-5" />
                  <span className="font-medium">Your Profile</span>
                </Link>
                <Link to="/settings" className="flex items-center space-x-3 px-2 py-2 text-navy-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">
                  <FiSettings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-2 py-2 text-red-600 hover:bg-red-50 rounded-md w-full"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="py-4 flex flex-col space-y-3">
                <Link to="/login" className="btn-outline text-center py-3 rounded-lg">
                  Log In
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white text-center py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
