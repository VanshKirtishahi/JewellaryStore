import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Gem, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight,
  User,
  Home,
  Heart,
  Package,
  Clock,
  MessageSquare,
  HelpCircle,
  Shield,
  Award,
  Sparkles
} from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';

const UserLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Stats State
  const [userStats, setUserStats] = useState({
    orders: 0,
    spent: 0,
    requests: 0,
    pendingOrders: 0,
    loyaltyPoints: 0,
    memberLevel: 'Silver'
  });

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // --- 1. FETCH USER DATA ---
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!user) return;

        const [ordersRes, requestsRes] = await Promise.all([
          axios.get(`/orders/find/${user.id}`),
          axios.get(`/custom/user/${user.id}`)
        ]);
        
        const orders = ordersRes.data;
        const requests = requestsRes.data;

        // Calculate stats
        const totalSpent = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const loyaltyPoints = Math.floor(totalSpent / 1000);
        
        let memberLevel = 'Silver';
        if (loyaltyPoints > 100) memberLevel = 'Gold';
        if (loyaltyPoints > 500) memberLevel = 'Platinum';
        if (loyaltyPoints > 1000) memberLevel = 'Diamond';

        setUserStats({
          orders: orders.length,
          spent: totalSpent,
          requests: requests.length,
          pendingOrders: orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length,
          loyaltyPoints,
          memberLevel
        });

      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };

    fetchUserStats();
    const interval = setInterval(fetchUserStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [user]);

  // --- 2. RESPONSIVENESS & UTILS ---
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileDropdown(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // --- 3. NAVIGATION ITEMS ---
  const navItems = [
    { path: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-400' },
    { path: '/user/orders', icon: ShoppingBag, label: 'My Orders', color: 'from-emerald-500 to-green-400' },
    { path: '/user/requests', icon: Gem, label: 'Custom Requests', color: 'from-purple-500 to-pink-400' },
    { path: '/user/wishlist', icon: Heart, label: 'Wishlist', color: 'from-rose-500 to-pink-400' },
    { path: '/user/track-order', icon: Package, label: 'Track Order', color: 'from-amber-500 to-orange-400' },
    { path: '/user/settings', icon: Settings, label: 'Settings', color: 'from-gray-600 to-gray-400' },
  ];

  const quickLinks = [
    { path: '/', icon: Home, label: 'Home', external: true },
    { path: '/collections', icon: Gem, label: 'Shop Now', external: true },
    { path: '/custom-request', icon: MessageSquare, label: 'Custom Design', external: true },
    { path: '/contact', icon: HelpCircle, label: 'Help Center', external: true },
  ];

  const notifications = [
    { id: 1, title: 'Order Shipped', description: 'Your order #ORD12345 has been shipped', time: '2 hours ago', unread: true },
    { id: 2, title: 'New Arrivals', description: 'Check out our latest jewelry collection', time: '1 day ago', unread: false },
    { id: 3, title: 'Custom Request', description: 'Your design request is being reviewed', time: '2 days ago', unread: false },
  ];

  const pageTitles = {
    '/user/dashboard': 'Dashboard',
    '/user/orders': 'My Orders',
    '/user/requests': 'Custom Requests',
    '/user/wishlist': 'Wishlist',
    '/user/track-order': 'Track Order',
    '/user/settings': 'Settings',
  };

  const unreadNotifications = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex font-sans text-gray-900">
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col 
        bg-white border-r border-gray-200
        shadow-xl transition-all duration-500 ease-out
        ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-20'}
      `}>
        
        {/* Sidebar Header */}
        <div className={`p-6 flex items-center justify-center relative border-b border-gray-100 ${!isSidebarOpen && 'lg:px-4'}`}>
          <div className={`flex items-center gap-3 transition-all duration-500 ${!isSidebarOpen && 'lg:justify-center'}`}>
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0
              bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-400
              transform transition-all duration-300 hover:scale-105
            `}>
              <span className="text-white font-serif font-bold text-2xl">VJ</span>
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 ${!isSidebarOpen ? 'w-0 opacity-0' : 'w-44 opacity-100'}`}>
              <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">Venkateshwara</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Client</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Toggle Button */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className={`
                absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg
                bg-white border-2 border-gray-200 text-gray-500 hover:text-amber-600 hover:border-amber-300
                transform transition-all duration-300 hover:scale-110 active:scale-95 z-50
              `}
            >
              {isSidebarOpen ? <ChevronRight size={16} className="rotate-180" /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>
        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            <p className={`text-xs font-semibold uppercase tracking-wider text-gray-500 transition-all duration-500 ${!isSidebarOpen ? 'lg:hidden' : ''} px-2 mb-3`}>
              Navigation
            </p>
          </div>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${active 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-md` 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  active:scale-95
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
                  ${active 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                  }
                `}>
                  <Icon size={20} className={active ? 'text-white' : 'text-gray-600'} />
                </div>

                <div className={`
                  transition-all duration-500 flex-1 min-w-0
                  ${!isSidebarOpen ? 'lg:opacity-0 lg:w-0 lg:translate-x-4 overflow-hidden' : 'opacity-100 w-auto translate-x-0'}
                `}>
                  <span className="font-medium text-sm whitespace-nowrap block">
                    {item.label}
                  </span>
                </div>

                {/* Tooltip for Collapsed State */}
                {!isSidebarOpen && !isMobile && (
                  <div className="absolute left-full ml-3 z-50 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl whitespace-nowrap">
                    {item.label}
                    <div className="absolute -left-2 top-1/2 w-3 h-3 bg-gray-900 transform -translate-y-1/2 rotate-45"></div>
                  </div>
                )}

                {/* Active Indicator */}
                {active && (
                  <div className="absolute right-3 top-1/2 w-1.5 h-2/3 bg-white/80 rounded-l-full transform -translate-y-1/2"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className={`p-4 border-t border-gray-100 space-y-3`}>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-600 hover:bg-red-50 transition-all duration-300 group border border-red-100 hover:border-red-200"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut size={20} />
            </div>
            <span className={`${!isSidebarOpen ? 'lg:hidden' : 'block'} text-sm font-medium transition-all duration-500`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-300"
              >
                <Menu size={22} />
              </button>

              {/* Page Title */}
              <div className="animate-slideIn">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span>{pageTitles[location.pathname] || 'User Dashboard'}</span>
                    <div className="relative">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                  </h1>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 border border-blue-100">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-medium text-blue-700">Welcome back, {user?.name?.split(' ')[0]}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:block relative" ref={searchRef}>
                <div className={`
                  flex items-center px-4 py-2.5 rounded-xl border transition-all duration-300
                  ${showSearch ? 'w-64 border-amber-300 ring-2 ring-amber-100' : 'w-56 border-gray-200 hover:border-gray-300'}
                  bg-gray-50
                `}>
                  <Search size={18} className="text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm ml-3 placeholder-gray-400"
                    onFocus={() => setShowSearch(true)}
                    onBlur={() => setShowSearch(false)}
                  />
                </div>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button 
                  className="relative p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-300"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={22} />
                  {unreadNotifications > 0 && (
                    <>
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-100 rounded-full animate-ping"></span>
                    </>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 animate-slideDown overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                          {unreadNotifications} New
                        </span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${notification.unread ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            {notification.unread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button className="w-full py-2 text-center text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative" ref={profileRef}>
                <button 
                  className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{userStats.memberLevel} Member</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-0.5 shadow-md">
                      <div className="w-full h-full rounded-lg bg-white flex items-center justify-center text-amber-600 font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 transform rotate-90" />
                  </div>
                </button>
                
                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 animate-slideDown overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-0.5">
                          <div className="w-full h-full rounded-lg bg-white flex items-center justify-center text-amber-600 font-bold text-lg">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 text-xs font-medium rounded-full">
                              {userStats.memberLevel}
                            </span>
                            <span className="text-xs text-gray-500">{userStats.loyaltyPoints} pts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link 
                        to="/user/settings" 
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <User size={16} className="text-gray-500" />
                        Profile
                      </Link>
                      <Link 
                        to="/user/orders" 
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <ShoppingBag size={16} className="text-gray-500" />
                        My Orders
                      </Link>
                      <Link 
                        to="/user/requests" 
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <Gem size={16} className="text-gray-500" />
                        Custom Requests
                      </Link>
                      <button className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-gray-100 mt-2">
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth bg-gradient-to-b from-gray-50/50 to-transparent">
          <div key={location.pathname} className="animate-slideUp">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Venkateshwara Jewelers • User Portal v1.0
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 hover:text-amber-600 transition-colors">Help Center</button>
              <button className="text-sm text-gray-600 hover:text-amber-600 transition-colors">Contact Support</button>
              <button className="text-sm text-gray-600 hover:text-amber-600 transition-colors">Privacy Policy</button>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #d1d5db; 
          border-radius: 10px; 
          transition: all 0.3s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: #9ca3af; 
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease,
                      border-color 0.3s ease,
                      color 0.3s ease,
                      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        /* Responsive optimizations */
        @media (max-width: 768px) {
          .animate-slideUp { animation: slideIn 0.3s ease-out; }
        }
      `}</style>
    </div>
  );
};

export default UserLayout;