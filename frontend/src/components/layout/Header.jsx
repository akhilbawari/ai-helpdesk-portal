import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-beige-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-beige-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.7274 20.4471C19.2716 19.1713 18.2672 18.0439 16.8701 17.2399C15.4729 16.4358 13.7611 16 12 16C10.2389 16 8.52706 16.4358 7.12991 17.2399C5.73276 18.0439 4.72839 19.1713 4.27259 20.4471" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-xl font-display font-medium text-navy-800">AI Helpdesk</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/features" className="text-navy-700 hover:text-beige-600 font-medium">Features</Link>
          <Link to="/pricing" className="text-navy-700 hover:text-beige-600 font-medium">Pricing</Link>
          <Link to="/about" className="text-navy-700 hover:text-beige-600 font-medium">About</Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-navy-700 hover:text-beige-600 font-medium">
                Dashboard
              </Link>
              <Link to="/tickets" className="text-navy-700 hover:text-beige-600 font-medium">
                Tickets
              </Link>
              <div className="relative group">
                <button className="flex items-center space-x-2 text-navy-700 hover:text-beige-600 font-medium">
                  <span>{profile?.full_name || user.email}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-navy-700 hover:bg-beige-50">Your Profile</Link>
                  <Link to="/settings" className="block px-4 py-2 text-sm text-navy-700 hover:bg-beige-50">Settings</Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-navy-700 hover:bg-beige-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline text-sm px-5 py-2">Log In</Link>
              <Link to="/register" className="btn-primary text-sm px-5 py-2">Sign Up</Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-navy-800"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t border-beige-100 px-4 py-4 flex flex-col space-y-4">
          <Link to="/features" className="text-navy-700 hover:text-beige-600 font-medium py-2">Features</Link>
          <Link to="/pricing" className="text-navy-700 hover:text-beige-600 font-medium py-2">Pricing</Link>
          <Link to="/about" className="text-navy-700 hover:text-beige-600 font-medium py-2">About</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-navy-700 hover:text-beige-600 font-medium py-2">Dashboard</Link>
              <Link to="/tickets" className="text-navy-700 hover:text-beige-600 font-medium py-2">Tickets</Link>
              <Link to="/profile" className="text-navy-700 hover:text-beige-600 font-medium py-2">Your Profile</Link>
              <Link to="/settings" className="text-navy-700 hover:text-beige-600 font-medium py-2">Settings</Link>
              <button
                onClick={handleSignOut}
                className="text-left text-navy-700 hover:text-beige-600 font-medium py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline text-center">Log In</Link>
              <Link to="/register" className="btn-primary text-center">Sign Up</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
