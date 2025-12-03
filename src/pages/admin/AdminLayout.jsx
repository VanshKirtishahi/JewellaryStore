import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  PenTool, 
  LogOut, 
  Crown, 
  Sparkles, 
  Settings, 
  User, 
  Bell, 
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
  BarChart3,
  Filter,
  Calendar,
  Download,
  Upload
} from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-500', badge: null },
    { path: '/admin/products', icon: Package, label: 'Products', color: 'from-purple-500 to-pink-500', badge: '12' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', color: 'from-green-500 to-emerald-500', badge: '5' },
    { path: '/admin/requests', icon: PenTool, label: 'Custom Requests', color: 'from-amber-500 to-orange-500', badge: '8' },
    { path: '/admin/customers', icon: Users, label: 'Customers', color: 'from-indigo-500 to-blue-500', badge: null },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'from-red-500 to-pink-500', badge: null },
  ];

  const quickActions = [
    { icon: TrendingUp, label: 'Sales Report', color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
    { icon: CreditCard, label: 'Process Payments', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { icon: Filter, label: 'Filter Orders', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { icon: Calendar, label: 'Schedule', color: 'bg-gradient-to-r from-orange-500 to-red-500' },
  ];

  const notifications = [
    { id: 1, title: 'New Order Received', description: 'Order #JV-2045 for Diamond Ring', time: '2 min ago', unread: true },
    { id: 2, title: 'Custom Request', description: 'Emerald necklace design requested', time: '1 hour ago', unread: true },
    { id: 3, title: 'Low Stock Alert', description: 'Gold chains running low', time: '3 hours ago', unread: false },
    { id: 4, title: 'Payment Received', description: '$2,450 received for Order #JV-2040', time: '5 hours ago', unread: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const pageTitles = {
    '/admin': 'Dashboard Overview',
    '/admin/products': 'Product Management',
    '/admin/orders': 'Order Management',
    '/admin/requests': 'Custom Requests',
    '/admin/customers': 'Customer Management',
    '/admin/analytics': 'Store Analytics',
  };

  const unreadNotifications = notifications.filter(n => n.unread).length;

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30'}`}>
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-40 h-full flex flex-col transform transition-all duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-24'}
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border-r shadow-2xl lg:shadow-xl
      `}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} relative`}>
          <div className={`flex items-center gap-3 transition-all duration-500 ${!isSidebarOpen && 'justify-center'}`}>
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl
              bg-gradient-to-br from-jewel-gold via-amber-500 to-yellow-400
              transform transition-transform duration-300 hover:scale-110 hover:rotate-6
            `}>
              <Crown className="text-white" size={24} />
            </div>
            <div className={`transition-all duration-500 overflow-hidden ${!isSidebarOpen ? 'opacity-0 max-w-0' : 'opacity-100 max-w-xs'}`}>
              <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-white">JewelCraft Pro</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 tracking-wider">LUXURY ADMIN PANEL</p>
            </div>
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={`
              absolute -right-4 top-8 w-8 h-8 rounded-full flex items-center justify-center shadow-xl
              bg-gradient-to-br from-jewel-gold to-amber-500 text-white
              transform transition-transform duration-300 hover:scale-125 hover:rotate-180
              ${!isSidebarOpen ? 'lg:rotate-180' : ''}
            `}
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group relative overflow-hidden
                  ${active 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-xl transform scale-102` 
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'} hover:scale-102`
                  }
                `}
                onMouseEnter={() => setActiveHover(item.path)}
                onMouseLeave={() => setActiveHover(null)}
              >
                {/* Animated Background */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                )}
                
                {/* Icon */}
                <div className={`
                  w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 relative z-10
                  ${active 
                    ? 'bg-white/20 text-white' 
                    : `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'} group-hover:bg-gradient-to-r group-hover:text-white`
                  }
                  ${activeHover === item.path && !active && item.color.replace('from-', 'bg-gradient-to-r ')}
                  group-hover:scale-110
                `}>
                  <Icon size={20} />
                </div>
                
                {/* Label */}
                <span className={`
                  font-medium transition-all duration-500 flex-1
                  ${!isSidebarOpen ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
                  ${active ? 'font-semibold' : ''}
                `}>
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge && isSidebarOpen && (
                  <span className={`
                    px-2 py-1 text-xs font-bold rounded-full transition-all duration-300
                    ${active ? 'bg-white/30 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                  `}>
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator */}
                {active && !isSidebarOpen && (
                  <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-ping"></div>
                )}

                {/* Tooltip for collapsed sidebar */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 shadow-2xl">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 bg-jewel-gold text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        {isSidebarOpen && (
          <div className={`mx-4 mb-4 p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Store Stats</span>
              <span className="text-xs text-jewel-gold font-bold">Live</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Today's Sales</span>
                <span className="text-sm font-bold text-green-600">$4,280</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Pending Orders</span>
                <span className="text-sm font-bold text-amber-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">New Requests</span>
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} space-y-2`}>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-300 group"
          >
            <div className={`
              w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500
              ${darkMode ? 'bg-amber-100 text-amber-600' : 'bg-gray-800 text-gray-300'}
              group-hover:scale-110
            `}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            <span className={`transition-all duration-500 ${!isSidebarOpen ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-300 group"
          >
            <div className={`
              w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500
              bg-gradient-to-r from-red-500 to-pink-500 text-white
              group-hover:scale-110
            `}>
              <LogOut size={18} />
            </div>
            <span className={`transition-all duration-500 ${!isSidebarOpen ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`
        flex-1 transition-all duration-500 ease-in-out overflow-hidden
        ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-24'}
      `}>
        {/* Top Header */}
        <header className={`
          sticky top-0 z-30 transition-colors duration-500
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl border-gray-200'}
          border-b shadow-sm
        `}>
          <div className="flex items-center justify-between p-4 lg:p-6">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <div className="space-y-1.5">
                  <div className={`w-5 h-0.5 rounded-full ${darkMode ? 'bg-gray-300' : 'bg-gray-600'} transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                  <div className={`w-5 h-0.5 rounded-full ${darkMode ? 'bg-gray-300' : 'bg-gray-600'} transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}></div>
                  <div className={`w-5 h-0.5 rounded-full ${darkMode ? 'bg-gray-300' : 'bg-gray-600'} transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </div>
              </button>

              {/* Page Title */}
              <div>
                <h1 className="text-xl lg:text-2xl font-serif font-bold flex items-center gap-2">
                  {pageTitles[location.pathname] || 'Admin Panel'}
                  <Sparkles className="text-jewel-gold animate-pulse" size={20} />
                </h1>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Welcome back, {user?.name || 'Admin'}! Here's what's happening today.
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 lg:gap-6">
              {/* Search Bar */}
              <div ref={searchRef} className="relative">
                {showSearch ? (
                  <form 
                    onSubmit={handleSearch}
                    className="absolute right-0 top-1/2 -translate-y-1/2 animate-slideIn"
                  >
                    <div className={`flex items-center rounded-xl overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                      <Search className={`ml-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products, orders..."
                        className={`px-3 py-2 w-64 outline-none ${darkMode ? 'bg-gray-700 text-white' : ''}`}
                        autoFocus
                      />
                      <button type="submit" className="px-3 py-2 bg-jewel-gold text-white">
                        Go
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setShowSearch(true)}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Search size={20} />
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="hidden lg:flex items-center gap-2">
                {quickActions.slice(0, 2).map((action, index) => (
                  <button
                    key={index}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${action.color} text-white shadow-lg`}
                    title={action.label}
                  >
                    <action.icon size={18} />
                  </button>
                ))}
              </div>

              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 relative ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className={`
                    absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden animate-slideDown
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  `}>
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <h3 className="font-semibold flex items-center justify-between">
                        <span>Notifications</span>
                        <span className="text-xs text-jewel-gold">{unreadNotifications} new</span>
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 transition-colors duration-200 border-b ${darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-100'} last:border-b-0 ${notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                          <p className="font-medium">{notification.title}</p>
                          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{notification.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button className={`w-full py-3 text-center text-sm font-medium transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                      View all notifications
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-jewel-gold to-amber-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="font-medium">{user?.name || 'Admin User'}</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Store Manager</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className={`px-6 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Store Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-500" />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Sales: +12% today</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  <Download size={14} /> Export
                </button>
                <button className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  <Upload size={14} /> Import
                </button>
                <button className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  <HelpCircle size={14} /> Help
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          <div className={`
            rounded-2xl min-h-[calc(100vh-180px)] p-4 lg:p-6 transition-all duration-500
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
            border shadow-sm hover:shadow-lg
          `}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Jewelry Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute text-xl animate-float
              ${darkMode ? 'opacity-10' : 'opacity-5'}
            `}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 15 + 10}s`,
              transform: `scale(${0.5 + Math.random() * 1.5})`
            }}
          >
            {['💎', '✨', '🌟', '🔶', '💍', '📿', '🔔', '🏆'][i]}
          </div>
        ))}
      </div>

      {/* Add CSS animations */}
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;