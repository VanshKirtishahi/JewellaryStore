import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  XCircle,
  Zap,
  Shield,
  Award,
  ExternalLink,
  ArrowRight,
  Layers,
  Crown
} from 'lucide-react';

const OrderManagement = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // UI State
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats
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
    { value: 'all', label: 'All Orders', color: 'gray', icon: Package },
    { value: 'Pending', label: 'Pending', color: 'yellow', icon: Clock },
    { value: 'Processing', label: 'Processing', color: 'blue', icon: RefreshCw },
    { value: 'Shipped', label: 'Shipped', color: 'purple', icon: Truck },
    { value: 'Delivered', label: 'Delivered', color: 'green', icon: CheckCircle },
    { value: 'Cancelled', label: 'Cancelled', color: 'red', icon: XCircle },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/orders');
      const data = res.data || [];
      setOrders(data);
      calculateStats(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const revenue = data.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pending = data.filter(order => ['Pending', 'Processing'].includes(order.status)).length;
    const completed = data.filter(order => order.status === 'Delivered').length;

    // Simple Growth Logic (vs previous month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const thisMonthOrders = data.filter(o => new Date(o.createdAt).getMonth() === currentMonth);
    const lastMonthOrders = data.filter(o => new Date(o.createdAt).getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1));

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
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order._id?.toLowerCase().includes(q) ||
        order.userId?.name?.toLowerCase().includes(q) ||
        order.userId?.email?.toLowerCase().includes(q)
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
      fetchOrders(); // Refresh data
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        alert("Error updating status");
      }
    }
  };

  const bulkUpdateStatus = async (status) => {
    if (!selectedOrders.length) return;
    try {
      await Promise.all(selectedOrders.map(id => axios.put(`/orders/${id}`, { status })));
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        alert("Error updating orders");
      }
    }
  };

  const toggleOrderSelection = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map(order => order._id));
  };

  // --- Helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const map = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const getOrderItems = (order) => {
    if (order.products?.length > 0) return `${order.products.length} items`;
    return 'No items';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        <p className="mt-4 text-gray-500">Loading orders...</p>
      </div>
    );
  }

  const statsCards = [
    { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'blue' },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: Crown, color: 'emerald' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
    { label: 'Delivered', value: stats.completed, icon: Award, color: 'purple' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage customer orders.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchOrders}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* --- Stats Overview --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* --- Filters & Actions --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID, name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {dateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* --- Bulk Actions --- */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-blue-800">
            <Shield size={20} />
            <span className="font-medium">{selectedOrders.length} orders selected</span>
          </div>
          <div className="flex gap-3">
            <select 
              className="px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none"
              onChange={(e) => { if(e.target.value) bulkUpdateStatus(e.target.value) }}
            >
              <option value="">Update Status...</option>
              <option value="Processing">Mark as Processing</option>
              <option value="Shipped">Mark as Shipped</option>
              <option value="Delivered">Mark as Delivered</option>
            </select>
            <button 
              onClick={() => setSelectedOrders([])}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* --- Orders List --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            No orders found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                {/* Order Summary Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleOrderSelection(order._id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(order.createdAt)}</span>
                        <span className="flex items-center gap-1"><User size={14}/> {order.userId?.name || 'Guest'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600"
                      >
                        {expandedOrder === order._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order._id && (
                  <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                    {/* Customer Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User size={16} /> Customer Details
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium text-gray-700">Name:</span> {order.userId?.name || 'N/A'}</p>
                        <p><span className="font-medium text-gray-700">Email:</span> {order.userId?.email || 'N/A'}</p>
                        <p><span className="font-medium text-gray-700">Phone:</span> {order.userId?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={16} /> Shipping Details
                      </h4>
                      <p className="text-sm text-gray-600">{order.shippingAddress || 'No address provided.'}</p>
                    </div>

                    {/* Order Info & Actions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Layers size={16} /> Order Actions
                      </h4>
                      <div className="space-y-3">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        >
                          {statusOptions.filter(s => s.value !== 'all').map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 text-sm">
                          <Printer size={14} /> Print Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;