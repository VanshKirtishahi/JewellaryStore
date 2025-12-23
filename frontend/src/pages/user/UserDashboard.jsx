import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';
import { 
  ShoppingBag,
  Gem,
  DollarSign,
  Clock,
  CheckCircle,
  Package,
  ShoppingCart,
  ChevronRight,
  TrendingUp,
  Calendar,
  Truck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    orders: 0, 
    spent: 0, 
    requests: 0,
    pendingOrders: 0,
    loyaltyPoints: 0,
    memberLevel: 'Silver'
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  // --- FETCH USER DATA ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;
        
        // Support both _id (MongoDB) and id
        const userId = user._id || user.id;

        const [ordersRes, requestsRes] = await Promise.all([
          axios.get(`/orders/find/${userId}`),
          axios.get(`/custom/user/${userId}`)
        ]);
        
        const orders = ordersRes.data || [];
        const requests = requestsRes.data || [];

        // 1. Process Order Stats
        const pendingCount = orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length;
        const totalSpent = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        
        // 2. Calculate Loyalty Logic (e.g., 1 point per $10)
        const loyaltyPoints = Math.floor(totalSpent / 10);
        
        let memberLevel = 'Silver';
        if (loyaltyPoints > 500) memberLevel = 'Gold';
        if (loyaltyPoints > 2000) memberLevel = 'Platinum';
        if (loyaltyPoints > 5000) memberLevel = 'Diamond';

        setStats({
          orders: orders.length,
          spent: totalSpent,
          requests: requests.length,
          pendingOrders: pendingCount,
          loyaltyPoints,
          memberLevel
        });
        
        // 3. Sort & Slice Recent Activity
        const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(sortedOrders.slice(0, 5));
        
        const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentRequests(sortedRequests.slice(0, 3));
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // --- UTILS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={16} />;
      case 'Shipped': return <Truck size={16} />;
      case 'Processing': return <Clock size={16} />;
      case 'Cancelled': return <AlertCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-jewel-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Welcome Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-gray-300">
              You have <span className="font-bold text-amber-400">{stats.pendingOrders} active orders</span> and <span className="font-bold text-amber-400">{stats.loyaltyPoints} loyalty points</span>.
            </p>
          </div>
          <button 
            onClick={() => navigate('/collections')}
            className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-amber-50 transition-colors flex items-center gap-2 shadow-lg"
          >
            <ShoppingCart size={18} />
            Start Shopping
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Spent */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
              Lifetime
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Spent</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.spent)}</h3>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Package size={24} />
            </div>
            {stats.pendingOrders > 0 && (
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                <Clock size={12} /> Active
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Orders</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.orders}</h3>
        </div>

        {/* Custom Requests */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Gem size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Custom Requests</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.requests}</h3>
        </div>

        {/* Loyalty Tier */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
              {stats.memberLevel}
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Loyalty Points</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.loyaltyPoints} pts</h3>
        </div>
      </div>

      {/* 3. Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button 
              onClick={() => navigate('/user/orders')}
              className="text-sm text-jewel-gold hover:text-amber-700 font-medium flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No orders yet. Start shopping!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg border ${getStatusColor(order.status)} bg-opacity-20`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Custom Requests</h2>
            <button 
              onClick={() => navigate('/user/requests')}
              className="text-sm text-jewel-gold hover:text-amber-700 font-medium flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {recentRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Gem size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No custom requests yet.</p>
                <button 
                  onClick={() => navigate('/custom-request')}
                  className="mt-4 text-sm text-jewel-gold underline"
                >
                  Create one now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentRequests.map((req) => (
                  <div key={req._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <Gem size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{req.title || 'Custom Jewelry'}</p>
                        <p className="text-xs text-gray-500">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      req.status === 'Completed' ? 'bg-green-50 border-green-200 text-green-700' : 
                      'bg-gray-50 border-gray-200 text-gray-600'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default UserDashboard;