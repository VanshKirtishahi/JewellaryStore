import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, PenTool,
  Users, BarChart3, LogOut, Menu, X
} from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
// FIX: Correct import path
import { AuthContext } from '../../context/AuthContext';
import vkLogo from '../assets/VK-Logo.png';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/requests', icon: PenTool, label: 'Custom Requests' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    // Admin Container: Flex row, full height, distinct background
    <div className="flex h-screen bg-gray-100 overflow-hidden text-left relative">

      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Flex Item */}
      <aside
        className={`${isMobile
            ? `fixed inset-y-0 left-0 z-30 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `relative ${isSidebarOpen ? 'w-64' : 'w-20'}`
          } bg-slate-900 text-white flex flex-col transition-all duration-300 flex-shrink-0 shadow-xl`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800">
          <span className={`font-bold text-lg tracking-wider ${!isSidebarOpen && !isMobile && 'hidden'}`}>
            Admin Panel
          </span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {isMobile && isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsSidebarOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              title={!isSidebarOpen && !isMobile ? item.label : ''}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className={`whitespace-nowrap ${!isSidebarOpen && !isMobile && 'hidden'}`}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {(isSidebarOpen || isMobile) && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-0.5"
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content: Flex-1 ensures it fills remaining width */}
      <div className="flex-1 flex flex-col min-w-0 h-full w-full">

        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {isMobile && !isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600">
                <Menu size={24} />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-800 truncate">
              {navItems.find(i => isActive(i.path))?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4 w-20">
            {/* You can add notifications/search here later */}
            <img src={vkLogo} alt="logo" className="h-10 w-auto object-contain" />
          </div>
        </header>

        {/* Content Body - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 min-h-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;