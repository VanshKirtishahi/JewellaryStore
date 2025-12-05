import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  MoreVertical,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Award,
  Crown,
  Gem,
  Eye,
  MessageSquare,
  CreditCard,
  ExternalLink,
  BarChart3,
  Zap,
  Shield,
  Star,
  Target,
  ArrowUpRight,
  Filter
} from 'lucide-react';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCustomer, setHoveredCustomer] = useState(null);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [statsVisible, setStatsVisible] = useState([false, false, false, false]);
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    averageSpent: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, ordersRes] = await Promise.all([
          axios.get('/users?role=user'),
          axios.get('/orders')
        ]);
        
        setCustomers(usersRes.data);
        setOrders(ordersRes.data);
        
        // Calculate stats after data loads
        calculateStats(usersRes.data, ordersRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
        setTimeout(() => setStatsVisible([true, false, false, false]), 100);
        setTimeout(() => setStatsVisible([true, true, false, false]), 200);
        setTimeout(() => setStatsVisible([true, true, true, false]), 300);
        setTimeout(() => setStatsVisible([true, true, true, true]), 400);
      }
    };
    fetchData();
  }, []);

  const calculateStats = (customersData, ordersData) => {
    const total = customersData.length;
    
    // Calculate active customers (made at least one order)
    const active = customersData.filter(customer => 
      ordersData.some(order => 
        (order.userId?._id === customer._id) || (order.userId === customer._id)
      )
    ).length;

    // Calculate average spent
    const totalSpent = customersData.reduce((sum, customer) => {
      const customerOrders = ordersData.filter(order => 
        (order.userId?._id === customer._id) || (order.userId === customer._id)
      );
      return sum + customerOrders.reduce((orderSum, order) => orderSum + (order.totalAmount || 0), 0);
    }, 0);
    
    const averageSpent = total > 0 ? totalSpent / total : 0;

    // Calculate new customers this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = customersData.filter(customer => {
      const joinDate = new Date(customer.createdAt);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;

    setStats({
      total,
      active,
      averageSpent,
      newThisMonth
    });
  };

  const getCustomerStats = (userId) => {
    const customerOrders = orders.filter(order => 
      (order.userId?._id === userId) || (order.userId === userId)
    );
    
    const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
    
    // Calculate customer loyalty tier
    let loyaltyTier = 'Bronze';
    if (totalSpent > 500000) loyaltyTier = 'Platinum';
    else if (totalSpent > 100000) loyaltyTier = 'Gold';
    else if (totalSpent > 50000) loyaltyTier = 'Silver';

    return {
      orderCount: customerOrders.length,
      totalSpent,
      averageOrderValue,
      loyaltyTier
    };
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLoyaltyColor = (tier) => {
    switch (tier) {
      case 'Platinum': return 'from-purple-500 to-pink-500';
      case 'Gold': return 'from-amber-500 to-yellow-500';
      case 'Silver': return 'from-gray-400 to-gray-600';
      default: return 'from-amber-700 to-orange-500';
    }
  };

  const statsCards = [
    { 
      label: 'Total Customers', 
      value: stats.total, 
      subtext: `+${stats.newThisMonth} new this month`,
      icon: Users,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      iconColor: 'text-white',
      trend: 'up'
    },
    { 
      label: 'Active Customers', 
      value: stats.active, 
      subtext: `${((stats.active / stats.total) * 100 || 0).toFixed(1)}% of total`,
      icon: Shield,
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
      iconColor: 'text-white',
      trend: 'up'
    },
    { 
      label: 'Avg. Spend', 
      value: formatCurrency(stats.averageSpent), 
      subtext: 'Average per customer',
      icon: Crown,
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-500',
      iconColor: 'text-white',
      trend: 'up'
    },
    { 
      label: 'Top Tier', 
      value: 'VIP',
      subtext: 'Platinum customers',
      icon: Award,
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      iconColor: 'text-white',
      trend: 'stable'
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-jewel-gold/20 border-t-jewel-gold rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-8 h-8 text-jewel-gold animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-700">Loading Customers</p>
          <p className="text-sm text-gray-500">Fetching customer data and analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-jewel-gold/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-30 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-200/50 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">Customer Management</h1>
                <Sparkles className="w-6 h-6 text-jewel-gold animate-pulse" />
              </div>
              <p className="text-gray-600 lg:text-lg">View and manage your premium jewelry customers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name, email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none w-full sm:w-64 transition-all duration-300 focus:shadow-lg"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <Filter className="w-4 h-4" />
                Filters
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
                  <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
                    stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-700'
                  }`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <BarChart3 className="w-4 h-4" />
                    )}
                    <span className="text-sm font-bold">Live</span>
                  </div>
                  <span className="text-xs text-gray-500">Real-time data</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  stat.trend === 'up' ? 'bg-emerald-500' : 'bg-gray-400'
                } animate-pulse`}></div>
              </div>
            </div>

            {/* Bottom Gradient Bar */}
            <div className={`h-1 ${stat.iconBg} transition-all duration-500 group-hover:h-1.5`}></div>
          </div>
        ))}
      </div>

      {/* Customers Table */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-jewel-gold" />
                  Customer Directory
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-medium">
                  <span className="text-gray-900 font-bold">{stats.active}</span> active customers
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] lg:min-w-0">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Loyalty Tier</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Joined Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Orders</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Total Spent</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Avg. Order</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-16">
                      <div className="relative inline-block mb-6">
                        <Users className="w-16 h-16 text-gray-300 group-hover:text-jewel-gold/50 transition-all duration-500" />
                        <Search className="absolute -top-2 -right-2 w-8 h-8 text-jewel-gold animate-pulse" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No Customers Found</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-6">
                        {searchQuery 
                          ? 'Try adjusting your search query' 
                          : 'No customers registered yet.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => {
                    const stats = getCustomerStats(customer._id);
                    const loyaltyColor = getLoyaltyColor(stats.loyaltyTier);
                    
                    return (
                      <tr 
                        key={customer._id} 
                        className={`
                          hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all duration-300
                          ${hoveredCustomer === customer._id ? 'ring-1 ring-jewel-gold/10' : ''}
                        `}
                        onMouseEnter={() => setHoveredCustomer(customer._id)}
                        onMouseLeave={() => setHoveredCustomer(null)}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {customer.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              {stats.loyaltyTier === 'Platinum' && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-jewel-gold to-amber-500 rounded-full flex items-center justify-center">
                                  <Crown className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{customer.name}</p>
                              <p className="text-xs text-gray-500 font-mono mt-1">
                                ID: {customer._id.slice(-6).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 truncate max-w-[180px]">{customer.email}</span>
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-br ${loyaltyColor} shadow-md`}>
                            {stats.loyaltyTier === 'Platinum' && <Crown className="w-3 h-3" />}
                            {stats.loyaltyTier === 'Gold' && <Star className="w-3 h-3" />}
                            {stats.loyaltyTier === 'Silver' && <Award className="w-3 h-3" />}
                            {stats.loyaltyTier === 'Bronze' && <Gem className="w-3 h-3" />}
                            {stats.loyaltyTier}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                              <Calendar className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{formatDate(customer.createdAt)}</div>
                              <div className="text-xs text-gray-500">Member since</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                              <ShoppingBag className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-xl">{stats.orderCount}</div>
                              <div className="text-xs text-gray-500">orders</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
                              <IndianRupee className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-xl">
                                {formatCurrency(stats.totalSpent).replace('₹', '')}
                              </div>
                              <div className="text-xs text-gray-500">total spent</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                              <BarChart3 className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {formatCurrency(stats.averageOrderValue).replace('₹', '')}
                              </div>
                              <div className="text-xs text-gray-500">per order</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setExpandedCustomer(expandedCustomer === customer._id ? null : customer._id)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                              title="Send Message"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-jewel-gold hover:bg-amber-50 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                              title="View Orders"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                              title="More Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredCustomers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50/50 to-white">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-900">{filteredCustomers.length}</span> of <span className="font-bold text-gray-900">{customers.length}</span> customers
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-jewel-gold to-amber-500"></div>
                    <span className="text-gray-700">Platinum Tier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500"></div>
                    <span className="text-gray-700">Gold Tier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600"></div>
                    <span className="text-gray-700">Silver Tier</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Customer Details */}
      {expandedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full animate-slideDown shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-bold text-gray-900">Customer Details</h3>
              <button
                onClick={() => setExpandedCustomer(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 rotate-90" />
              </button>
            </div>
            {/* Details would go here */}
          </div>
        </div>
      )}

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
        
        /* Custom scrollbar */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #d4af37, #fbbf24);
          border-radius: 3px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #b8941f, #f59e0b);
        }
      `}</style>
    </div>
  );
};

export default CustomerManagement;