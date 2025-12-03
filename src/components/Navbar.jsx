import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Crown, 
  Sparkles, 
  Search, 
  Menu, 
  X, 
  Gem, 
  Star,
  Heart,
  Bell,
  Home
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navbarRef = useRef(null);
  const searchRef = useRef(null);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartPulsing, setIsCartPulsing] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(3);
  const [isHomePage, setIsHomePage] = useState(false);

  // Check if we're on home page
  useEffect(() => {
    setIsHomePage(location.pathname === '/');
  }, [location.pathname]);

  // Enhanced scroll effect with smooth transition
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show solid navbar when scrolled down more than 50px OR if on home page
      if (currentScrollY > 50 || isHomePage) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Enhanced cart animation with different effects
  useEffect(() => {
    if (cartItems.length > 0) {
      setIsCartPulsing(true);
      const timer = setTimeout(() => setIsCartPulsing(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [cartItems.length]);

  // Close search bar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchBar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchBar(false);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={16} /> },
    { path: '/collections', label: 'Collections', icon: <Gem size={16} /> },
    { path: '/custom-request', label: 'Custom Design', icon: <Star size={16} /> },
    { path: '/about', label: 'About', icon: <Heart size={16} /> },
  ];

  const notifications = [
    { id: 1, text: 'Your custom ring is ready!', time: '2 hours ago' },
    { id: 2, text: 'Special offer: 20% off diamonds', time: '1 day ago' },
    { id: 3, text: 'New collection launched', time: '3 days ago' },
  ];

  // Always show dark navbar on home page, transparent on others when not scrolled
  const shouldShowDarkNav = isHomePage || isScrolled;

  return (
    <nav 
      ref={navbarRef}
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
        ${shouldShowDarkNav 
          ? 'bg-white shadow-lg py-2 border-b border-gray-100' 
          : 'bg-white/95 backdrop-blur-md shadow-sm py-3'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo with enhanced animation */}
          <Link to="/" className="flex items-center gap-3 group relative">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500
              ${shouldShowDarkNav 
                ? 'bg-gradient-to-br from-jewel-gold via-amber-500 to-yellow-400 text-white shadow-lg' 
                : 'bg-gradient-to-br from-jewel-gold to-amber-500 text-white shadow-lg'
              }
              group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl
              relative overflow-hidden
            `}>
              <Crown size={24} className="relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
            <div className="transition-all duration-500">
              <h1 className={`
                text-2xl font-serif font-bold tracking-tight
                ${shouldShowDarkNav ? 'text-gray-900' : 'text-gray-900'}
                group-hover:text-jewel-gold transition-colors duration-300
              `}>
                Venkateshwara
              </h1>
              <p className={`
                text-xs uppercase tracking-[0.3em] -mt-1
                ${shouldShowDarkNav ? 'text-gray-600' : 'text-gray-500'}
                transition-colors duration-300
              `}>
                Fine Jewelry
              </p>
            </div>
          </Link>

          {/* Desktop Navigation with enhanced effects */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300
                  ${isActive(link.path) 
                    ? 'text-jewel-gold bg-gradient-to-r from-jewel-gold/10 to-transparent' 
                    : 'text-gray-700 hover:text-jewel-gold hover:bg-gray-50'
                  }
                  relative group
                `}
              >
                <span className={`transition-transform duration-300 ${isActive(link.path) ? 'scale-110' : ''}`}>
                  {link.icon}
                </span>
                <span className="font-medium">{link.label}</span>
                
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-jewel-gold to-transparent rounded-full" />
                )}
                
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-jewel-gold/0 via-jewel-gold/5 to-jewel-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            ))}
            
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="ml-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-full text-sm font-medium hover:from-jewel-gold hover:to-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Sparkles size={14} /> Admin
              </Link>
            )}
          </div>

          {/* Right Icons with enhanced interactions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Enhanced Search Bar */}
            <div ref={searchRef} className="relative">
              {showSearchBar ? (
                <form 
                  onSubmit={handleSearch}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-xl border border-gray-200 overflow-hidden animate-slideIn"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search diamonds, rings..."
                    className="w-64 sm:w-80 px-4 py-2 text-gray-700 outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-jewel-gold hover:text-amber-600"
                  >
                    <Search size={20} />
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => setShowSearchBar(true)}
                  className={`
                    p-2 rounded-full transition-all duration-300 hover:scale-110
                    text-gray-600 hover:text-jewel-gold hover:bg-gray-100
                  `}
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Notifications */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`
                    p-2 rounded-full transition-all duration-300 hover:scale-110 relative
                    text-gray-600 hover:text-jewel-gold hover:bg-gray-100
                  `}
                >
                  <Bell size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                        >
                          <p className="text-gray-800">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Cart Icon */}
            <Link to="/cart" className="relative group">
              <div className={`
                p-2 rounded-full transition-all duration-500
                hover:bg-gray-100
                ${isCartPulsing ? 'animate-bounce' : ''}
              `}>
                <ShoppingCart 
                  size={22} 
                  className={`
                    transition-all duration-300
                    text-gray-600 group-hover:text-jewel-gold
                    group-hover:scale-110
                  `} 
                />
              </div>
              {cartItems.length > 0 && (
                <>
                  <span className={`
                    absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                    bg-red-500 text-white border-2 border-white
                    animate-pulse-subtle
                  `}>
                    {cartItems.length}
                  </span>
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </>
              )}
            </Link>

            {/* User Profile with enhanced dropdown */}
            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-gray-300">
                <div className="relative group">
                  <Link 
                    to="/dashboard" 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 hover:scale-110 shadow-lg relative overflow-hidden bg-gradient-to-br from-jewel-gold to-amber-500 text-white"
                  >
                    {user.name.charAt(0).toUpperCase()}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Link>
                </div>
                <button 
                  onClick={handleLogout}
                  className={`
                    p-2 rounded-full transition-all duration-300 hover:scale-110
                    text-gray-400 hover:text-red-500 hover:bg-red-50
                  `}
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105
                  text-gray-700 hover:text-jewel-gold border border-gray-300 hover:border-jewel-gold
                `}
              >
                <User size={18} />
                <span className="font-medium hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className={`
                lg:hidden p-2 rounded-full transition-all duration-300 hover:scale-110
                text-gray-700 hover:text-jewel-gold hover:bg-gray-100
              `}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`
          lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100
          animate-slideDown
        `}>
          <div className="p-6">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`
                    flex items-center gap-3 py-4 px-4 rounded-xl transition-all duration-300
                    ${isActive(link.path) 
                      ? 'text-jewel-gold bg-jewel-gold/10' 
                      : 'text-gray-700 hover:text-jewel-gold hover:bg-gray-50'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={isActive(link.path) ? 'scale-110' : ''}>
                    {link.icon}
                  </span>
                  <span className="font-medium text-lg">{link.label}</span>
                </Link>
              ))}
              
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-3 py-4 px-4 rounded-xl bg-gradient-to-r from-jewel-gold to-amber-500 text-white font-medium text-lg mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Sparkles size={18} /> Admin Dashboard
                </Link>
              )}
            </div>
            
            {user && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-jewel-gold to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 1s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;