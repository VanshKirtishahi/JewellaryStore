import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, CheckCircle, Clock, Search, RefreshCw, 
  User, MapPin, Calendar, Crown, Award, ShoppingBag, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, 
  XCircle, Plus, Minus, X, Trash2, Image as ImageIcon
} from 'lucide-react';

const OrderManagement = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Data State
  const [orders, setOrders] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');     
  
  // UI State
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false); 
  const [productSearch, setProductSearch] = useState(''); 

  // Create Order Form State
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
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'Shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchOrders(), 500); 
    return () => clearTimeout(timeoutId);
  }, [page, statusFilter, searchQuery, startDate, endDate]);

  useEffect(() => {
    if (showCreateModal) fetchProducts();
  }, [showCreateModal]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/orders`, {
        params: { page, limit: 10, status: statusFilter, search: searchQuery, startDate, endDate }
      });
      if (res.data.orders) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages);
        if (page === 1) calculateStats(res.data.orders, res.data.totalOrders);
      } else {
        setOrders(res.data);
      }
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setAvailableProducts(res.data.products || res.data || []); 
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const calculateStats = (currentOrders, totalCount) => {
    const revenue = currentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    setStats({
      total: totalCount || currentOrders.length,
      revenue: revenue, 
      pending: currentOrders.filter(o => ['Pending', 'Processing'].includes(o.status)).length,
      completed: currentOrders.filter(o => o.status === 'Delivered').length
    });
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/orders/${id}`, { status: newStatus });
      fetchOrders(); 
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // --- Helpers ---
  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
  });

  const getStatusColor = (status) => {
    const opt = statusOptions.find(o => o.value === status);
    return opt ? opt.color : 'bg-gray-100 text-gray-800';
  };

  // --- FIXED IMAGE HELPER ---
  const getProductImage = (product) => {
    // 1. Check for array 'images' (Schema definition)
    if (product.images && product.images.length > 0) return product.images[0];
    // 2. Check for string 'image' or 'img' (Fallbacks)
    return product.image || product.img || null;
  };

  // --- Modal Logic ---
  const toggleProductInOrder = (product) => {
    const existingIndex = newOrder.products.findIndex(p => p.productId === product._id);
    if (existingIndex >= 0) removeLineItem(existingIndex);
    else {
      setNewOrder(prev => ({
        ...prev,
        products: [...prev.products, { 
          productId: product._id, 
          title: product.title, 
          price: product.price, 
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
        if (p.productId === productId) {
          const newQty = Math.max(1, p.quantity + delta);
          return { ...p, quantity: newQty };
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
    if(newOrder.products.length === 0) return alert("Please select at least one product");

    const totalAmount = newOrder.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const orderPayload = {
      userId: null, 
      guestDetails: { 
        name: newOrder.guestName,
        email: newOrder.guestEmail,
        phone: newOrder.guestPhone
      },
      shippingAddress: newOrder.address, // Sends String now
      products: newOrder.products.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
        price: p.price
      })),
      totalAmount: totalAmount,
      status: 'Pending'
    };

    try {
      await axios.post('/orders', orderPayload);
      setShowCreateModal(false);
      setNewOrder({ guestName: '', guestEmail: '', guestPhone: '', address: '', products: [] });
      fetchOrders();
      alert("Order Created Successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create order.");
    }
  };

  const filteredProducts = availableProducts.filter(p => 
    p.title?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-4 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage orders, shipments, and returns.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus size={18} /> Create Order
          </button>
          <button onClick={fetchOrders} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><RefreshCw size={20} /></button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'blue' },
          { label: 'Revenue', value: formatCurrency(stats.revenue), icon: Crown, color: 'emerald' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Completed', value: stats.completed, icon: Award, color: 'purple' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>{<stat.icon size={24} />}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col xl:flex-row gap-4 justify-between items-center">
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search Order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <span className="text-gray-400">-</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            {(startDate || endDate) && <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-red-500 p-2"><XCircle size={18}/></button>}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-500">Loading orders...</div> : 
         orders.length === 0 ? <div className="p-12 text-center text-gray-500">No orders found.</div> : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => {
              // --- FIXED GUEST LOGIC ---
              const isGuest = !order.userId; // If userId is null, it's a guest
              
              const customerName = order.userId?.name || order.guestDetails?.name || 'Unknown User';
              const customerEmail = order.userId?.email || order.guestDetails?.email || 'No Email';
              const customerPhone = order.userId?.phone || order.guestDetails?.phone || 'No Phone';

              return (
                <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                          {isGuest && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Guest</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(order.createdAt)}</span>
                          <span className="flex items-center gap-1"><User size={14}/> {customerName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Items: {order.products?.length || 0}</div>
                        <div className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</div>
                      </div>
                      <button onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)} className="p-2 border rounded-lg hover:bg-gray-100 text-gray-600">
                        {expandedOrder === order._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {expandedOrder === order._id && (
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                      <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg">
                         <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><ShoppingBag size={16} /> Items</h4>
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                            <tr><th className="px-2 py-2">Product</th><th className="px-2 py-2">Qty</th><th className="px-2 py-2">Price</th></tr>
                          </thead>
                          <tbody>
                            {order.products?.map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-200">
                                <td className="px-2 py-2 font-medium">{item.productId?.title || item.title || 'Product'}</td>
                                <td className="px-2 py-2">{item.quantity}</td>
                                <td className="px-2 py-2">{formatCurrency(item.price)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><User size={16} /> {isGuest ? 'Guest Info' : 'Customer Info'}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Name:</span> {customerName}</p>
                            <p><span className="font-medium">Email:</span> {customerEmail}</p>
                            <p><span className="font-medium">Phone:</span> {customerPhone}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                           <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><MapPin size={16} /> Shipping</h4>
                           <p className="text-sm text-gray-600">{order.shippingAddress || 'N/A'}</p>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                          <label className="text-xs font-semibold text-gray-500 uppercase">Update Status</label>
                          <select value={order.status} onChange={(e) => handleStatusUpdate(order._id, e.target.value)} className="w-full mt-2 px-3 py-2 border rounded text-sm">
                            {statusOptions.filter(s => s.value !== 'all').map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 py-1 rounded border bg-white disabled:opacity-50"><ChevronLeft size={16} /> Prev</button>
          <span className="text-sm text-gray-600">Page <span className="font-bold">{page}</span> of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 py-1 rounded border bg-white disabled:opacity-50">Next <ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-900 p-1"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateOrderSubmit} className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-3/5 flex flex-col border-r border-gray-200 bg-gray-50 h-full">
                <div className="p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => {
                      const inCart = newOrder.products.find(p => p.productId === product._id);
                      // FIXED IMAGE LOGIC
                      const imgUrl = getProductImage(product);
                      return (
                        <div key={product._id} className={`bg-white rounded-lg border transition-all ${inCart ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden group">
                            {imgUrl ? (
                              <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon size={32}/></div>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-sm text-gray-900 truncate" title={product.title}>{product.title}</h4>
                            <p className="text-gray-500 text-xs mb-3">{formatCurrency(product.price)}</p>
                            {inCart ? (
                              <div className="flex items-center justify-between bg-blue-50 rounded-lg p-1">
                                <button type="button" onClick={() => updateQuantity(product._id, -1)} className="p-1 hover:bg-blue-100 rounded text-blue-600"><Minus size={14}/></button>
                                <span className="text-sm font-bold text-blue-700">{inCart.quantity}</span>
                                <button type="button" onClick={() => updateQuantity(product._id, 1)} className="p-1 hover:bg-blue-100 rounded text-blue-600"><Plus size={14}/></button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => toggleProductInOrder(product)} className="w-full py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors">Add to Order</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {filteredProducts.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No products found</div>}
                </div>
              </div>

              <div className="w-full md:w-2/5 flex flex-col bg-white h-full overflow-y-auto">
                <div className="p-6 space-y-6 flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Guest Details</h3>
                    <div className="space-y-3">
                      <input required type="text" placeholder="Guest Name" className="w-full p-2 border border-gray-300 rounded text-sm" value={newOrder.guestName} onChange={e => setNewOrder({...newOrder, guestName: e.target.value})} />
                      <input required type="email" placeholder="Email Address" className="w-full p-2 border border-gray-300 rounded text-sm" value={newOrder.guestEmail} onChange={e => setNewOrder({...newOrder, guestEmail: e.target.value})} />
                      <input required type="text" placeholder="Phone Number" className="w-full p-2 border border-gray-300 rounded text-sm" value={newOrder.guestPhone} onChange={e => setNewOrder({...newOrder, guestPhone: e.target.value})} />
                      <textarea required placeholder="Shipping Address" rows="2" className="w-full p-2 border border-gray-300 rounded text-sm" value={newOrder.address} onChange={e => setNewOrder({...newOrder, address: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Order Summary</h3>
                    {newOrder.products.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <ShoppingBag className="mx-auto text-gray-300 mb-2" size={24}/>
                        <p className="text-xs text-gray-500">No items selected</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {newOrder.products.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 line-clamp-1">{p.title}</p>
                              <p className="text-gray-500 text-xs">{p.quantity} x {formatCurrency(p.price)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">{formatCurrency(p.price * p.quantity)}</span>
                              <button type="button" onClick={() => removeLineItem(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(newOrder.products.reduce((acc, item) => acc + (item.price * item.quantity), 0))}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">Confirm Order</button>
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