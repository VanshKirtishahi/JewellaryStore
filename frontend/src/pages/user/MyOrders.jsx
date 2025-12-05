import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  XCircle,
  Filter,
  Search,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield,
  Heart,
  Star,
  Sparkles,
  ZoomIn,
  Receipt,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  MoreVertical,
  DownloadCloud,
  Printer,
  Share2,
  Bookmark,
  Tag,
  Percent,
  Gift,
  Award,
  Crown,
  Zap,
  Activity
} from 'lucide-react';

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    cancelled: 0,
    totalSpent: 0
  });

  // Live updates state
  const [liveUpdates, setLiveUpdates] = useState({
    lastUpdate: new Date(),
    activeOrders: Math.floor(Math.random() * 5) + 1
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsRefreshing(true);
        const res = await axios.get(`/orders/find/${user.id}`);
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
        
        // Calculate statistics
        const statsData = {
          total: sortedOrders.length,
          delivered: sortedOrders.filter(o => o.status === 'Delivered').length,
          pending: sortedOrders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length,
          cancelled: sortedOrders.filter(o => o.status === 'Cancelled').length,
          totalSpent: sortedOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
        };
        setStats(statsData);
        
        // Update live data
        setLiveUpdates(prev => ({
          ...prev,
          lastUpdate: new Date(),
          activeOrders: Math.floor(Math.random() * 5) + 1
        }));
        
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    fetchOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [user]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'from-green-400 to-emerald-500 text-white';
      case 'Shipped': return 'from-purple-400 to-pink-500 text-white';
      case 'Processing': return 'from-blue-400 to-cyan-500 text-white';
      case 'Cancelled': return 'from-red-400 to-rose-500 text-white';
      default: return 'from-amber-400 to-orange-500 text-white';
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200';
      case 'Shipped': return 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200';
      case 'Processing': return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200';
      case 'Cancelled': return 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200';
      default: return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delivered': return <CheckCircle size={16} />;
      case 'Shipped': return <Truck size={16} />;
      case 'Processing': return <Package size={16} />;
      case 'Cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getProgressPercentage = (status) => {
    switch(status) {
      case 'Delivered': return 100;
      case 'Shipped': return 75;
      case 'Processing': return 50;
      case 'Pending': return 25;
      default: return 0;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesFilter = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`/orders/find/${user.id}`);
      const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
      
      setLiveUpdates(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    } catch (err) {
      console.error("Error refreshing orders", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-amber-200 border-b-transparent border-l-transparent rounded-full animate-ping"></div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Loading your orders...
            </p>
            <p className="text-sm text-gray-500">Fetching your purchase history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-floatIn">
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-200/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-200/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Header Section */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg animate-float">
                <ShoppingBag className="text-white" size={28} />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                {stats.total}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-medium text-blue-700">Track your purchase history</p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Activity size={12} />
                  Last updated: {getTimeAgo(liveUpdates.lastUpdate)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className={`p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-blue-300 transition-all duration-500 hover:scale-110 active:scale-95 group ${isRefreshing ? 'animate-spin' : ''}`}
            >
              {isRefreshing ? (
                <Loader2 size={20} className="text-blue-500" />
              ) : (
                <RefreshCw size={20} className="text-gray-500 group-hover:text-blue-500 group-hover:rotate-180 transition-all duration-500" />
              )}
            </button>
            <button className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 group">
              <span className="flex items-center gap-2">
                <DownloadCloud size={18} className="group-hover:animate-bounce" />
                Export Orders
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 animate-count-up">{stats.total}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-xl">
              <ShoppingBag size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg w-fit">
            All time purchases
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Delivered</p>
              <h3 className="text-2xl font-bold text-gray-900 animate-count-up">{stats.delivered}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-200 text-green-600 rounded-xl">
              <CheckCircle size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg w-fit">
            Successfully delivered
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900 animate-count-up">{stats.pending}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-200 text-amber-600 rounded-xl">
              <Clock size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg w-fit">
            In progress
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Cancelled</p>
              <h3 className="text-2xl font-bold text-gray-900 animate-count-up">{stats.cancelled}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-100 to-rose-200 text-red-600 rounded-xl">
              <XCircle size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg w-fit">
            Cancelled orders
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Total Spent</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-200 text-purple-600 rounded-xl">
              <DollarSign size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg w-fit">
            Lifetime value
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-5">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-300 transition-all duration-300">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search orders or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm ml-3 placeholder-gray-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-300 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="Delivered">Delivered</option>
                <option value="Shipped">Shipped</option>
                <option value="Processing">Processing</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <select className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-300 transition-colors">
                <option>All Time</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-12 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
            <ShoppingBag size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No orders found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            {searchTerm || statusFilter !== 'all' 
              ? "Try adjusting your search or filter criteria"
              : "Start your jewelry shopping journey with our exquisite collection"}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
            >
              Clear Filters
            </button>
            <button 
              onClick={() => window.location.href = '/collections'}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Browse Collections
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <div 
              key={order._id} 
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500 animate-slideIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getStatusColor(order.status)} flex items-center justify-center shadow-md`}>
                        {getStatusIcon(order.status)}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce-slow">
                          New
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</span>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusBgColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {order.items?.length || 0} items
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard size={14} />
                          {order.paymentMethod || 'Online Payment'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  <button
                    onClick={() => toggleOrderExpansion(order._id)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {expandedOrder === order._id ? (
                      <>
                        Show Less <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        View Details <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Order Progress Bar */}
              <div className="px-6 py-3 bg-gray-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Order Progress</span>
                  <span className="text-xs font-bold text-blue-600">{getProgressPercentage(order.status)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgressPercentage(order.status)}%` }}
                  ></div>
                </div>
              </div>

              {/* Order Items (Expanded) */}
              {expandedOrder === order._id && (
                <div className="p-6 border-t border-gray-100 animate-slideIn">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package size={18} />
                      Order Items
                    </h4>
                    <div className="space-y-4">
                      {order.items?.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-gray-100/30 hover:from-gray-100/50 hover:to-gray-200/30 transition-all duration-300 group"
                        >
                          <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <img 
                              src={item.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop'} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                              {item.name || 'Premium Jewelry Item'}
                            </h5>
                            <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                            {item.size && (
                              <p className="text-xs text-gray-400 mt-1">Size: {item.size}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Receipt size={18} />
                        Order Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">{formatCurrency(order.totalAmount - 100)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">₹100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium">₹{Math.round(order.totalAmount * 0.18)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Truck size={18} />
                        Shipping Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={14} />
                          <span>{order.shippingAddress || '123 Jewel Street, Mumbai, India'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          <span>{order.contactNumber || '+91 98765 43210'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} />
                          <span>{order.email || user.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 flex items-center gap-2">
                      <Printer size={16} />
                      Print Invoice
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300 flex items-center gap-2">
                      <Download size={16} />
                      Download PDF
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all duration-300 flex items-center gap-2">
                      <Share2 size={16} />
                      Share Order
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 flex items-center gap-2">
                      <Heart size={16} />
                      Reorder
                    </button>
                  </div>
                </div>
              )}

              {/* Order Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-sm text-gray-500">
                  Order placed {getTimeAgo(order.createdAt)}
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Eye size={14} />
                    Track Order
                  </button>
                  <button className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Get Help
                  </button>
                  <button className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                    <Star size={14} />
                    Rate Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination/Footer */}
      {filteredOrders.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredOrders.length}</span> of <span className="font-semibold">{orders.length}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors">
                Previous
              </button>
              <span className="px-3 py-2 bg-blue-600 text-white rounded-xl">1</span>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

<style>{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatIn {
    0% { opacity: 0; transform: translateY(30px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
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
  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes count-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
  .animate-floatIn { animation: floatIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .animate-slideIn { animation: slideIn 0.5s ease-out; }
  .animate-blob { animation: blob 7s infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
  .animate-bounce-slow { animation: bounce-slow 2s infinite; }
  .animate-count-up { animation: count-up 0.5s ease-out; }
  
  .animation-delay-2000 { animation-delay: 2s; }
  
  /* Responsive optimizations */
  @media (max-width: 768px) {
    .animate-floatIn { animation: fadeIn 0.4s ease-out; }
  }
`}</style>