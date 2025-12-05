import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  PenTool, 
  LogOut, 
  Sparkles, 
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  CreditCard,
  Filter,
  Calendar,
  Download,
  Upload,
  Bell,
  HelpCircle,
  BarChart3,
  Menu,
  Zap,
  Activity,
  DollarSign,
  Target,
  Shield,
  Settings,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Clock,
  PieChart
} from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time Data State
  const [sidebarStats, setSidebarStats] = useState({
    todaysSales: 0,
    pendingOrders: 0,
    newRequests: 0,
    productsCount: 0
  });

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // --- 1. FETCH REAL-TIME DATA ---
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [ordersRes, requestsRes, productsRes] = await Promise.all([
          axios.get('/orders'),
          axios.get('/custom'),
          axios.get('/products')
        ]);

        const orders = ordersRes.data;
        const requests = requestsRes.data;
        const products = productsRes.data;

        // Calculate Today's Sales
        const today = new Date();
        const todaysOrders = orders.filter(o => {
          const d = new Date(o.createdAt);
          return d.getDate() === today.getDate() &&
                 d.getMonth() === today.getMonth() &&
                 d.getFullYear() === today.getFullYear();
        });
        const todaysSales = todaysOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Calculate Counts
        const pending = orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length;
        const newReqs = requests.filter(r => r.status === 'Submitted').length;

        setSidebarStats({
          todaysSales,
          pendingOrders: pending,
          newRequests: newReqs,
          productsCount: products.length
        });

      } catch (err) {
        console.error("Error updating sidebar stats:", err);
      }
    };

    fetchSidebarData();
    
    const interval = setInterval(fetchSidebarData, 30000);
    return () => clearInterval(interval);
  }, []);

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
    if (path === '/admin' && location.pathname === '/admin') return true;
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // --- 3. DYNAMIC NAVIGATION ITEMS ---
  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-400', badge: null },
    { path: '/admin/products', icon: Package, label: 'Products', color: 'from-purple-500 to-pink-400', badge: sidebarStats.productsCount },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', color: 'from-emerald-500 to-green-400', badge: sidebarStats.pendingOrders > 0 ? sidebarStats.pendingOrders : null },
    { path: '/admin/requests', icon: PenTool, label: 'Custom Requests', color: 'from-amber-500 to-orange-400', badge: sidebarStats.newRequests > 0 ? sidebarStats.newRequests : null },
    { path: '/admin/customers', icon: Users, label: 'Customers', color: 'from-indigo-500 to-blue-400', badge: null },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'from-rose-500 to-pink-400', badge: null },
  ];

  const quickActions = [
    { icon: TrendingUp, label: 'Sales Report', color: 'bg-emerald-500 hover:bg-emerald-600', action: () => {} },
    { icon: Download, label: 'Export Data', color: 'bg-blue-500 hover:bg-blue-600', action: () => {} },
    { icon: Upload, label: 'Import Data', color: 'bg-purple-500 hover:bg-purple-600', action: () => {} },
    { icon: Calendar, label: 'Schedule', color: 'bg-amber-500 hover:bg-amber-600', action: () => {} },
  ];

  const notifications = [
    { id: 1, title: 'System Update', description: 'Dashboard updated successfully', time: '5 min ago', icon: CheckCircle, unread: false, type: 'success' },
    { id: 2, title: 'Pending Orders', description: `You have ${sidebarStats.pendingOrders} pending orders`, time: '10 min ago', icon: AlertCircle, unread: true, type: 'warning' },
    { id: 3, title: 'New Custom Requests', description: `${sidebarStats.newRequests} new requests waiting`, time: '15 min ago', icon: Clock, unread: true, type: 'info' },
  ];

  const pageTitles = {
    '/admin': 'Dashboard Overview',
    '/admin/products': 'Product Management',
    '/admin/orders': 'Order Management',
    '/admin/requests': 'Custom Requests',
    '/admin/customers': 'Customer Management',
    '/admin/analytics': 'Advanced Analytics',
  };

  const unreadNotifications = notifications.filter(n => n.unread).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Clean White Design */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col 
        bg-white border-r border-gray-200
        shadow-xl transition-all duration-500 ease-out
        ${isSidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0 lg:w-20'}
      `}>
        
        {/* Sidebar Header */}
        <div className={`p-6 flex items-center justify-center relative border-b border-gray-100 ${!isSidebarOpen && 'lg:px-4'}`}>
          <div className={`flex items-center gap-4 transition-all duration-500 ${!isSidebarOpen && 'lg:justify-center'}`}>
            {/* Logo Image Container */}
            <div className="flex items-center justify-center">
              {isSidebarOpen ? (
                // When sidebar is open - Show logo with text
                <div className="w-auto flex items-center justify-center">
                  {/* Option 1: Logo with text */}
                  <img 
                    src="src/assets/VK_LogoWithText.svg" 
                    alt="Venkateshwara Jewelers Logo"
                    className="h-12 object-contain"
                    onError={(e) => {
                      console.log('Logo with text not found, trying logo without text');
                      e.target.style.display = 'none';
                      // You could add fallback logic here
                    }}
                  />
                </div>
              ) : (
                // When sidebar is collapsed - Show small logo only
                <div className="w-12 h-12 flex items-center justify-center">
                  {/* Option 2: Logo without text */}
                  <img 
                    src="src/assets/VK_Only.svg" 
                    alt="VJ Logo"
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      console.log('Small logo not found');
                      e.target.style.display = 'none';
                      // Fallback to initial letter
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-400 text-white font-bold text-lg';
                      fallbackDiv.textContent = 'VJ';
                      e.target.parentNode.appendChild(fallbackDiv);
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Brand Text - Only shown when sidebar is open */}
            {isSidebarOpen && (
              <div className="overflow-hidden transition-all duration-500 opacity-100">
                <h2 className="text-sm font-bold text-gray-900 whitespace-nowrap">Venkateshwara Jewelers</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <p className="text-xs font-medium text-emerald-700 tracking-wider">ADMIN PANEL</p>
                  </div>
                </div>
              </div>
            )}
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
              {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-5 space-y-3 py-6 overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            <p className={`text-xs font-semibold uppercase tracking-wider text-gray-500 transition-all duration-500 ${!isSidebarOpen ? 'lg:hidden' : ''} px-4 mb-3`}>
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
                  relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group
                  ${active 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-md` 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
                  }
                  active:scale-95
                `}
                onMouseEnter={() => setActiveHover(item.path)}
                onMouseLeave={() => setActiveHover(null)}
              >
                {/* Icon Container */}
                <div className={`
                  relative z-10 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
                  ${active 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                  }
                `}>
                  <Icon size={22} className={active ? 'text-white' : 'text-gray-600'} />
                </div>

                {/* Label */}
                <div className={`
                  transition-all duration-500 flex-1 min-w-0
                  ${!isSidebarOpen ? 'lg:opacity-0 lg:w-0 lg:translate-x-6 overflow-hidden' : 'opacity-100 w-auto translate-x-0'}
                `}>
                  <span className="font-semibold text-sm whitespace-nowrap block">
                    {item.label}
                  </span>
                </div>

                {/* Badge */}
                {item.badge && isSidebarOpen && (
                  <span className={`
                    ml-auto px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-300
                    ${active 
                      ? 'bg-white/30 text-white' 
                      : 'bg-red-100 text-red-700'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}

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
        <div className={`p-5 border-t border-gray-100 space-y-3`}>
          {/* Logout Button */}
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

          {/* User Info */}
          {isSidebarOpen && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-0.5 shadow-md">
                    <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-amber-600 font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Shield size={12} className="text-amber-600" />
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-7 py-4">
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
                    <span>{pageTitles[location.pathname] || 'Dashboard'}</span>
                    <div className="relative">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                  </h1>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 border border-blue-100">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-medium text-blue-700">Real-time updates</p>
                  </div>
                  <p className="text-xs text-gray-500">Last updated: Just now</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-5">
              {/* Search Bar */}
              <div className="hidden lg:block relative" ref={searchRef}>
                <div className={`
                  flex items-center px-4 py-2.5 rounded-xl border transition-all duration-300
                  ${showSearch ? 'w-80 border-amber-300 ring-2 ring-amber-100' : 'w-64 border-gray-200 hover:border-gray-300'}
                  bg-gray-50
                `}>
                  <Search size={18} className="text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search orders, products, customers..."
                    className="flex-1 bg-transparent border-none outline-none text-sm ml-3 placeholder-gray-400"
                    onFocus={() => setShowSearch(true)}
                    onBlur={() => setShowSearch(false)}
                  />
                  {showSearch && (
                    <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded border border-gray-200 ml-2">
                      ⌘K
                    </kbd>
                  )}
                </div>
              </div>

              {/* Quick Actions (Desktop) */}
              <div className="hidden lg:flex items-center gap-2">
                {quickActions.slice(0, 2).map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`${action.color} text-white p-2.5 rounded-lg hover:shadow-md transition-all duration-300 active:scale-95`}
                    title={action.label}
                  >
                    <action.icon size={18} />
                  </button>
                ))}
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
                      {notifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                          <div 
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${notification.unread ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${notification.unread ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                <Icon size={18} className={notification.unread ? 'text-blue-600' : 'text-gray-500'} />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                  {notification.unread && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                                <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                    <p className="text-xs text-gray-500 mt-0.5">Administrator</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-0.5 shadow-md">
                      <div className="w-full h-full rounded-lg bg-white flex items-center justify-center text-amber-600 font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
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
                          <p className="text-xs text-gray-500 mt-0.5">Super Admin</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                        <Settings size={16} className="text-gray-500" />
                        Account Settings
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                        <HelpCircle size={16} className="text-gray-500" />
                        Help & Support
                      </button>
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

        {/* Quick Stats Bar */}
        <div className="bg-white border-b border-gray-200 px-7 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">System Status:</span>
                <span className="text-sm font-medium text-emerald-600">Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <PieChart size={14} className="text-blue-500" />
                <span className="text-sm text-gray-700">Total Products:</span>
                <span className="text-sm font-bold text-gray-900">{sidebarStats.productsCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <Download size={14} />
                Export Data
              </button>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                <TrendingUp size={14} />
                View Reports
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth bg-gradient-to-b from-gray-50/50 to-transparent">
          <div 
            key={location.pathname} 
            className="animate-slideUp bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <Outlet />
          </div>
        </main>

        {/* Mobile Quick Actions */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 p-3 shadow-2xl">
            <div className="flex justify-around items-center">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex flex-col items-center gap-1 p-2 active:scale-95 transition-transform"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center shadow-md`}>
                    <action.icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 mt-1">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Venkateshwara Jewelers Admin • v2.0.1
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-gray-600 hover:text-amber-600 transition-colors">Help Center</a>
              <a href="#" className="text-sm text-gray-600 hover:text-amber-600 transition-colors">Documentation</a>
              <a href="#" className="text-sm text-gray-600 hover:text-amber-600 transition-colors">Support</a>
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
        
        /* Enhanced focus states for accessibility */
        *:focus-visible {
          outline: 2px solid #f59e0b;
          outline-offset: 2px;
          border-radius: 6px;
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
          main { padding-bottom: 100px; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;