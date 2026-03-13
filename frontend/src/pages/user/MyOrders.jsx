import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import {
  ShoppingBag,
  Calendar,
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  Filter,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); // Added to cross-reference missing item details
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Real stats calculated from fetched data
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    totalWeight: 0
  });

  // --- FETCH WHOLE DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        setLoading(true);

        const userId = user?._id || user?.id;
        
        // Fetch orders AND products simultaneously to cross-reference weights
        const [ordersRes, productsRes] = await Promise.all([
          axios.get(`/orders/find/${userId}`),
          axios.get('/products?limit=1000') 
        ]);

        const sortedOrders = (ordersRes?.data || []).sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt));
        
        setOrders(sortedOrders);
        setProducts(productsRes?.data?.products || productsRes?.data || []);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // --- HELPER TO POPULATE MISSING DATA ---
  const getPopulatedItem = (item) => {
    // Attempt to find the product ID regardless of how the backend formats it
    const idToFind = typeof item?.productId === 'string' ? item.productId : item?.productId?._id;
    
    // Find the original product from the catalog to extract missing data like weight
    const foundProduct = products?.find(p => p?._id === idToFind) || {};
    
    // Safely extract weight, ensuring it converts to a number
    const itemWeight = Number(item?.weight || item?.productId?.weight || foundProduct?.weight || 0);
    
    return {
      title: item?.name || item?.title || item?.productId?.title || foundProduct?.title || 'Product Item',
      weight: itemWeight,
      image: item?.image || item?.productId?.images?.[0] || foundProduct?.images?.[0] || 'https://via.placeholder.com/80',
      quantity: Number(item?.quantity || 1),
      size: item?.size || item?.productId?.size || foundProduct?.size
    };
  };

  const getOrderWeight = (order) => {
    const items = order?.items || order?.products || [];
    return items.reduce((sum, item) => {
      const popItem = getPopulatedItem(item);
      return sum + (popItem.weight * popItem.quantity);
    }, 0);
  };

  // --- UPDATE STATS WHEN DATA LOADS ---
  useEffect(() => {
    if (orders?.length >= 0) {
      const statsData = {
        total: orders.length,
        delivered: orders.filter(o => o?.status === 'Delivered').length,
        pending: orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o?.status)).length,
        totalWeight: orders.reduce((acc, curr) => acc + getOrderWeight(curr), 0)
      };
      setStats(statsData);
    }
  }, [orders, products]); // Re-run if products load after orders


  // --- UTILS ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={16} />;
      case 'Shipped': return <Truck size={16} />;
      case 'Processing': return <Package size={16} />;
      case 'Cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Filter Logic
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order?._id?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesFilter = statusFilter === 'all' || order?.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">

      {/* 1. Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm">Manage and track your recent purchases</p>
        </div>

        {/* Stat Cards */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-xl font-bold text-gray-900">{stats?.total}</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <ShoppingBag size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-xl font-bold text-gray-900">{stats?.pending}</p>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Clock size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-xl font-bold text-gray-900">{stats?.delivered}</p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <CheckCircle size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Weight</p>
            <p className="text-xl font-bold text-gray-900">{stats?.totalWeight > 0 ? `${stats.totalWeight}g` : '0g'}</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Package size={20} />
          </div>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Order ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-gray-500" />
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* 3. Orders List */}
      <div className="space-y-4">
        {filteredOrders?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or start shopping.</p>
            <Link to="/collections" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Browse Collections
            </Link>
          </div>
        ) : (
          filteredOrders?.map((order) => {
            const orderTotalWeight = getOrderWeight(order);
            const items = order?.items || order?.products || [];

            return (
              <div key={order?._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* Order Summary Header */}
                <div className="p-6 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center cursor-pointer" onClick={() => toggleOrderExpansion(order?._id)}>
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-900">#{order?._id?.slice(-6).toUpperCase()}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(order?.status)}`}>
                        {getStatusIcon(order?.status)}
                        <span className="hidden sm:inline">{order?.status}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {formatDate(order?.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={14} /> {items.length} Items
                      </span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0">
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{orderTotalWeight > 0 ? `${orderTotalWeight}g` : 'N/A'}</p>
                    <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
                      {expandedOrder === order?._id ? 'Hide Details' : 'View Details'}
                      {expandedOrder === order?._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order?._id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6 animate-slideDown">

                    {/* Items List */}
                    <h4 className="font-semibold text-gray-900 mb-4">Items Ordered</h4>
                    <div className="space-y-3 mb-6">
                      {items.map((item, idx) => {
                        const popItem = getPopulatedItem(item);
                        const totalItemWeight = popItem.weight * popItem.quantity;

                        return (
                          <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                            <img
                              src={popItem.image}
                              alt={popItem.title}
                              className="w-16 h-16 object-cover rounded-md bg-gray-100 border border-gray-100"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{popItem.title}</p>
                              <p className="text-sm text-gray-500">Qty: {popItem.quantity} {popItem.size && `• Size: ${popItem.size}`}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{totalItemWeight > 0 ? `${totalItemWeight}g` : 'N/A'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shipping Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          Shipping Address
                        </h4>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                          {order?.shippingAddress || 'No address provided'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle size={16} className="text-gray-500" />
                          Order Status Details
                        </h4>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                          Payment Method: {order?.paymentMethod || 'Online'} <br />
                          Payment Status: <span className="text-green-600 font-medium">Paid</span>
                        </p>
                      </div>
                    </div>

                    {/* Tracking Button */}
                    <div className="mt-6 flex justify-end">
                      <Link
                        to={`/user/track-order/${order?._id}`}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                      >
                        <ExternalLink size={16} />
                        Track Shipment
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        
        @keyframes slideDown {
          from { opacity: 0; height: 0; }
          to { opacity: 1; height: auto; }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default MyOrders;