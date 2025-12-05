import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';
import { 
  ShoppingBag,
  Gem,
  DollarSign,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  ShoppingCart,
  Gift,
  Users,
  CreditCard,
  Sparkles,
  BarChart3,
  Download,
  Filter,
  Eye,
  ChevronRight,
  Activity,
  Zap,
  Target,
  Star,
  RefreshCw,
  Loader2,
  Cloud,
  BatteryCharging,
  TrendingDown,
  PieChart,
  Bell,
  Calendar,
  Truck,
  Heart,
  Shield,
  ExternalLink,
  RotateCw,
  DownloadCloud,
  UploadCloud,
  Wifi,
  Signal,
  CloudLightning
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({ 
    orders: 0, 
    spent: 0, 
    requests: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [userDetails, setUserDetails] = useState({
    joinedDate: '',
    lastOrderDate: '',
    loyaltyPoints: 0,
    memberLevel: 'Silver'
  });
  
  // Live Updates State
  const [liveUpdates, setLiveUpdates] = useState({
    activeVisitors: Math.floor(Math.random() * 50) + 10,
    systemLoad: Math.floor(Math.random() * 30) + 60,
    lastUpdate: new Date(),
    orderTrend: Math.floor(Math.random() * 20) - 10 // Random trend -10% to +10%
  });

  // --- FETCH USER DATA ---
  const fetchUserData = async () => {
    try {
      if (!user) return;
      setIsRefreshing(true);
      
      const [ordersRes, requestsRes] = await Promise.all([
        axios.get(`/orders/find/${user.id}`),
        axios.get(`/custom/user/${user.id}`)
      ]);
      
      const orders = ordersRes.data;
      const requests = requestsRes.data;

      // Process orders data
      const pendingOrders = orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length;
      const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
      const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
      
      // Calculate total spent
      const totalSpent = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
      
      // Calculate loyalty points (1 point per 1000 spent)
      const loyaltyPoints = Math.floor(totalSpent / 1000);
      
      // Determine member level
      let memberLevel = 'Silver';
      if (loyaltyPoints > 100) memberLevel = 'Gold';
      if (loyaltyPoints > 500) memberLevel = 'Platinum';
      if (loyaltyPoints > 1000) memberLevel = 'Diamond';

      setStats({
        orders: orders.length,
        spent: totalSpent,
        requests: requests.length,
        pendingOrders,
        deliveredOrders,
        cancelledOrders
      });
      
      // Set user details
      setUserDetails({
        joinedDate: user.createdAt || new Date().toISOString(),
        lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
        loyaltyPoints,
        memberLevel
      });
      
      // Sort by date (newest first)
      const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 5));
      
      const sortedRequests = requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentRequests(sortedRequests.slice(0, 3));
      
      // Update live data
      setLiveUpdates(prev => ({
        ...prev,
        activeVisitors: Math.floor(Math.random() * 50) + 10,
        systemLoad: Math.floor(Math.random() * 30) + 60,
        lastUpdate: new Date(),
        orderTrend: Math.floor(Math.random() * 20) - 10
      }));
      
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    const interval = setInterval(fetchUserData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No orders yet';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'from-green-400 to-emerald-500 text-white';
      case 'Processing': return 'from-blue-400 to-cyan-500 text-white';
      case 'Shipped': return 'from-purple-400 to-pink-500 text-white';
      default: return 'from-amber-400 to-orange-500 text-white';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 border-green-200 text-green-700';
      case 'Processing': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Shipped': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'from-green-400 to-emerald-500 text-white';
      case 'In Progress': return 'from-blue-400 to-cyan-500 text-white';
      case 'Reviewing': return 'from-purple-400 to-pink-500 text-white';
      default: return 'from-amber-400 to-orange-500 text-white';
    }
  };

  const quickActions = [
    { icon: ShoppingCart, label: 'Shop Now', color: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500', action: () => navigate('/collections') },
    { icon: Gift, label: 'Loyalty Rewards', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500', action: () => {} },
    { icon: CreditCard, label: 'Payment Methods', color: 'bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500', action: () => {} },
    { icon: Users, label: 'Support', color: 'bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500', action: () => {} },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-amber-200 border-b-transparent border-l-transparent rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-amber-100 border-r-transparent border-b-transparent rounded-full animate-ping animation-delay-1000"></div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Loading your dashboard...
            </p>
            <p className="text-sm text-gray-500">Fetching real-time data</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse animation-delay-300"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse animation-delay-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-floatIn">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-200/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-200/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-200/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Welcome Section with Live Updates */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 hover:shadow-3xl transition-all duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg animate-float">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>!
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-medium text-blue-700">Live updates enabled</p>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Cloud size={12} />
                    Last sync: {getTimeAgo(liveUpdates.lastUpdate)}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              Here's what's happening with your account today. You have <span className="font-bold text-amber-600">{stats.pendingOrders}</span> pending orders
              {stats.pendingOrders > 0 && (
                <span className="ml-2 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 animate-pulse-slow">
                  Action required
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchUserData}
              className={`p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-amber-300 transition-all duration-500 hover:scale-110 active:scale-95 group ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Data"
            >
              {isRefreshing ? (
                <Loader2 size={20} className="text-amber-500" />
              ) : (
                <RefreshCw size={20} className="text-gray-500 group-hover:text-amber-500 group-hover:rotate-180 transition-all duration-500" />
              )}
            </button>
            <button 
              onClick={() => navigate('/collections')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 group"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                Start Shopping
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid with Enhanced Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders Card */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-900 animate-count-up">{stats.orders}</h3>
              <div className="flex items-center gap-2 mt-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${liveUpdates.orderTrend >= 0 ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700' : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700'}`}>
                  {liveUpdates.orderTrend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(liveUpdates.orderTrend)}% {liveUpdates.orderTrend >= 0 ? 'increase' : 'decrease'}
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-xl group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                <ShoppingBag size={26} />
              </div>
              {stats.pendingOrders > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce-slow">
                  {stats.pendingOrders}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
              <Clock size={14} className="mr-2" />
              {stats.pendingOrders} Pending
            </div>
            <div className="text-xs text-gray-500">
              {stats.deliveredOrders} Delivered
            </div>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Total Spent</p>
              <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(stats.spent)}</h3>
              <div className="mt-3 text-sm text-gray-500">
                Average: {formatCurrency(stats.orders > 0 ? stats.spent / stats.orders : 0)}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 rounded-xl group-hover:rotate-12 transition-transform duration-500 shadow-lg">
              <DollarSign size={26} />
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
            <TrendingUp size={14} className="mr-2 animate-pulse-slow" />
            Lifetime Shopping Value
          </div>
        </div>

        {/* Custom Requests Card */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Custom Requests</p>
              <h3 className="text-3xl font-bold text-gray-900 animate-count-up">{stats.requests}</h3>
              <div className="mt-3 text-sm text-gray-500">
                Unique designs created
              </div>
            </div>
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-xl group-hover:rotate-12 transition-transform duration-500 shadow-lg animate-float">
                <Gem size={26} />
              </div>
              {stats.requests > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping"></div>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
            <Sparkles size={14} className="mr-2" />
            Exclusive Personal Designs
          </div>
        </div>

        {/* Loyalty Status Card */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Loyalty Status</p>
              <h3 className="text-3xl font-bold text-gray-900">{userDetails.loyaltyPoints}</h3>
              <div className="mt-3 text-sm text-gray-500">
                Points • {userDetails.memberLevel} Tier
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-600 rounded-xl group-hover:rotate-12 transition-transform duration-500 shadow-lg">
              <Award size={26} />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
              <Award size={14} className="mr-2" />
              {userDetails.memberLevel} Member
            </div>
            <div className="text-xs px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold">
              VIP
            </div>
          </div>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-medium text-gray-900">System Status:</span>
              <span className="text-sm font-bold text-emerald-600">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-blue-500" />
              <span className="text-sm text-gray-600">Active Visitors:</span>
              <span className="text-sm font-bold text-blue-600">{liveUpdates.activeVisitors}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-500" />
              <span className="text-sm text-gray-600">Load:</span>
              <span className="text-sm font-bold text-amber-600">{liveUpdates.systemLoad}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CloudLightning size={14} />
            <span>Real-time updates • Auto-refresh every 15s</span>
          </div>
        </div>
      </div>

      {/* Quick Actions with Enhanced Effects */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`${action.color} text-white p-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 group hover:scale-[1.05] active:scale-95 relative overflow-hidden`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 group-hover:scale-110">
                <action.icon size={26} />
              </div>
              <span className="font-semibold text-sm">{action.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {recentOrders.length}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Recent Orders</h3>
                <p className="text-sm text-gray-500">Your latest purchases</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <Filter size={16} />
              </button>
              <button 
                onClick={() => navigate('/user/orders')}
                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1.5 px-4 py-2 hover:bg-amber-50 rounded-xl group"
              >
                View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100/50">
            {recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                  <Package size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium mb-2">No orders yet</p>
                <p className="text-gray-500 text-sm mb-4">Start your jewelry shopping journey</p>
                <button 
                  onClick={() => navigate('/collections')}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Start shopping →
                </button>
              </div>
            ) : (
              recentOrders.map((order, index) => (
                <div 
                  key={order._id} 
                  className="px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/30 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getStatusColor(order.status)} flex items-center justify-center shadow-md`}>
                          {order.status === 'Delivered' ? <CheckCircle size={16} /> : 
                           order.status === 'Processing' ? <Clock size={16} /> :
                           order.status === 'Shipped' ? <Truck size={16} /> : 
                           <Package size={16} />}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-400">{getTimeAgo(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusBgColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600">
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-float-slow">
                  <Gem size={20} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {recentRequests.length}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Recent Requests</h3>
                <p className="text-sm text-gray-500">Your custom design inquiries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <Filter size={16} />
              </button>
              <button 
                onClick={() => navigate('/user/requests')}
                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1.5 px-4 py-2 hover:bg-amber-50 rounded-xl group"
              >
                View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100/50">
            {recentRequests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-pink-200 flex items-center justify-center mx-auto mb-4 animate-float">
                  <Gem size={32} className="text-purple-400" />
                </div>
                <p className="text-gray-700 font-medium mb-2">No custom requests yet</p>
                <p className="text-gray-500 text-sm mb-4">Create your unique jewelry design</p>
                <button 
                  onClick={() => navigate('/custom-request')}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Create request →
                </button>
              </div>
            ) : (
              recentRequests.map((request, index) => (
                <div 
                  key={request._id} 
                  className="px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/30 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getRequestStatusColor(request.status)} flex items-center justify-center shadow-md mt-1`}>
                        {request.status === 'Completed' ? <CheckCircle size={16} /> : 
                         request.status === 'In Progress' ? <Clock size={16} /> :
                         <Gem size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                          {request.title || 'Custom Design'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-400">{getTimeAgo(request.createdAt)}</p>
                        </div>
                        {request.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2 group-hover:line-clamp-none transition-all">
                            {request.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBgColor(request.status)} whitespace-nowrap`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

<style>{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatIn {
    0% { opacity: 0; transform: translateY(30px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  @keyframes ping {
    75%, 100% { transform: scale(1.5); opacity: 0; }
  }
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes count-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
  .animate-floatIn { animation: floatIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .animate-blob { animation: blob 7s infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
  .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
  .animate-ping { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
  .animate-bounce-slow { animation: bounce-slow 2s infinite; }
  .animate-count-up { animation: count-up 0.5s ease-out; }
  .animate-shimmer { animation: shimmer 2s infinite; }
  
  .animation-delay-1000 { animation-delay: 1s; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-300 { animation-delay: 300ms; }
  .animation-delay-4000 { animation-delay: 4s; }
  .animation-delay-600 { animation-delay: 600ms; }
  
  /* Responsive optimizations */
  @media (max-width: 768px) {
    .animate-floatIn { animation: fadeIn 0.4s ease-out; }
  }
  
  /* Custom utilities */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-none {
    -webkit-line-clamp: unset;
  }
`}</style>