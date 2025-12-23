import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Gem, 
  Settings, 
  LogOut, 
  Menu, 
  Bell,
  Search,
  ChevronRight,
  User,
  Heart,
  Package,
  Shield,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';

const UserLayout = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // User Data State
  const [userStats, setUserStats] = useState({
    ordersCount: 0,
    totalSpent: 0,
    requestsCount: 0,
    pendingOrders: 0,
    loyaltyPoints: 0,
    memberLevel: 'Silver'
  });

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // --- 1. FETCH WHOLE DATA FROM DATABASE ---
  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;
      
      // If no user after loading, redirect to login
      if (!user) {
        navigate('/login');
        return;
      }

      setIsLoadingStats(true);
      try {
        // Use _id (MongoDB default) or id
        const userId = user._id || user.id;

        const [ordersRes, requestsRes] = await Promise.all([
          axios.get(`/orders/find/${userId}`),
          axios.get(`/custom/user/${userId}`)
        ]);
        
        const orders = ordersRes.data || [];
        const requests = requestsRes.data || [];

        // Calculate Stats
        const totalSpent = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        // Example logic: 1 point per $10 spent
        const loyaltyPoints = Math.floor(totalSpent / 10); 
        
        let memberLevel = 'Silver';
        if (loyaltyPoints > 500) memberLevel = 'Gold';
        if (loyaltyPoints > 2000) memberLevel = 'Platinum';
        if (loyaltyPoints > 5000) memberLevel = 'Diamond';

        setUserStats({
          ordersCount: orders.length,
          totalSpent,
          requestsCount: requests.length,
          pendingOrders: orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length,
          loyaltyPoints,
          memberLevel
        });

      } catch (err) {
        console.error("Error fetching user dashboard data:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchData();
  }, [user, authLoading, navigate]);

  // --- 2. RESPONSIVE HANDLER ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 3. CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  const navItems = [
    { path: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/user/orders', icon: ShoppingBag, label: 'My Orders' },
    { path: '/user/requests', icon: Gem, label: 'Custom Requests' },
    { path: '/user/wishlist', icon: Heart, label: 'Wishlist' },
    { path: '/user/track-order', icon: Package, label: 'Track Order' },
    { path: '/user/settings', icon: Settings, label: 'Settings' },
  ];

  // Placeholder notifications (Fetch these from DB in a real app)
  const notifications = [
    { id: 1, title: 'Welcome!', text: 'Complete your profile to earn 50 points.', time: 'Just now', unread: true },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-jewel-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center text-white font-serif  group-hover:scale-105 transition-transform">
              <img src="src/assets/VK-Logo.png" alt="logo"/>
            </div>
            {isSidebarOpen && (
              <span className="font-serif font-bold text-gray-900 text-lg tracking-wide whitespace-nowrap opacity-100 transition-opacity">
                Venkateshwara
              </span>
            )}
          </Link>
        </div>

        {/* User Mini Profile (Sidebar) */}
        {isSidebarOpen && (
          <div className="p-6 text-center border-b border-gray-50">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-jewel-gold mb-3 border-2 border-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-semibold text-gray-900 truncate">{user?.name}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{userStats.memberLevel} Member</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-jewel-gold/10 text-jewel-gold font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon size={20} className={isActive ? 'text-jewel-gold' : 'text-gray-500 group-hover:text-gray-700'} />
                
                <span className={`whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  {item.label}
                </span>

                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-jewel-gold rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors
              ${!isSidebarOpen ? 'justify-center' : ''}
            `}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>


      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 capitalize">
              {location.pathname.split('/').pop().replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar (Hidden on Mobile) */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-jewel-gold/20 transition-all">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                    <span className="font-semibold text-sm">Notifications</span>
                    <span className="text-xs text-jewel-gold cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.text}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                className="flex items-center gap-2 pl-2"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-jewel-gold to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <ChevronRight size={16} className={`text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-90' : ''}`} />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link 
                    to="/user/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    Account Settings
                  </Link>
                  <div className="border-t border-gray-50 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {isLoadingStats ? (
             <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
             </div>
          ) : (
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Pass userStats down to children via context or props if needed by Outlet components */}
               <Outlet context={{ userStats, user }} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;