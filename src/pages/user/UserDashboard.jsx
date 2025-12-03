import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Settings,
  Heart,
  Bell,
  Shield,
  Download,
  Eye,
  MessageSquare,
  Star,
  Gem,
  Crown,
  Calendar,
  DollarSign,
  ChevronRight,
  ShoppingBag,
  Award,
  Sparkles,
  TrendingUp,
  RefreshCw,
  FileText,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'requests', 'wishlist', 'settings'
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    newsletter: true,
    notifications: true
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Sparkles size={18} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'requests', label: 'Custom Requests', icon: <Gem size={18} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const statusOptions = [
    { value: 'Pending', label: 'Pending', color: 'yellow', icon: Clock },
    { value: 'Processing', label: 'Processing', color: 'blue', icon: RefreshCw },
    { value: 'Shipped', label: 'Shipped', color: 'purple', icon: Truck },
    { value: 'Delivered', label: 'Delivered', color: 'green', icon: CheckCircle },
    { value: 'Cancelled', label: 'Cancelled', color: 'red', icon: Clock },
  ];

  const requestStatusOptions = [
    { value: 'Submitted', label: 'Submitted', color: 'blue' },
    { value: 'Under Review', label: 'Under Review', color: 'yellow' },
    { value: 'Quote Sent', label: 'Quote Sent', color: 'orange' },
    { value: 'Approved', label: 'Approved', color: 'green' },
    { value: 'In Production', label: 'In Production', color: 'purple' },
    { value: 'Completed', label: 'Completed', color: 'emerald' },
  ];

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [ordersRes, requestsRes] = await Promise.all([
        axios.get(`/orders/find/${user.id}`),
        axios.get(`/custom/user/${user.id}`)
      ]);
      setOrders(ordersRes.data);
      setCustomRequests(requestsRes.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/users/${user.id}`, profileData);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getRequestStatusColor = (status) => {
    const statusObj = requestStatusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
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

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    pendingOrders: orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length,
    customRequests: customRequests.length
  };

  const recentOrders = orders.slice(0, 3);
  const recentRequests = customRequests.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-jewel-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's your activity summary.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              {/* Profile Summary */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-jewel-gold to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield size={12} className="text-green-500" />
                      <span className="text-xs text-gray-500">Verified Member</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-jewel-gold/10 to-amber-500/10 text-jewel-gold border-l-4 border-jewel-gold'
                        : 'text-gray-600 hover:text-jewel-gold hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className={`${activeTab === tab.id ? 'text-jewel-gold' : 'text-gray-400'}`}>
                      {tab.icon}
                    </span>
                    <span className="font-medium">{tab.label}</span>
                    <ChevronRight size={16} className="ml-auto opacity-50" />
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="p-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Member Since</span>
                    <span className="text-sm font-medium">{formatDate(user?.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Loyalty Points</span>
                    <span className="text-sm font-medium text-jewel-gold">1,250 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Account Level</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Crown size={14} className="text-jewel-gold" />
                      Gold Member
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 border border-jewel-gold/20 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare size={16} className="text-jewel-gold" />
                Need Help?
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Our customer support team is here to assist you with any questions.
              </p>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 text-sm font-medium">
                Contact Support
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Stats Bar */}
              {activeTab === 'overview' && (
                <div className="p-6 border-b border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { 
                        label: 'Total Orders', 
                        value: stats.totalOrders, 
                        icon: ShoppingBag,
                        color: 'blue'
                      },
                      { 
                        label: 'Total Spent', 
                        value: formatCurrency(stats.totalSpent), 
                        icon: DollarSign,
                        color: 'green'
                      },
                      { 
                        label: 'Pending Orders', 
                        value: stats.pendingOrders, 
                        icon: Clock,
                        color: 'yellow'
                      },
                      { 
                        label: 'Custom Requests', 
                        value: stats.customRequests, 
                        icon: Gem,
                        color: 'purple'
                      },
                    ].map((stat, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-bold mt-2">{stat.value}</p>
                          </div>
                          <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                            <stat.icon className={`text-${stat.color}-600`} size={24} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Recent Orders */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Package size={20} />
                          Recent Orders
                        </h2>
                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="text-jewel-gold hover:text-amber-600 text-sm font-medium flex items-center gap-1"
                        >
                          View All
                          <ChevronRight size={16} />
                        </button>
                      </div>
                      
                      {recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                          <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
                          <button 
                            onClick={() => navigate('/collections')}
                            className="px-4 py-2 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300"
                          >
                            Browse Collections
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentOrders.map((order) => {
                            const StatusIcon = statusOptions.find(s => s.value === order.status)?.icon || Clock;
                            const statusColor = getStatusColor(order.status);
                            
                            return (
                              <div key={order._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-jewel-gold transition-colors duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${statusColor.split('-')[0]}-100`}>
                                        <StatusIcon className={`text-${statusColor.split('-')[1]}-600`} size={20} />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-gray-900">
                                          Order #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                                        </h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                          <Calendar size={14} />
                                          {formatDate(order.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col sm:items-end gap-2">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}`}>
                                      {order.status}
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                      {formatCurrency(order.totalAmount)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    {order.items?.length || 0} items
                                  </span>
                                  <button 
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                    className="text-jewel-gold hover:text-amber-600 text-sm font-medium flex items-center gap-1"
                                  >
                                    <Eye size={14} />
                                    View Details
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Recent Custom Requests */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Gem size={20} />
                          Recent Custom Requests
                        </h2>
                        <button 
                          onClick={() => setActiveTab('requests')}
                          className="text-jewel-gold hover:text-amber-600 text-sm font-medium flex items-center gap-1"
                        >
                          View All
                          <ChevronRight size={16} />
                        </button>
                      </div>
                      
                      {recentRequests.length === 0 ? (
                        <div className="text-center py-8">
                          <Gem className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom requests</h3>
                          <p className="text-gray-500 mb-4">Design your dream piece with our artisans</p>
                          <button 
                            onClick={() => navigate('/custom-request')}
                            className="px-4 py-2 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300"
                          >
                            Create Custom Design
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentRequests.map((request) => {
                            const statusColor = getRequestStatusColor(request.status);
                            
                            return (
                              <div key={request._id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                  <div>
                                    <h4 className="font-bold text-gray-900">
                                      Custom {request.jewelryType || 'Jewelry'} Design
                                    </h4>
                                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                      {request.description?.substring(0, 100)}...
                                    </p>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                                    {request.status}
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <DollarSign size={14} />
                                    Budget: {request.budgetRange || 'Not specified'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    Submitted: {formatDate(request.createdAt)}
                                  </span>
                                </div>
                                
                                {request.adminComments && (
                                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-l-4 border-amber-500">
                                    <p className="text-sm text-gray-700 font-medium mb-1">Latest Update:</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {request.adminComments}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                        <button 
                          onClick={() => navigate('/collections')}
                          className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 font-medium"
                        >
                          Browse Collections
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            {/* Order Header */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  Order #{order._id?.slice(-8).toUpperCase()}
                                </h3>
                                <div className="flex flex-wrap gap-3 mt-2">
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDate(order.createdAt)}
                                  </span>
                                  <span className="text-sm text-gray-600">•</span>
                                  <span className="text-sm text-gray-600">
                                    {order.items?.length || 0} items
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className={`px-4 py-2 rounded-full text-sm font-bold bg-${getStatusColor(order.status)}`}>
                                  {order.status}
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(order.totalAmount)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Total amount
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                              <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                              <div className="space-y-3">
                                {order.items?.slice(0, 3).map((item, index) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                    <img 
                                      src={item.image || 'https://via.placeholder.com/60x60?text=Jewelry'} 
                                      alt={item.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{item.name}</p>
                                      <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-gray-900">
                                        {formatCurrency(item.price || 0)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {order.items?.length > 3 && (
                                  <p className="text-sm text-gray-500 text-center">
                                    + {order.items.length - 3} more items
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Order Actions */}
                            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2 text-sm">
                                <Eye size={14} />
                                View Details
                              </button>
                              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2 text-sm">
                                <MessageSquare size={14} />
                                Contact Support
                              </button>
                              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2 text-sm ml-auto">
                                <Download size={14} />
                                Download Invoice
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'requests' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Design Requests</h2>
                    {customRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Gem className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No custom requests</h3>
                        <p className="text-gray-500 mb-6">Design your dream piece with our master artisans</p>
                        <button 
                          onClick={() => navigate('/custom-request')}
                          className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 font-medium"
                        >
                          Create Custom Design
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {customRequests.map((request) => (
                          <div key={request._id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-jewel-gold/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                                    <Gem className="text-jewel-gold" size={24} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                      {request.jewelryType || 'Custom Jewelry'} Design
                                    </h3>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                      <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Calendar size={14} />
                                        {formatDate(request.createdAt)}
                                      </span>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${getRequestStatusColor(request.status)}-100 text-${getRequestStatusColor(request.status)}-800`}>
                                        {request.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Description</p>
                                    <p className="text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                                      {request.description}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <p className="text-sm text-gray-500 mb-1">Budget Range</p>
                                      <p className="font-medium flex items-center gap-1">
                                        <DollarSign size={14} />
                                        {request.budgetRange || 'Not specified'}
                                      </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <p className="text-sm text-gray-500 mb-1">Metal Type</p>
                                      <p className="font-medium">{request.metalType || 'Not specified'}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <p className="text-sm text-gray-500 mb-1">Gemstone</p>
                                      <p className="font-medium">{request.gemstoneType || 'Not specified'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {request.adminComments && (
                              <div className="mb-6">
                                <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                  <MessageSquare size={14} />
                                  Designer's Response
                                </p>
                                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                                  <p className="text-gray-700">{request.adminComments}</p>
                                  {request.quoteAmount && (
                                    <div className="mt-3 flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-900">Quote Amount:</span>
                                      <span className="text-lg font-bold text-gray-900">
                                        {formatCurrency(request.quoteAmount)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                              <button className="px-4 py-2 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 flex items-center gap-2 text-sm">
                                <MessageSquare size={14} />
                                Send Message
                              </button>
                              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2 text-sm">
                                <FileText size={14} />
                                View Quote
                              </button>
                              {request.referenceImage && (
                                <a 
                                  href={request.referenceImage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2 text-sm ml-auto"
                                >
                                  <Eye size={14} />
                                  View Reference Image
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                      {/* Personal Information */}
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <User size={20} />
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name *
                            </label>
                            <input 
                              type="text" 
                              value={profileData.name}
                              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <input 
                              type="email" 
                              value={profileData.email}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                type="tel" 
                                value={profileData.phone}
                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+1 (555) 123-4567"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Shipping Address
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <textarea 
                                value={profileData.address}
                                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                rows="2"
                                placeholder="Enter your shipping address"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preferences */}
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <Bell size={20} />
                          Preferences
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Email Newsletter</p>
                              <p className="text-sm text-gray-500">Receive updates on new collections & offers</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={profileData.newsletter}
                                onChange={(e) => setProfileData(prev => ({ ...prev, newsletter: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-jewel-gold transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-5"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Order Notifications</p>
                              <p className="text-sm text-gray-500">Get notified about order status updates</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={profileData.notifications}
                                onChange={(e) => setProfileData(prev => ({ ...prev, notifications: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-jewel-gold transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-5"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Security */}
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <Shield size={20} />
                          Security
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <input 
                              type="password" 
                              placeholder="Enter current password"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                              </label>
                              <input 
                                type="password" 
                                placeholder="Enter new password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                              </label>
                              <input 
                                type="password" 
                                placeholder="Confirm new password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-4">
                        <button 
                          type="button"
                          onClick={handleLogout}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-medium"
                        >
                          Logout
                        </button>
                        <button 
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 font-medium"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;