import { useState, useEffect, useContext, useRef } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Package, CheckCircle, Clock, Search, RefreshCw,
  User, MapPin, Calendar, Crown, Award, ShoppingBag,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  XCircle, Plus, Minus, X, Trash2, Image as ImageIcon,
  Truck, Mail, Phone, DollarSign
} from 'lucide-react';

const OrderManagement = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [customerNames, setCustomerNames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Dropdown States
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [nameDropdownSearch, setNameDropdownSearch] = useState('');
  const dropdownRef = useRef(null);

  const [newOrder, setNewOrder] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    address: '',
    products: []
  });

  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, completed: 0 });

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', border: 'border-l-yellow-500', badge: 'bg-yellow-200 text-yellow-800', icon: Clock },
    { value: 'Processing', label: 'Processing', color: 'bg-blue-100 text-blue-800', border: 'border-l-blue-500', badge: 'bg-blue-200 text-blue-800', icon: RefreshCw },
    { value: 'Shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800', border: 'border-l-purple-500', badge: 'bg-purple-200 text-purple-800', icon: Truck },
    { value: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', border: 'border-l-green-500', badge: 'bg-green-200 text-green-800', icon: CheckCircle },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', border: 'border-l-red-500', badge: 'bg-red-200 text-red-800', icon: XCircle },
  ];

  const fetchStats = async () => {
    try {
      const res = await axios.get('/orders?limit=5000');
      const allOrders = res?.data?.orders || res?.data || [];
      const revenue = allOrders?.reduce((sum, order) => sum + (order?.totalAmount || 0), 0) || 0;
      
      const names = new Set();
      allOrders?.forEach(o => {
        if (o?.userId?.name) names.add(o.userId.name);
        if (o?.guestDetails?.name) names.add(o.guestDetails.name);
      });
      setCustomerNames(Array.from(names).filter(Boolean).sort());

      setStats({
        total: res?.data?.totalOrders || allOrders?.length || 0,
        revenue: revenue,
        pending: allOrders?.filter(o => ['Pending', 'Processing'].includes(o?.status))?.length || 0,
        completed: allOrders?.filter(o => o?.status === 'Delivered')?.length || 0
      });
    } catch (err) {
      console.error("Failed to fetch accurate stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchOrders(), 500);
    return () => clearTimeout(timeoutId);
  }, [page, statusFilter, searchQuery, startDate, endDate]);

  useEffect(() => {
    if (showCreateModal) fetchProducts();
  }, [showCreateModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNameDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: searchQuery ? 1000 : 10 
      };
      
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get(`/orders`, { params });
      
      if (res?.data?.orders) {
        setOrders(res?.data?.orders);
        setTotalPages(res?.data?.totalPages || 1);
      } else if (Array.isArray(res?.data)) {
        setOrders(res?.data);
        setTotalPages(Math.ceil(res?.data.length / 10) || 1);
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (err?.response?.status === 401) { 
        logout(); 
        navigate('/login'); 
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products?limit=1000');
      setAvailableProducts(res?.data?.products || res?.data || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/orders/${id}`, { status: newStatus });
      fetchOrders();
      fetchStats(); 
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const getStatusColor = (status) => {
    const opt = statusOptions.find(o => o?.value === status);
    return opt ? opt?.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusBorder = (status) => {
    const opt = statusOptions.find(o => o?.value === status);
    return opt ? opt?.border : 'border-l-gray-300';
  };

  const getStatusBadge = (status) => {
    const opt = statusOptions.find(o => o?.value === status);
    return opt ? opt?.badge : 'bg-gray-200 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const opt = statusOptions.find(o => o?.value === status);
    return opt?.icon || Clock;
  };

  const getProductImage = (product) => {
    if (product?.images && product?.images?.length > 0) return product?.images[0];
    return product?.image || product?.img || null;
  };

  const toggleProductInOrder = (product) => {
    const existingIndex = newOrder?.products?.findIndex(p => p?.productId === product?._id);
    if (existingIndex >= 0) removeLineItem(existingIndex);
    else {
      setNewOrder(prev => ({
        ...prev,
        products: [...prev.products, {
          ...product, 
          productId: product?._id,
          title: product?.title,
          description: product?.description, 
          price: product?.price || 0, // Set initial default price for this order
          img: getProductImage(product),
          quantity: 1
        }]
      }));
    }
  };

  const updateQuantity = (productId, delta) => {
    setNewOrder(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p?.productId === productId) {
          const newQty = Math.max(1, p.quantity + delta);
          return { ...p, quantity: newQty };
        }
        return p;
      })
    }));
  };

  const updatePrice = (productId, newPrice) => {
    setNewOrder(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p?.productId === productId) {
          // Allow override of price ONLY for this current order payload
          return { ...p, price: newPrice >= 0 ? newPrice : 0 };
        }
        return p;
      })
    }));
  };

  const removeLineItem = (index) => {
    setNewOrder(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
  };

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (newOrder?.products?.length === 0) return alert("Please select at least one product");

    const totalAmount = newOrder?.products?.reduce((acc, item) => acc + ((item?.price || 0) * (item?.quantity || 1)), 0);

    const orderPayload = {
      userId: null,
      guestDetails: {
        name: newOrder?.guestName,
        email: newOrder?.guestEmail,
        phone: newOrder?.guestPhone
      },
      shippingAddress: newOrder?.address,
      products: newOrder?.products?.map(p => ({
        productId: p?.productId,
        quantity: p?.quantity,
        price: p?.price // Use the custom adjusted price
      })),
      totalAmount: totalAmount,
      status: 'Pending'
    };

    try {
      await axios.post('/orders', orderPayload);
      setShowCreateModal(false);
      setNewOrder({ guestName: '', guestEmail: '', guestPhone: '', address: '', products: [] });
      fetchOrders();
      fetchStats();
      alert("Order Created Successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create order.");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const displayedOrders = orders?.filter(order => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    const customerName = (order?.userId?.name || order?.guestDetails?.name || '').toLowerCase();
    const orderId = (order?._id || '').toLowerCase();
    return customerName.includes(q) || orderId.includes(q) || customerName === q;
  });

  const filteredProducts = availableProducts?.filter(p =>
    p?.title?.toLowerCase().includes(productSearch?.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 relative bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600" size={24} />
            Order Management
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Manage orders, track shipments, and process returns</p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-200 text-sm font-medium"
          >
            <Plus size={18} /> Create Order
          </button>
          <button 
            onClick={fetchOrders} 
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Orders', value: stats?.total, icon: ShoppingBag, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
          { label: 'Total Revenue', value: formatCurrency(stats?.revenue), icon: Crown, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
          { label: 'Pending', value: stats?.pending, icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
          { label: 'Completed', value: stats?.completed, icon: CheckCircle, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white p-4 md:p-6 rounded-xl border ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-gray-500 font-medium">{stat?.label}</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1 md:mt-2">{stat?.value}</h3>
              </div>
              <div className={`p-2.5 md:p-3 rounded-lg self-start md:self-auto ${stat.bg} ${stat.text}`}>
                {<stat.icon size={20} className="md:w-6 md:h-6" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto flex-1">
            <div className="relative w-full md:w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by ID or Name..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
              />
            </div>

            <div className="relative w-full md:w-64" ref={dropdownRef}>
              <div 
                className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowNameDropdown(!showNameDropdown)}
              >
                <span className="text-sm text-gray-700 truncate select-none flex items-center gap-2">
                  <User size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{searchQuery && customerNames.includes(searchQuery) ? searchQuery : 'Filter by Customer'}</span>
                </span>
                <ChevronDown size={16} className={`text-gray-500 flex-shrink-0 transition-transform ${showNameDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showNameDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search specific user..." 
                        className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        value={nameDropdownSearch}
                        onChange={(e) => setNameDropdownSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    <div 
                      className={`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                        !searchQuery || !customerNames.includes(searchQuery) 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => { setSearchQuery(''); setShowNameDropdown(false); setNameDropdownSearch(''); }}
                    >
                      <User size={14} />
                      All Customers
                    </div>
                    {customerNames
                      .filter(name => name.toLowerCase().includes(nameDropdownSearch.toLowerCase()))
                      .map((name, idx) => (
                      <div 
                        key={idx}
                        className={`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                          searchQuery === name 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => { setSearchQuery(name); setShowNameDropdown(false); setNameDropdownSearch(''); }}
                      >
                        <User size={14} className="text-gray-400" />
                        {name}
                      </div>
                    ))}
                    {customerNames.filter(name => name.toLowerCase().includes(nameDropdownSearch.toLowerCase())).length === 0 && (
                      <div className="px-3 py-4 text-sm text-center text-gray-500">No matching customers</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="w-full md:w-auto px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {statusOptions?.map(opt => (
                <option key={opt?.value} value={opt?.value}>{opt?.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <span className="text-gray-400 font-medium">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="w-full px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            {(searchQuery || statusFilter !== 'all' || startDate || endDate) && (
               <button
                 onClick={handleClearFilters}
                 className="flex justify-center items-center gap-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium border border-red-100"
               >
                 <XCircle size={16} /> Clear
               </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden z-0 relative">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading orders...</p>
          </div>
        ) : displayedOrders?.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 mt-2">No orders found matching your criteria</p>
          </div>
        ) : (
          <div>
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Order Details</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Products</div>
              <div className="col-span-2">Total & Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-gray-200">
              {displayedOrders?.map((order, index) => {
                const isGuest = !order?.userId;
                const customerName = order?.userId?.name || order?.guestDetails?.name || 'Unknown User';
                const customerEmail = order?.userId?.email || order?.guestDetails?.email || 'No Email';
                const customerPhone = order?.userId?.phone || order?.guestDetails?.phone || 'No Phone';
                const StatusIcon = getStatusIcon(order?.status);
                
                const rowBgColor = index % 2 === 0 ? 'bg-white' : 'bg-blue-50/20';
                
                return (
                  <div key={order?._id}>
                    <div className={`${rowBgColor} hover:bg-blue-50/60 transition-colors border-l-4 ${getStatusBorder(order?.status)}`}>
                      
                      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                        <div className="col-span-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getStatusColor(order?.status)}`}>
                              <StatusIcon size={18} />
                            </div>
                            <div>
                              <div className="font-mono font-bold text-gray-900">
                                #{order?._id?.slice(-8).toUpperCase()}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Calendar size={12} />
                                {formatDate(order?.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-3">
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            {customerName}
                            {isGuest && (
                              <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                Guest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Mail size={12} className="flex-shrink-0" />
                            <span className="truncate">{customerEmail}</span>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="text-sm text-gray-700 flex items-center gap-2">
                            <Package size={14} className="text-gray-400" />
                            <span className="font-medium">{order?.products?.length}</span> items
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="text-sm font-bold text-gray-900 mb-1">
                            {formatCurrency(order?.totalAmount)}
                          </div>
                          <select 
                            value={order?.status} 
                            onChange={(e) => handleStatusUpdate(order?._id, e.target.value)}
                            className={`px-2 py-1 rounded-md text-xs font-semibold border-0 outline-none cursor-pointer w-full max-w-[120px] ${getStatusBadge(order?.status)}`}
                          >
                            {statusOptions?.filter(s => s?.value !== 'all')?.map(s => (
                              <option key={s?.value} value={s?.value} className="bg-white text-gray-800">
                                {s?.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setExpandedOrder(expandedOrder === order?._id ? null : order?._id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${expandedOrder === order?._id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                          >
                            {expandedOrder === order?._id ? 'Hide Details' : 'View Details'}
                            {expandedOrder === order?._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="lg:hidden p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg self-start ${getStatusColor(order?.status)}`}>
                              <StatusIcon size={16} />
                            </div>
                            <div>
                              <div className="font-mono font-bold text-gray-900 text-sm">
                                #{order?._id?.slice(-8).toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {formatDate(order?.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{formatCurrency(order?.totalAmount)}</div>
                            <div className="text-xs text-gray-500">{order?.products?.length} items</div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded border border-gray-100 mb-3 shadow-sm">
                          <div className="font-semibold text-gray-900 text-sm flex items-center justify-between">
                            <span>{customerName}</span>
                            {isGuest && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded uppercase">Guest</span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 break-all">{customerEmail}</div>
                          {customerPhone && <div className="text-xs text-gray-500 mt-0.5">{customerPhone}</div>}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <select 
                            value={order?.status} 
                            onChange={(e) => handleStatusUpdate(order?._id, e.target.value)}
                            className={`flex-1 px-2 py-2 rounded-md text-xs font-semibold border-0 outline-none ${getStatusBadge(order?.status)}`}
                          >
                            {statusOptions?.filter(s => s?.value !== 'all')?.map(s => (
                              <option key={s?.value} value={s?.value} className="bg-white text-gray-800">{s?.label}</option>
                            ))}
                          </select>
                          
                          <button 
                            onClick={() => setExpandedOrder(expandedOrder === order?._id ? null : order?._id)}
                            className={`p-2 rounded-lg transition-colors border ${expandedOrder === order?._id ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                            {expandedOrder === order?._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedOrder === order?._id && (
                      <div className="bg-gray-50 px-4 md:px-6 py-5 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          <div className="lg:col-span-2">
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <ShoppingBag size={16} className="text-blue-600" /> Products Purchased
                            </h4>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                              <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Qty</th>
                                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Price</th>
                                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {order?.products?.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                          <div className="font-medium text-gray-900 line-clamp-2">
                                            {item?.productId?.title || item?.title || 'Unknown Product'}
                                          </div>
                                          {item?.category && <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{item.category}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium text-gray-700">{item?.quantity}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item?.price)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                                          {formatCurrency((item?.price || 0) * (item?.quantity || 1))}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-gray-50 border-t border-gray-200">
                                    <tr>
                                      <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-600">Order Total:</td>
                                      <td className="px-4 py-3 text-right font-bold text-blue-700 text-lg">{formatCurrency(order?.totalAmount)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              
                              <div className="sm:hidden divide-y divide-gray-100">
                                {order?.products?.map((item, idx) => (
                                  <div key={idx} className="p-3">
                                    <div className="font-medium text-gray-900 text-sm mb-2">{item?.productId?.title || item?.title || 'Product'}</div>
                                    <div className="flex justify-between items-center text-xs text-gray-600">
                                      <span>{item?.quantity} × {formatCurrency(item?.price)}</span>
                                      <span className="font-bold text-gray-900 text-sm">{formatCurrency((item?.price || 0) * (item?.quantity || 1))}</span>
                                    </div>
                                  </div>
                                ))}
                                <div className="p-3 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                                  <span className="font-semibold text-gray-600 text-sm">Total:</span>
                                  <span className="font-bold text-blue-700">{formatCurrency(order?.totalAmount)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <MapPin size={16} className="text-blue-600" />
                                Shipping Address
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
                                {order?.shippingAddress || 'No address provided during checkout.'}
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && displayedOrders?.length > 0 && (
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-white">
            <div className="text-sm text-gray-600 text-center md:text-left">
              Showing page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)} 
                className="flex-1 md:flex-none flex justify-center items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700 shadow-sm"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)} 
                className="flex-1 md:flex-none flex justify-center items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700 shadow-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm md:p-4">
          <div className="bg-white md:rounded-xl shadow-2xl w-full max-w-6xl h-full md:h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 md:p-5 border-b border-gray-200 flex justify-between items-center bg-white z-20 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-blue-600" size={20} />
                Create Custom Order
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Product Selection Side */}
              <div className="w-full md:w-[50%] flex flex-col border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 h-[45vh] md:h-full">
                <div className="p-3 md:p-4 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search available products..." 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={productSearch} 
                      onChange={(e) => setProductSearch(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 md:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                    {filteredProducts?.map(product => {
                      const inCart = newOrder?.products?.find(p => p?.productId === product?._id);
                      const imgUrl = getProductImage(product);
                      return (
                        <div key={product?._id} className={`bg-white rounded-xl border transition-all flex flex-col overflow-hidden ${inCart ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-200 shadow-sm hover:border-gray-300'}`}>
                          <div className="aspect-square bg-gray-100 relative group border-b border-gray-100">
                            {imgUrl ? (
                              <img src={imgUrl} alt={product?.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon size={32} /></div>
                            )}
                            {inCart && (
                              <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                                {inCart?.quantity}
                              </div>
                            )}
                          </div>
                          <div className="p-3 flex flex-col flex-1">
                            <h4 className="font-bold text-gray-900 text-sm line-clamp-1" title={product?.title}>{product?.title}</h4>
                            
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {product?.category && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{product.category}</span>}
                              {product?.metal && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium border border-amber-100">{product.metal}</span>}
                            </div>

                            <div className="mt-2 mb-3 flex items-center justify-between">
                              <span className="text-gray-900 font-bold text-sm">{formatCurrency(product?.price)}</span>
                              {product?.stock !== undefined && <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Stock: {product.stock}</span>}
                            </div>
                            
                            <div className="mt-auto">
                              {inCart ? (
                                <div className="flex items-center justify-center text-xs font-semibold text-blue-600 bg-blue-50 py-2 rounded-lg border border-blue-200">
                                  Added to Order
                                </div>
                              ) : (
                                <button type="button" onClick={() => toggleProductInOrder(product)} className="w-full py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                                  Add to Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {filteredProducts?.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="mx-auto text-gray-300" size={48} />
                      <p className="text-gray-500 mt-2 text-sm">No products available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary Side */}
              <div className="w-full md:w-[50%] flex flex-col bg-white h-[55vh] md:h-full border-t md:border-t-0 border-gray-200">
                <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6">
                  
                  {/* Guest Info Form */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User size={14} className="text-blue-600" /> Customer Information
                    </h3>
                    <div className="space-y-3">
                      <input required type="text" placeholder="Full Name *" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" value={newOrder?.guestName} onChange={e => setNewOrder({ ...newOrder, guestName: e.target.value })} />
                      <div className="sm:grid-cols-2 gap-3">
                        <input required type="text" placeholder="Phone *" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" value={newOrder?.guestPhone} onChange={e => setNewOrder({ ...newOrder, guestPhone: e.target.value })} />
                      </div>
                      <textarea required placeholder="Complete Shipping Address *" rows="2" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none" value={newOrder?.address} onChange={e => setNewOrder({ ...newOrder, address: e.target.value })} />
                    </div>
                  </div>

                  {/* Order Items Summary with Full Details */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="flex items-center gap-2"><ShoppingBag size={14} className="text-blue-600" /> Order Items ({newOrder?.products?.length})</span>
                    </h3>
                    
                    {newOrder?.products?.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <ShoppingBag className="mx-auto text-gray-300 mb-2" size={24} />
                        <p className="text-sm font-medium text-gray-600">Cart is empty</p>
                        <p className="text-xs text-gray-500 mt-1">Select products from the left to add them</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {newOrder?.products?.map((p, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors overflow-hidden">
                            
                            {/* Product Header & Info */}
                            <div className="p-3 flex gap-3">
                              {p?.img ? (
                                <img src={p?.img} alt={p?.title} className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                              ) : (
                                <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0">
                                  <ImageIcon size={20} className="text-gray-300" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="font-bold text-gray-900 text-sm line-clamp-2 pr-2" title={p?.title}>{p?.title}</p>
                                  <button type="button" onClick={() => removeLineItem(idx)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-1.5 rounded-md transition-colors flex-shrink-0">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p?.description}</p>
                                
                                {/* Detailed Badges */}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {p?.category && <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">Category: {p.category}</span>}
                                  {p?.metal && <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">Metal: {p.metal}</span>}
                                  {p?.gemstone && <span className="text-[10px] font-medium bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100">Stone: {p.gemstone}</span>}
                                  {p?.purity && <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">Purity: {p.purity}</span>}
                                  {p?.weight && <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">Weight: {p.weight}</span>}
                                  {p?.size && <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">Size: {p.size}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Editing Controls: Quantity & Price */}
                            <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              
                              <div className="flex items-center gap-3">
                                {/* Quantity Controller */}
                                <div className="flex items-center bg-white border border-gray-300 rounded shadow-sm">
                                  <button type="button" onClick={() => updateQuantity(p?.productId, -1)} className="px-2 py-1.5 hover:bg-gray-100 text-gray-600 transition-colors"><Minus size={12}/></button>
                                  <span className="w-8 text-center text-xs font-bold text-gray-900">{p?.quantity}</span>
                                  <button type="button" onClick={() => updateQuantity(p?.productId, 1)} className="px-2 py-1.5 hover:bg-gray-100 text-gray-600 transition-colors"><Plus size={12}/></button>
                                </div>

                                <span className="text-gray-400 text-xs">×</span>

                                {/* Editable Price / Unit */}
                                <div className="flex items-center border border-gray-300 rounded bg-white px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm transition-all">
                                  <span className="text-gray-500 text-xs font-semibold">₹</span>
                                  <input
                                    type="number" min="0"
                                    className="w-16 text-xs outline-none bg-transparent ml-1 font-bold text-gray-900"
                                    value={p?.price}
                                    onChange={(e) => updatePrice(p?.productId, Number(e.target.value))}
                                    title="Edit price per unit for this order"
                                  />
                                </div>
                              </div>

                              <div className="text-right flex items-center justify-between sm:block">
                                <span className="text-xs text-gray-500 sm:hidden">Item Total:</span>
                                <span className="font-bold text-gray-900 text-sm">{formatCurrency((p?.price || 0) * (p?.quantity || 1))}</span>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sticky Footer for Total & Actions */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-gray-600 font-medium text-sm">Total Amount</span>
                    <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                      {formatCurrency(newOrder?.products?.reduce((acc, item) => acc + ((item?.price || 0) * (item?.quantity || 1)), 0))}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-colors text-sm">Cancel</button>
                    <button type="submit" disabled={newOrder?.products?.length === 0} className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Confirm Order</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;