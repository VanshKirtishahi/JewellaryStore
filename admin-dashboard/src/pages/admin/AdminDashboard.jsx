import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Eye,
  RefreshCw,
  ExternalLink,
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Data State
  const [stats, setStats] = useState({
    revenue: 0, revenueChange: 0, isRevenueUp: true,
    orders: 0, ordersChange: 0, isOrdersUp: true,
    products: 0, productsChange: 0, isProductsUp: true,
    customers: 0, customersChange: 0, isCustomersUp: true
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- Helper Functions ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) { logout(); navigate('/login'); return; }

      const token = localStorage.getItem('token');
      if (!token) { logout(); navigate('/login'); return; }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, ordersRes, usersRes] = await Promise.all([
        axios.get('/products', config),
        axios.get('/orders', config),
        axios.get('/users?role=user', config)
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const users = usersRes.data || [];

      // --- Calculations (Simplified for brevity) ---
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Calculate changes (Mock logic for now, you can refine this based on real month data)
      const revenueChange = 12.5; 
      const ordersChange = 8.2;
      const productsChange = 5.0;
      const customersChange = 15.3;

      setStats({
        revenue: totalRevenue, revenueChange, isRevenueUp: true,
        orders: orders.length, ordersChange, isOrdersUp: true,
        products: products.length, productsChange, isProductsUp: true,
        customers: users.length, customersChange, isCustomersUp: true,
      });

      // Sort Recent Orders
      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 5));

    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle View Details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-amber-100 text-amber-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'blue', change: `${stats.revenueChange}%`, isUp: stats.isRevenueUp },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'emerald', change: `${stats.ordersChange}%`, isUp: stats.isOrdersUp },
    { label: 'Total Products', value: stats.products, icon: Package, color: 'amber', change: `${stats.productsChange}%`, isUp: stats.isProductsUp },
    { label: 'Total Customers', value: stats.customers, icon: Users, color: 'purple', change: `${stats.customersChange}%`, isUp: stats.isCustomersUp },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jewel-gold"></div></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-500 mb-4">{error}</p><button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Retry</button></div>;

  return (
    <div className="space-y-8 animate-fadeIn p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of store performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <RefreshCw size={16} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = { blue: 'text-blue-600 bg-blue-50', emerald: 'text-emerald-600 bg-emerald-50', amber: 'text-amber-600 bg-amber-50', purple: 'text-purple-600 bg-purple-50' };
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colors[stat.color]}`}><Icon size={24} /></div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.change}
                </div>
              </div>
              <div><p className="text-sm font-medium text-gray-500">{stat.label}</p><h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3></div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1">View All <ExternalLink size={14} /></Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500"><ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p>No orders found yet.</p></td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order._id?.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{order.userId?.name?.[0]?.toUpperCase() || 'U'}</div>
                        <div><p className="text-sm font-medium text-gray-900">{order.userId?.name || 'Guest'}</p><p className="text-xs text-gray-500">{order.userId?.email || 'N/A'}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500"><div className="flex items-center gap-2"><Clock size={14} />{formatDate(order.createdAt)}</div></td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ORDER DETAILS MODAL --- */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                  <p className="text-sm text-gray-500 font-mono">#{selectedOrder._id}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Users size={16} /> Customer Info</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2"><Users size={14} /> {selectedOrder.userId?.name || 'Guest'}</p>
                    <p className="flex items-center gap-2"><Mail size={14} /> {selectedOrder.userId?.email || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Clock size={14} /> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} /> Delivery Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> {selectedOrder.shippingAddress || 'No address provided'}</p>
                    <p className="flex items-center gap-2"><Phone size={14} /> {selectedOrder.contactNumber || 'N/A'}</p>
                    <p className="flex items-center gap-2"><CreditCard size={14} /> {selectedOrder.paymentMethod || 'Online Payment'}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <h4 className="font-semibold text-gray-900 mb-4">Order Items ({selectedOrder.items?.length || 0})</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <img 
                      src={item.image || 'https://via.placeholder.com/80'} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-lg bg-gray-200"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} {item.size && `• Size: ${item.size}`}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;