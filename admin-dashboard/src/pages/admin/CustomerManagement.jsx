import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Mail, Phone, Calendar, MoreVertical, ShoppingBag, 
  TrendingUp, Crown, Eye, MessageSquare, BarChart3, Shield, Star, 
  Award, RefreshCw, Download, X, MapPin, Package, CheckCircle, Clock, Loader2
} from 'lucide-react';

const CustomerManagement = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Data State
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);

  // Stats state
  const [stats, setStats] = useState({
    total: 0, active: 0, averageSpent: 0, newThisMonth: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // We don't strictly need to manually get token if axios interceptor handles it, 
      // but keeping your logic safe here:
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [usersRes, ordersRes] = await Promise.all([
        axios.get('/users?role=user', config),
        axios.get('/orders', config)
      ]);
      
      const usersData = usersRes.data || [];
      const ordersData = ordersRes.data || [];

      setCustomers(usersData);
      setOrders(ordersData);
      calculateStats(usersData, ordersData);

    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customersData, ordersData) => {
    const total = customersData.length;
    
    // Active = placed at least one order
    const active = customersData.filter(customer => 
      ordersData.some(order => (order.userId?._id === customer._id) || (order.userId === customer._id))
    ).length;

    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageSpent = total > 0 ? totalRevenue / total : 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const newThisMonth = customersData.filter(customer => {
      const joinDate = new Date(customer.createdAt);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;

    setStats({ total, active, averageSpent, newThisMonth });
  };

  // --- ACTIONS ---
  const handleViewDetails = (customer) => {
    // Filter orders specifically for this customer
    const specificOrders = orders.filter(order => 
      (order.userId?._id === customer._id) || (order.userId === customer._id)
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setCustomerOrders(specificOrders);
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  // Helper Utils
  const getCustomerMetrics = (userId) => {
    const custOrders = orders.filter(order => (order.userId?._id === userId) || (order.userId === userId));
    const totalSpent = custOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    let loyaltyTier = 'Bronze';
    if (totalSpent > 100000) loyaltyTier = 'Platinum';
    else if (totalSpent > 50000) loyaltyTier = 'Gold';
    else if (totalSpent > 10000) loyaltyTier = 'Silver';

    return { orderCount: custOrders.length, totalSpent, loyaltyTier };
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getTierBadge = (tier) => {
    const styles = {
      'Platinum': 'bg-purple-100 text-purple-700 border-purple-200',
      'Gold': 'bg-amber-100 text-amber-700 border-amber-200',
      'Silver': 'bg-gray-100 text-gray-700 border-gray-200',
      'Bronze': 'bg-orange-50 text-orange-700 border-orange-100'
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[tier] || styles['Bronze']}`}>{tier}</span>;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
      <p className="text-gray-500">Loading directory...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Directory</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage your customer base.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Refresh"><RefreshCw size={20} /></button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"><Download size={16} /> Export</button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={stats.total} subtext={`+${stats.newThisMonth} this month`} icon={Users} color="blue" />
        <StatCard label="Active Buyers" value={stats.active} subtext="Placed >1 order" icon={Shield} color="emerald" />
        <StatCard label="Avg. Spend" value={formatCurrency(stats.averageSpent)} subtext="Per customer" icon={Crown} color="amber" />
        <StatCard label="Engagement" value="High" subtext="Retention metric" icon={BarChart3} color="purple" />
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500">Showing <strong>{filteredCustomers.length}</strong> customers</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Loyalty Tier</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No customers found matching your search.</td></tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const metrics = getCustomerMetrics(customer._id);
                  return (
                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                            {customer.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">ID: {customer._id.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-600"><Mail size={14} /> {customer.email}</div>
                          {/* SHOW PHONE HERE */}
                          {customer.phone ? (
                             <div className="flex items-center gap-2 text-gray-600"><Phone size={14} /> {customer.phone}</div>
                          ) : (
                             <div className="flex items-center gap-2 text-gray-400 text-xs italic">No phone</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600"><div className="flex items-center gap-2"><Calendar size={14} /> {formatDate(customer.createdAt)}</div></td>
                      <td className="px-6 py-4"><div className="flex items-center gap-2"><ShoppingBag size={14} className="text-gray-400" /><span className="font-medium">{metrics.orderCount}</span></div></td>
                      <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(metrics.totalSpent)}</td>
                      <td className="px-6 py-4">{getTierBadge(metrics.loyaltyTier)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewDetails(customer)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg hover:text-blue-600" title="View Details">
                            <Eye size={16} />
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
      </div>

      {/* --- CUSTOMER DETAILS MODAL --- */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                  {selectedCustomer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <Mail size={14} /> {selectedCustomer.email}
                    <span className="text-gray-300">|</span>
                    <Calendar size={14} /> Joined {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-blue-600 text-sm font-medium mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-blue-800">{formatCurrency(getCustomerMetrics(selectedCustomer._id).totalSpent)}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-emerald-600 text-sm font-medium mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-emerald-800">{customerOrders.length}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <p className="text-amber-600 text-sm font-medium mb-1">Loyalty Tier</p>
                  <p className="text-2xl font-bold text-amber-800">{getCustomerMetrics(selectedCustomer._id).loyaltyTier}</p>
                </div>
              </div>

              {/* Contact & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Users size={18}/> Contact Information</h4>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail size={16} className="text-gray-400" /> {selectedCustomer.email}
                    </div>
                    {/* MODAL PHONE DISPLAY */}
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone size={16} className="text-gray-400" /> {selectedCustomer.phone || <span className="text-gray-400 italic">No phone provided</span>}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={18}/> Default Address</h4>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                    {selectedCustomer.address || 'No address on file.'}
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package size={18}/> Recent Orders</h4>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customerOrders.length === 0 ? (
                        <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">No orders placed yet.</td></tr>
                      ) : (
                        customerOrders.map(order => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()}</td>
                            <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.totalAmount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ label, value, subtext, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600'
  };
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
      <div className={`p-3 rounded-lg ${colors[color]}`}><Icon size={24} /></div>
    </div>
  );
};

export default CustomerManagement;