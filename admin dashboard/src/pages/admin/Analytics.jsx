import { useState, useEffect, useMemo, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  TrendingDown,
  Crown,
  Download,
  Filter,
  RefreshCw,
  ShoppingBag,
  Target,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon
} from 'lucide-react';

const Analytics = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Data State
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [reportType, setReportType] = useState('monthly'); // daily, monthly, yearly
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 7)); // Default: Current Month

  // Export State
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        axios.get('/orders'),
        axios.get('/users?role=user'),
        axios.get('/products')
      ]);
      setOrders(ordersRes.data || []);
      setUsers(usersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- ANALYTICS ENGINE ---
  const analytics = useMemo(() => {
    if (!orders.length && !loading) return null;

    // 1. Determine Date Range
    const start = new Date(startDate);
    let end = new Date(startDate);
    
    if (reportType === 'daily') {
      end.setDate(start.getDate() + 1);
    } else if (reportType === 'monthly') {
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else if (reportType === 'yearly') {
      start.setMonth(0, 1);
      end = new Date(start.getFullYear(), 11, 31);
    }

    // 2. Filter Data
    const filteredOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    });

    const filteredUsers = users.filter(u => {
      const d = new Date(u.createdAt);
      return d >= start && d <= end;
    });

    // 3. Previous Period Calculation (for growth stats)
    const prevStart = new Date(start);
    if (reportType === 'monthly') prevStart.setMonth(prevStart.getMonth() - 1);
    else if (reportType === 'yearly') prevStart.setFullYear(prevStart.getFullYear() - 1);
    else prevStart.setDate(prevStart.getDate() - 1);

    const prevOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevStart && d < start;
    });

    // 4. Calculate Key Metrics
    const revenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const revenueGrowth = prevRevenue === 0 ? (revenue > 0 ? 100 : 0) : ((revenue - prevRevenue) / prevRevenue) * 100;
    
    const avgOrderValue = filteredOrders.length > 0 ? revenue / filteredOrders.length : 0;

    // 5. Top Products Logic
    const productSales = {};
    filteredOrders.forEach(order => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach(item => {
          // Handle both structure types if needed, usually it's item.productId or item._id
          const pId = item.productId || item._id; 
          // Find actual product details from products state
          const productDetail = products.find(p => p._id === pId) || { title: 'Unknown Product', price: item.price || 0 };
          
          if (!productSales[pId]) {
            productSales[pId] = { ...productDetail, revenue: 0, quantity: 0 };
          }
          productSales[pId].revenue += (item.price || 0) * (item.quantity || 1);
          productSales[pId].quantity += (item.quantity || 1);
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 6. Chart Data Generation
    const chartData = [];
    if (reportType === 'yearly') {
      for (let i = 0; i < 12; i++) {
        const monthName = new Date(start.getFullYear(), i).toLocaleString('default', { month: 'short' });
        const val = filteredOrders
          .filter(o => new Date(o.createdAt).getMonth() === i)
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        chartData.push({ label: monthName, value: val });
      }
    } else {
      // Daily/Monthly view - show days
      const days = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      // Simplify chart for performance (binning data if too many days)
      const step = reportType === 'daily' ? 1 : Math.ceil(days / 15); 
      
      for (let i = 1; i <= days; i += step) {
        const val = filteredOrders
          .filter(o => {
            const d = new Date(o.createdAt).getDate();
            return d >= i && d < i + step;
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        chartData.push({ label: `${i}`, value: val });
      }
    }

    return {
      revenue,
      users: filteredUsers.length,
      revenueGrowth: revenueGrowth.toFixed(1),
      avgOrderValue,
      chartData,
      totalOrders: filteredOrders.length,
      filteredOrders,
      topProducts,
      completedOrders: filteredOrders.filter(o => o.status === 'Delivered').length,
    };

  }, [orders, users, products, reportType, startDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const downloadReport = () => {
    if (!analytics || !analytics.filteredOrders.length) return alert("No data to export");
    setExporting(true);
    
    // Simple CSV generation
    const headers = ["Order ID", "Date", "Customer", "Amount", "Status"];
    const rows = analytics.filteredOrders.map(o => [
      o._id,
      new Date(o.createdAt).toLocaleDateString(),
      o.userId?.name || 'Guest',
      o.totalAmount,
      o.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `report_${startDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        <p className="mt-4 text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Performance metrics and insights.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <Filter size={16} className="text-gray-500" />
            <select 
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                // Reset date based on type
                const now = new Date();
                if(e.target.value === 'monthly') setStartDate(now.toISOString().slice(0, 7));
                if(e.target.value === 'daily') setStartDate(now.toISOString().slice(0, 10));
                if(e.target.value === 'yearly') setStartDate(now.getFullYear().toString());
              }}
              className="bg-transparent text-sm font-medium outline-none text-gray-700"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <CalendarIcon size={16} className="text-gray-500" />
            {reportType === 'daily' && (
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-sm outline-none" />
            )}
            {reportType === 'monthly' && (
              <input type="month" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-sm outline-none" />
            )}
            {reportType === 'yearly' && (
              <input type="number" min="2020" max="2030" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-sm outline-none w-16" />
            )}
          </div>

          <button onClick={fetchData} className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-600">
            <RefreshCw size={18} />
          </button>

          <button 
            onClick={downloadReport} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(analytics.revenue)}</h3>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <DollarSign size={20} />
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(analytics.revenueGrowth)}% vs last period
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalOrders}</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gray-500">
              {analytics.completedOrders} delivered successfully
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">New Customers</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{analytics.users}</h3>
              </div>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs font-medium text-purple-600">
              Active in this period
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg. Order Value</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(analytics.avgOrderValue)}</h3>
              </div>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Crown size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gray-500">
              Per transaction average
            </div>
          </div>
        </div>
      )}

      {/* Main Chart & Top Products */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <BarChart3 size={20} className="text-gray-500" /> Revenue Trend
              </h3>
            </div>
            
            <div className="h-64 flex items-end gap-2">
              {analytics.chartData.length > 0 ? (
                analytics.chartData.map((item, idx) => {
                  const maxVal = Math.max(...analytics.chartData.map(d => d.value)) || 1;
                  const height = (item.value / maxVal) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full flex items-end justify-center h-full">
                        <div 
                          className="w-full max-w-[30px] bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        ></div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                          {formatCurrency(item.value)}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2">{item.label}</span>
                    </div>
                  )
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No data available for this period
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Target size={20} className="text-gray-500" /> Top Products
            </h3>
            <div className="space-y-4">
              {analytics.topProducts.length > 0 ? (
                analytics.topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-900 flex-shrink-0">
                      {formatCurrency(p.revenue)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No sales recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;