import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  MessageSquare,
  RefreshCw,
  ShoppingBag,
  Gem,
  TrendingUp,
  TrendingDown,
  XCircle,
  Sparkles,
  Zap,
  Shield,
  Award,
  BarChart3,
  ExternalLink,
  ArrowRight,
  Layers,
  Target,
  Crown
} from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statsVisible, setStatsVisible] = useState([false, false, false, false]);
  const [hoveredOrder, setHoveredOrder] = useState(null);
  
  // Enhanced stats state
  const [stats, setStats] = useState({
    total: 0,
    ordersChange: 0,
    isOrdersUp: true,
    revenue: 0,
    revenueChange: 0,
    isRevenueUp: true,
    pending: 0,
    completed: 0
  });

  const statusOptions = [
    { value: 'all', label: 'All Orders', color: 'gray', icon: Package, bgColor: 'bg-gradient-to-br from-gray-400 to-gray-600' },
    { value: 'Pending', label: 'Pending', color: 'yellow', icon: Clock, bgColor: 'bg-gradient-to-br from-amber-400 to-yellow-500' },
    { value: 'Processing', label: 'Processing', color: 'blue', icon: RefreshCw, bgColor: 'bg-gradient-to-br from-blue-400 to-cyan-500' },
    { value: 'Shipped', label: 'Shipped', color: 'purple', icon: Truck, bgColor: 'bg-gradient-to-br from-purple-400 to-pink-500' },
    { value: 'Delivered', label: 'Delivered', color: 'green', icon: CheckCircle, bgColor: 'bg-gradient-to-br from-emerald-400 to-green-500' },
    { value: 'Cancelled', label: 'Cancelled', color: 'red', icon: XCircle, bgColor: 'bg-gradient-to-br from-red-400 to-rose-500' },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount-high', label: 'Highest Amount' },
    { value: 'amount-low', label: 'Lowest Amount' },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchQuery, statusFilter, dateFilter, sortBy]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setStatsVisible([true, false, false, false]), 100);
      setTimeout(() => setStatsVisible([true, true, false, false]), 200);
      setTimeout(() => setStatsVisible([true, true, true, false]), 300);
      setTimeout(() => setStatsVisible([true, true, true, true]), 400);
    }
  }, [loading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/orders');
      const data = res.data;
      setOrders(data);
      calculateStats(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const revenue = data.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pending = data.filter(order => ['Pending', 'Processing'].includes(order.status)).length;
    const completed = data.filter(order => order.status === 'Delivered').length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const thisMonthOrders = data.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthOrders = data.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const ordersChange = lastMonthOrders.length === 0 
      ? 100 
      : ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;

    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const revenueChange = lastMonthRevenue === 0 
      ? 100 
      : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    setStats({
      total,
      ordersChange: Math.abs(ordersChange).toFixed(1),
      isOrdersUp: ordersChange >= 0,
      revenue,
      revenueChange: Math.abs(revenueChange).toFixed(1),
      isRevenueUp: revenueChange >= 0,
      pending,
      completed
    });
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today': startDate.setHours(0, 0, 0, 0); break;
        case 'week': startDate.setDate(now.getDate() - 7); break;
        case 'month': startDate.setMonth(now.getMonth() - 1); break;
        case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
      }
      
      filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount-high': return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'amount-low': return (a.totalAmount || 0) - (b.totalAmount || 0);
        default: return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/orders/${id}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const bulkUpdateStatus = async (status) => {
    if (!selectedOrders.length) return;
    try {
      await Promise.all(selectedOrders.map(id => axios.put(`/orders/${id}`, { status })));
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      alert("Error updating orders");
    }
  };

  const toggleOrderSelection = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map(order => order._id));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getOrderItems = (order) => {
    if (order.products && order.products.length > 0) {
      return order.products.length + ' items'; 
    }
    return 'No items';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-jewel-gold/20 border-t-jewel-gold rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-8 h-8 text-jewel-gold animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-700">Loading Orders</p>
          <p className="text-sm text-gray-500">Fetching all order details...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { 
      label: 'Total Orders', 
      value: stats.total, 
      change: `${stats.ordersChange}%`, 
      isUp: stats.isOrdersUp,
      hasTrend: true,
      icon: ShoppingBag,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      iconColor: 'text-white',
      subtext: 'Total orders received'
    },
    { 
      label: 'Revenue', 
      value: formatCurrency(stats.revenue), 
      change: `${stats.revenueChange}%`, 
      isUp: stats.isRevenueUp,
      hasTrend: true,
      icon: Crown,
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
      iconColor: 'text-white',
      subtext: 'Total revenue generated'
    },
    { 
      label: 'Pending', 
      value: stats.pending, 
      hasTrend: false,
      icon: Clock,
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-500',
      iconColor: 'text-white',
      subtext: 'Orders in process'
    },
    { 
      label: 'Delivered', 
      value: stats.completed, 
      hasTrend: false,
      icon: Award,
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      iconColor: 'text-white',
      subtext: 'Completed orders'
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-jewel-gold/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-30 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-200/50 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">Order Management</h1>
                <Sparkles className="w-6 h-6 text-jewel-gold animate-pulse" />
              </div>
              <p className="text-gray-600 lg:text-lg">Track and manage all jewelry orders with precision</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchOrders}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-jewel-gold to-amber-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
              >
                <Filter className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards with Staggered Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden group bg-white rounded-2xl shadow-lg border border-gray-200/50
              hover:shadow-2xl hover:border-gray-300/50 transition-all duration-500
              transform ${statsVisible[index] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
              hover:scale-[1.02]
            `}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-current rounded-full opacity-20 animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${Math.random() * 10 + 10}s`
                  }}
                />
              ))}
            </div>

            <div className="relative p-5 lg:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 tracking-wide">{stat.label}</p>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
                <div className={`
                  p-3 rounded-xl ${stat.iconBg} shadow-md
                  transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
                `}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {stat.hasTrend ? (
                    <>
                      <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
                        stat.isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {stat.isUp ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-bold">{stat.change}</span>
                      </div>
                      <span className="text-xs text-gray-500">vs last month</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                      <span className="text-xs text-gray-500">Live status</span>
                    </div>
                  )}
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  stat.hasTrend ? (stat.isUp ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-gray-400'
                } animate-pulse`}></div>
              </div>
            </div>

            {/* Bottom Gradient Bar */}
            <div className={`h-1 ${stat.iconBg} transition-all duration-500 group-hover:h-1.5`}></div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-slideDown hover:shadow-2xl transition-all duration-500">
            <h3 className="font-serif font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-jewel-gold" />
              Filter & Sort Orders
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  Search Orders
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, name, or email..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg bg-white"
                >
                  {dateOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg bg-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{filteredOrders.length}</span> orders match your criteria
              </div>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateFilter('all');
                  setSortBy('newest');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:scale-105"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-jewel-gold/20 to-amber-500/20 blur-xl rounded-3xl animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-jewel-gold/10 to-amber-500/10 border border-jewel-gold/20 rounded-2xl p-4 lg:p-6 animate-slideDown">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-jewel-gold to-amber-500 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-gray-600">Perform bulk actions on selected orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  onChange={(e) => bulkUpdateStatus(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-jewel-gold min-w-[180px]"
                >
                  <option value="">Bulk Status Update</option>
                  <option value="Processing">Mark as Processing</option>
                  <option value="Shipped">Mark as Shipped</option>
                  <option value="Delivered">Mark as Delivered</option>
                  <option value="Cancelled">Cancel Orders</option>
                </select>
                <button className="px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print Labels
                </button>
                <button 
                  onClick={() => setSelectedOrders([])}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:scale-[1.02] active:scale-95"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={selectAllOrders}
                    className="w-5 h-5 text-jewel-gold rounded focus:ring-2 focus:ring-jewel-gold cursor-pointer hover:scale-110 transition-transform duration-300"
                  />
                  <div className="text-sm font-medium text-gray-700">
                    {selectedOrders.length} of {filteredOrders.length} selected
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-medium">
                  <span className="text-gray-900 font-bold">{filteredOrders.length}</span> orders
                </div>
              </div>
            </div>
          </div>

          {/* Orders Content */}
          <div className="divide-y divide-gray-200/50">
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center">
                <div className="relative inline-block mb-6">
                  <Gem className="w-16 h-16 text-gray-300 group-hover:text-jewel-gold/50 transition-all duration-500" />
                  <Search className="absolute -top-2 -right-2 w-8 h-8 text-jewel-gold animate-pulse" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your search or filters' 
                    : 'No orders have been placed yet.'}
                </p>
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setDateFilter('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2 mx-auto group"
                  >
                    <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                    Reset Filters
                  </button>
                ) : null}
              </div>
            ) : (
              filteredOrders.map((order, index) => {
                const statusObj = statusOptions.find(s => s.value === order.status) || statusOptions[0];
                const StatusIcon = statusObj.icon;

                return (
                  <div 
                    key={order._id} 
                    className={`
                      relative overflow-hidden group/order bg-white
                      hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all duration-300
                      ${hoveredOrder === order._id ? 'ring-1 ring-jewel-gold/10' : ''}
                    `}
                    onMouseEnter={() => setHoveredOrder(order._id)}
                    onMouseLeave={() => setHoveredOrder(null)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Main Order Row */}
                    <div className="px-6 py-5">
                      <div className="flex items-start justify-between">
                        {/* Left Side - Selection & Basic Info */}
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => toggleOrderSelection(order._id)}
                            className="w-5 h-5 text-jewel-gold rounded focus:ring-2 focus:ring-jewel-gold cursor-pointer hover:scale-110 transition-transform duration-300 mt-1"
                          />
                          
                          <div className="flex items-start gap-4">
                            {/* Order Icon with Status */}
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-xl ${statusObj.bgColor} flex items-center justify-center shadow-lg`}>
                                <StatusIcon className="w-6 h-6 text-white" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                <div className={`w-2 h-2 rounded-full bg-${statusObj.color}-500 animate-pulse`}></div>
                              </div>
                            </div>
                            
                            {/* Order Details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-gray-900">
                                  Order #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                                </h3>
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(order.createdAt)}
                                  </span>
                                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
                                    <User className="w-3 h-3" />
                                    {order.userId?.name || 'Guest'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="text-xs font-medium text-gray-500 mb-1">ITEMS</div>
                                  <div className="font-bold text-gray-900">{getOrderItems(order)}</div>
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-gray-500 mb-1">TOTAL AMOUNT</div>
                                  <div className="font-bold text-gray-900 text-xl">{formatCurrency(order.totalAmount)}</div>
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-gray-500 mb-1">STATUS</div>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full bg-${statusObj.color}-500 animate-pulse`}></div>
                                    <span className={`font-bold text-${statusObj.color}-700`}>{order.status}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Side - Actions */}
                        <div className="flex items-center gap-3">
                          <div className="hidden lg:flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jewel-gold bg-white hover:shadow-lg transition-all duration-300"
                            >
                              {statusOptions.filter(s => s.value !== 'all').map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                              ))}
                            </select>
                            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110">
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 group/expand"
                          >
                            {expandedOrder === order._id ? (
                              <ChevronUp className="w-5 h-5 group-hover/expand:text-jewel-gold transition-colors duration-300" />
                            ) : (
                              <ChevronDown className="w-5 h-5 group-hover/expand:text-jewel-gold transition-colors duration-300" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Quick Actions - Mobile */}
                      <div className="flex lg:hidden items-center gap-3 mt-4 pl-16">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jewel-gold bg-white"
                        >
                          {statusOptions.filter(s => s.value !== 'all').map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedOrder === order._id && (
                      <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200 animate-slideDown">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Customer Information */}
                          <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <User className="w-5 h-5 text-blue-500" />
                              Customer Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{order.userId?.name || 'Guest Customer'}</div>
                                  <div className="text-sm text-gray-600">{order.userId?.email || 'No email provided'}</div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{order.userId?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{order.userId?.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                  <span className="text-gray-700">{order.shippingAddress || 'No address provided'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Order Timeline */}
                          <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Clock className="w-5 h-5 text-emerald-500" />
                              Order Timeline
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Order Placed</span>
                                <span className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Last Updated</span>
                                <span className="text-sm font-medium text-gray-900">{formatDate(order.updatedAt)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Payment Status</span>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                  order.paymentStatus === 'Paid' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {order.paymentStatus || 'Pending'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Payment Method</span>
                                <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                  <CreditCard className="w-4 h-4" />
                                  {order.paymentMethod || 'Credit Card'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-xl border border-amber-100">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Zap className="w-5 h-5 text-amber-500" />
                              Quick Actions
                            </h4>
                            <div className="space-y-3">
                              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Contact Customer
                              </button>
                              <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                View Full Details
                              </button>
                              <button className="w-full px-4 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                <ArrowRight className="w-4 h-4" />
                                Track Order
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;