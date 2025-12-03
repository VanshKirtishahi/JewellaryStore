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
  BarChart3,
  ShoppingBag,
  Gem,
  Sparkles,
  XCircle
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
  const [stats, setStats] = useState({
    total: 0,
    revenue: 0,
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
    calculateStats();
  }, [orders, searchQuery, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(order => 
        new Date(order.createdAt || order.orderDate) >= startDate
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'amount-high':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'amount-low':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const calculateStats = () => {
    const total = orders.length;
    const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pending = orders.filter(order => ['Pending', 'Processing'].includes(order.status)).length;
    const completed = orders.filter(order => order.status === 'Delivered').length;

    setStats({ total, revenue, pending, completed });
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
      await Promise.all(
        selectedOrders.map(id => 
          axios.put(`/orders/${id}`, { status })
        )
      );
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      alert("Error updating orders");
    }
  };

  const toggleOrderSelection = (id) => {
    setSelectedOrders(prev =>
      prev.includes(id)
        ? prev.filter(orderId => orderId !== id)
        : [...prev, id]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order._id));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getOrderItems = (order) => {
    // Assuming order.items is an array of products
    if (order.items && order.items.length > 0) {
      return order.items.map(item => item.name || 'Product').join(', ');
    }
    return 'No items listed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-jewel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all jewelry orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-jewel-gold text-white rounded-lg hover:bg-amber-600 transition-colors duration-300 flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Orders', 
            value: stats.total, 
            change: '+12%', 
            color: 'blue', 
            icon: ShoppingBag,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          { 
            label: 'Revenue', 
            value: formatCurrency(stats.revenue), 
            change: '+18%', 
            color: 'green', 
            icon: DollarSign,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
          },
          { 
            label: 'Pending', 
            value: stats.pending, 
            change: '-5%', 
            color: 'yellow', 
            icon: Clock,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600'
          },
          { 
            label: 'Delivered', 
            value: stats.completed, 
            change: '+8%', 
            color: 'emerald', 
            icon: CheckCircle,
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">from last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={stat.textColor} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, name, email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                onChange={selectAllOrders}
                className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold"
              />
              <span className="text-sm text-gray-600">
                {selectedOrders.length} of {filteredOrders.length} selected
              </span>
              
              {selectedOrders.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Bulk actions:</span>
                  <select
                    onChange={(e) => bulkUpdateStatus(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 outline-none"
                  >
                    <option value="">Update Status</option>
                    <option value="Processing">Mark as Processing</option>
                    <option value="Shipped">Mark as Shipped</option>
                    <option value="Delivered">Mark as Delivered</option>
                    <option value="Cancelled">Cancel Orders</option>
                  </select>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              Showing {filteredOrders.length} orders
            </span>
          </div>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center">
              <Gem className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try changing your filters' 
                  : 'No orders placed yet'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                {/* Order Header */}
                <div className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleOrderSelection(order._id)}
                        className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold mt-1"
                      />
                      
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-jewel-gold/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                          <Package className="text-jewel-gold" size={20} />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-bold">
                                Order #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User size={14} />
                                  {order.userId?.name || 'Guest Customer'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Order Details */}
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-500 mb-1">Items</div>
                              <div className="font-medium text-sm truncate">
                                {getOrderItems(order)}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                              <div className="font-bold text-lg text-gray-900">
                                {formatCurrency(order.totalAmount)}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-500 mb-1">Status</div>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full bg-${getStatusColor(order.status)}-500`}></div>
                                <span className={`font-medium text-${getStatusColor(order.status)}-700`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        {expandedOrder === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-3 mt-4 pl-14">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-jewel-gold"
                    >
                      {statusOptions
                        .filter(s => s.value !== 'all')
                        .map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                    </select>
                    
                    <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center gap-1">
                      <Eye size={14} />
                      View Details
                    </button>
                    
                    <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center gap-1">
                      <Printer size={14} />
                      Print Invoice
                    </button>
                    
                    <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center gap-1 ml-auto">
                      <MessageSquare size={14} />
                      Contact Customer
                    </button>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order._id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 animate-slideDown">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <User size={16} />
                          Customer Information
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={14} className="text-gray-400" />
                            <span>{order.userId?.email || 'No email provided'}</span>
                          </div>
                          {order.userId?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={14} className="text-gray-400" />
                              <span>{order.userId.phone}</span>
                            </div>
                          )}
                          {order.shippingAddress && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin size={14} className="text-gray-400 mt-0.5" />
                              <span>{order.shippingAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Timeline */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Clock size={16} />
                          Order Timeline
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Order Placed</span>
                            <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Payment Status</span>
                            <span className="flex items-center gap-1">
                              <CreditCard size={14} />
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                order.paymentStatus === 'Paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.paymentStatus || 'Pending'}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Last Updated</span>
                            <span className="text-gray-500">{formatDate(order.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button className="px-4 py-2 bg-jewel-gold text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 flex items-center gap-2">
                        <Truck size={16} />
                        Update Shipping
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                        <MessageSquare size={16} />
                        Send Notification
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center gap-2 ml-auto">
                        <AlertCircle size={16} />
                        Report Issue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1 to {Math.min(10, filteredOrders.length)} of {filteredOrders.length} results
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-jewel-gold text-white rounded-lg text-sm hover:bg-amber-600 transition-colors duration-200">
              1
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
              2
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;