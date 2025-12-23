import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, PenTool, 
  Users, BarChart3, LogOut, Menu 
} from 'lucide-react';
import { useState, useContext } from 'react';
// FIX: Correct import path
import { AuthContext } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="flex h-screen bg-gray-100 overflow-hidden text-left">
      
      {/* Sidebar: Flex Item */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white flex flex-col transition-all duration-300 flex-shrink-0 shadow-xl z-20`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800">
          <span className={`font-bold text-lg tracking-wider ${!isSidebarOpen && 'hidden'}`}>Venkateshwara Enterprises</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive(item.path) 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={!isSidebarOpen ? item.label : ''}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className={`whitespace-nowrap ${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {isSidebarOpen && (
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
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find(i => isActive(i.path))?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4 w-20">
             {/* You can add notifications/search here later */}
             <img src="src/assets/VK-Logo.png" alt="logo" />
          </div>
        </header>

        {/* Content Body - Scrollable */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;