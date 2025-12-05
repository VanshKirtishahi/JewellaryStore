import { useState, useEffect, useMemo } from 'react';
import axios from '../../api/axios';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  TrendingDown,
  Activity,
  Sparkles,
  Crown,
  Gem,
  Zap,
  Target,
  Award,
  LineChart,
  Globe,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  PieChart,
  ShoppingBag,
  Eye,
  ExternalLink,
  Target as TargetIcon,
  Layers,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart,
  ArrowUp,
  ArrowDown,
  Shield,
  CheckCircle
} from 'lucide-react';

const Analytics = () => {
  // Data State
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [reportType, setReportType] = useState('monthly'); // daily, monthly, yearly, custom
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0].slice(0, 7)); // Default: Current Month
  const [endDate, setEndDate] = useState('');

  // UI State
  const [statsVisible, setStatsVisible] = useState([false, false, false, false]);
  const [chartDataVisible, setChartDataVisible] = useState(false);
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
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
      animateStats();
    }
  };

  const animateStats = () => {
    setStatsVisible([false, false, false, false]);
    setTimeout(() => setStatsVisible([true, false, false, false]), 100);
    setTimeout(() => setStatsVisible([true, true, false, false]), 200);
    setTimeout(() => setStatsVisible([true, true, true, false]), 300);
    setTimeout(() => setStatsVisible([true, true, true, true]), 400);
    setTimeout(() => setChartDataVisible(true), 500);
  };

  // --- CORE ANALYTICS ENGINE ---
  const analytics = useMemo(() => {
    if (!orders.length) return null;

    // 1. Filter Data based on Selected Range
    let filteredOrders = [];
    let filteredUsers = [];
    let previousOrders = [];

    const start = new Date(startDate);
    let end = new Date(startDate);
    
    if (reportType === 'daily') {
      end.setDate(start.getDate() + 1);
    } else if (reportType === 'monthly') {
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else if (reportType === 'yearly') {
      start.setMonth(0, 1);
      end = new Date(start.getFullYear(), 11, 31);
    } else if (reportType === 'custom' && endDate) {
      end = new Date(endDate);
      end.setDate(end.getDate() + 1);
    }

    filteredOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    });

    filteredUsers = users.filter(u => {
      const d = new Date(u.createdAt);
      return d >= start && d <= end;
    });

    const prevStart = new Date(start);
    const prevEnd = new Date(end);
    
    if (reportType === 'monthly') prevStart.setMonth(prevStart.getMonth() - 1);
    else if (reportType === 'yearly') prevStart.setFullYear(prevStart.getFullYear() - 1);
    else prevStart.setDate(prevStart.getDate() - 1);

    previousOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevStart && d < start;
    });

    // 2. Calculate Key Metrics
    const revenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const prevRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    const revenueGrowth = prevRevenue === 0 ? (revenue > 0 ? 100 : 0) : ((revenue - prevRevenue) / prevRevenue) * 100;
    const usersCount = filteredUsers.length;
    const avgOrderValue = filteredOrders.length > 0 ? revenue / filteredOrders.length : 0;

    // 3. Real-time calculations
    // Top selling products (from real product data)
    const productSales = {};
    filteredOrders.forEach(order => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach(product => {
          const productId = product.productId || product._id;
          const productObj = products.find(p => p._id === productId);
          if (productObj) {
            productSales[productId] = {
              ...productObj,
              revenue: (productSales[productId]?.revenue || 0) + (product.price * product.quantity),
              quantity: (productSales[productId]?.quantity || 0) + product.quantity
            };
          }
        });
      }
    });

    // Top selling products sorted by revenue
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 4. Generate Chart Data
    const chartData = [];
    
    if (reportType === 'yearly') {
      for (let i = 0; i < 12; i++) {
        const monthName = new Date(start.getFullYear(), i).toLocaleString('default', { month: 'short' });
        const monthRev = filteredOrders
          .filter(o => new Date(o.createdAt).getMonth() === i)
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        chartData.push({ label: monthName, value: monthRev });
      }
    } else {
      const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const step = Math.max(1, Math.ceil(daysInPeriod / 30));
      
      for (let i = 0; i < daysInPeriod; i += step) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
        const dailyRev = filteredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getDate() === d.getDate() && 
                   orderDate.getMonth() === d.getMonth() &&
                   orderDate.getFullYear() === d.getFullYear();
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        chartData.push({ label: dateStr, value: dailyRev });
      }
    }

    // 5. Additional metrics
    const completedOrders = filteredOrders.filter(o => o.status === 'Delivered').length;
    const cancellationRate = filteredOrders.length > 0 ? 
      (filteredOrders.filter(o => o.status === 'Cancelled').length / filteredOrders.length * 100) : 0;
    
    const peakHourData = {};
    filteredOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      peakHourData[hour] = (peakHourData[hour] || 0) + 1;
    });
    const peakHour = Object.entries(peakHourData).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      revenue,
      users: usersCount,
      revenueGrowth: Math.abs(revenueGrowth).toFixed(1),
      avgOrderValue,
      isGrowthPositive: revenueGrowth >= 0,
      chartData,
      totalOrders: filteredOrders.length,
      filteredOrders,
      topProducts,
      completedOrders,
      cancellationRate: cancellationRate.toFixed(1),
      peakHour,
      salesByCategory: {}, // You can implement category-wise sales if data available
      previousPeriodComparison: {
        revenue: prevRevenue,
        orders: previousOrders.length
      }
    };

  }, [orders, users, products, reportType, startDate, endDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // CSV Export Function
  const downloadReport = async () => {
    if (!analytics || !analytics.filteredOrders.length) {
      alert("No data to export for selected period");
      return;
    }

    try {
      setExporting(true);
      const headers = ["Order ID", "Date", "Customer ID", "Customer Name", "Status", "Payment Status", "Amount", "Items Count"];
      const rows = analytics.filteredOrders.map(o => [
        o._id,
        new Date(o.createdAt).toLocaleDateString('en-IN'),
        o.userId?._id || o.userId || 'N/A',
        o.userId?.name || 'Guest',
        o.status || 'Pending',
        o.paymentStatus || 'Pending',
        o.totalAmount || 0,
        o.products?.length || 0
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `jewelry_analytics_${startDate}_${reportType}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const statsCards = analytics ? [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(analytics.revenue), 
      icon: Crown,
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
      iconColor: 'text-white',
      subtext: 'Selected Period',
      change: analytics.isGrowthPositive ? `+${analytics.revenueGrowth}%` : `-${analytics.revenueGrowth}%`,
      isPositive: analytics.isGrowthPositive,
      previousValue: formatCurrency(analytics.previousPeriodComparison.revenue)
    },
    { 
      label: 'New Customers', 
      value: analytics.users, 
      icon: Users,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      iconColor: 'text-white',
      subtext: 'Joined in period',
      change: analytics.users > 0 ? 'Growing' : 'No growth',
      isPositive: analytics.users > 0,
      trend: analytics.users > 0 ? 'up' : 'stable'
    },
    { 
      label: 'Total Orders', 
      value: analytics.totalOrders, 
      icon: ShoppingBag,
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      iconColor: 'text-white',
      subtext: 'Processed',
      change: `${analytics.completedOrders} delivered`,
      isPositive: true,
      trend: 'up'
    },
    { 
      label: 'Avg. Order Value', 
      value: formatCurrency(analytics.avgOrderValue), 
      icon: Award,
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-500',
      iconColor: 'text-white',
      subtext: 'Per transaction',
      change: 'Premium range',
      isPositive: analytics.avgOrderValue > 5000,
      trend: analytics.avgOrderValue > analytics.previousPeriodComparison.revenue / Math.max(analytics.previousPeriodComparison.orders, 1) ? 'up' : 'down'
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-jewel-gold/20 border-t-jewel-gold rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-jewel-gold animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-700">Loading Analytics Dashboard</p>
          <p className="text-sm text-gray-500">Crunching real-time data from your store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Report Controls */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-jewel-gold/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-30 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-200/50 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">Store Analytics Dashboard</h1>
                <Sparkles className="w-6 h-6 text-jewel-gold animate-pulse" />
              </div>
              <p className="text-gray-600">Real-time insights powered by your store data</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Report Type Selector */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100/50 p-2 rounded-xl border border-gray-200">
                <Filter className="w-4 h-4 text-gray-500" />
                <select 
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value);
                    const now = new Date();
                    if(e.target.value === 'monthly') setStartDate(now.toISOString().slice(0, 7));
                    if(e.target.value === 'daily') setStartDate(now.toISOString().slice(0, 10));
                    if(e.target.value === 'yearly') setStartDate(now.getFullYear().toString());
                  }}
                  className="px-3 py-2 border-none bg-transparent font-medium text-gray-700 outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="daily">Daily Report</option>
                  <option value="monthly">Monthly Report</option>
                  <option value="yearly">Yearly Report</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Date Range Picker */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                {reportType === 'daily' && (
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="outline-none text-sm bg-transparent"
                    max={new Date().toISOString().split('T')[0]}
                  />
                )}
                {reportType === 'monthly' && (
                  <input 
                    type="month" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="outline-none text-sm bg-transparent"
                    max={new Date().toISOString().slice(0, 7)}
                  />
                )}
                {reportType === 'yearly' && (
                  <input 
                    type="number" 
                    min="2020" 
                    max={new Date().getFullYear()}
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="outline-none text-sm w-20 bg-transparent text-center"
                  />
                )}
                {reportType === 'custom' && (
                  <>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="outline-none text-sm bg-transparent"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="outline-none text-sm bg-transparent"
                    />
                  </>
                )}
              </div>

              <button 
                onClick={fetchData}
                className="p-2 text-gray-600 hover:text-jewel-gold hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 group"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              </button>

              <button 
                onClick={downloadReport}
                disabled={exporting || !analytics?.filteredOrders.length}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95
                  ${exporting || !analytics?.filteredOrders.length 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-jewel-gold to-amber-500 text-white hover:shadow-lg hover:shadow-amber-500/25'
                  }
                `}
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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
                    stat.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : stat.trend === 'down' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                    <span className="text-sm font-bold">{stat.change}</span>
                  </div>
                  <span className="text-xs text-gray-500">vs previous</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  stat.isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                } animate-pulse`}></div>
              </div>
            </div>

            {/* Bottom Gradient Bar */}
            <div className={`h-1 ${stat.iconBg} transition-all duration-500 group-hover:h-1.5`}></div>
          </div>
        ))}
      </div>

      {/* Charts and Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-slideDown hover:shadow-2xl transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                    <LineChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Revenue Trend</h3>
                    <p className="text-sm text-gray-600">
                      {reportType === 'yearly' ? 'Monthly breakdown' : 
                       reportType === 'monthly' ? 'Daily performance' : 
                       'Period overview'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                    <span className="text-gray-700">Current Period</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"></div>
                    <span className="text-gray-700">Previous Period</span>
                  </div>
                </div>
              </div>
              
              {/* Interactive Chart */}
              <div className="h-64">
                {analytics?.chartData.length > 0 ? (
                  <div className="h-full flex flex-col">
                    {/* Y-axis labels */}
                    <div className="flex-1 flex">
                      <div className="w-12 pr-2 flex flex-col justify-between text-xs text-gray-500">
                        {[4, 3, 2, 1, 0].map((value) => (
                          <div key={value}>{formatCurrency((analytics.revenue / 4) * value)}</div>
                        ))}
                      </div>
                      
                      {/* Chart Area */}
                      <div className="flex-1 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-px bg-gray-200"></div>
                          ))}
                        </div>
                        
                        {/* Bars */}
                        <div className="h-full flex items-end justify-between gap-1 px-2">
                          {analytics.chartData.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center group relative">
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-2 px-3 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-xl">
                                <div className="font-bold">{item.label}</div>
                                <div className="text-emerald-300">{formatCurrency(item.value)}</div>
                              </div>
                              
                              {/* Bar */}
                              <div 
                                className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500 to-green-500 rounded-t-lg transition-all duration-300 hover:from-emerald-600 hover:to-green-600 cursor-pointer group-hover:scale-105"
                                style={{ 
                                  height: `${Math.max(5, (item.value / (Math.max(...analytics.chartData.map(d => d.value)) || 1)) * 100)}%`,
                                  minHeight: '4px'
                                }}
                              >
                                {/* Shimmer effect */}
                                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></div>
                              </div>
                              
                              {/* Label */}
                              <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">No sales data for this period</p>
                    <p className="text-xs">Try selecting a different time range</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-orange-500/5 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-slideDown hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Top Products</h3>
                <p className="text-sm text-gray-600">Best sellers by revenue</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {analytics?.topProducts.length > 0 ? (
                analytics.topProducts.map((product, index) => (
                  <div 
                    key={product._id} 
                    className="group/item p-3 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 rounded-xl border border-amber-100 hover:border-amber-200 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="font-medium text-gray-900 truncate max-w-[120px]">
                          {product.title || 'Unnamed Product'}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-amber-700">
                        {formatCurrency(product.revenue)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{product.quantity} units sold</span>
                      <span className="text-emerald-600 font-medium">₹{product.price}/unit</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Gem className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No product sales in this period</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Performance Metrics */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-sky-500/5 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-slideDown hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <TargetIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Performance Metrics</h3>
                <p className="text-sm text-gray-600">Key operational indicators</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                  <div className="text-xs text-gray-500 mb-1">Completion Rate</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {analytics?.totalOrders ? 
                      `${((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)}%` : 
                      '0%'}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">
                    {analytics?.completedOrders} of {analytics?.totalOrders} orders
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                  <div className="text-xs text-gray-500 mb-1">Cancellation Rate</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {analytics?.cancellationRate}%
                  </div>
                  <div className="text-xs text-amber-600 mt-1">Needs attention</div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500">Peak Sales Hour</div>
                  <Clock className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {analytics?.peakHour === 'N/A' ? 'No data' : `${analytics?.peakHour}:00`}
                </div>
                <div className="text-xs text-purple-600 mt-1">Most active time for orders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-rose-500/5 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-slideDown hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Quick Actions</h3>
                <p className="text-sm text-gray-600">Take action on insights</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={downloadReport}
                disabled={exporting || !analytics?.filteredOrders.length}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-xl border border-emerald-100 transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
              >
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Download className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-gray-900">Export Full Report</div>
                  <div className="text-xs text-gray-500">CSV with all order details</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
              </button>
              
              <button 
                onClick={fetchData}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl border border-blue-100 transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <RefreshCw className="w-4 h-4 text-blue-600 group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-gray-900">Refresh Data</div>
                  <div className="text-xs text-gray-500">Update with latest sales</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </button>
              
              <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 text-center">
                <div className="text-xs text-gray-500 mb-1">Data freshness</div>
                <div className="text-sm font-medium text-gray-900">
                  Updated just now
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500/5 via-gray-600/5 to-gray-700/5 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-slideDown hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Data Overview</h3>
                <p className="text-sm text-gray-600">Real-time statistics</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Total Orders in System</div>
                <div className="font-bold text-gray-900">{orders.length}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Registered Customers</div>
                <div className="font-bold text-gray-900">{users.length}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Available Products</div>
                <div className="font-bold text-gray-900">{products.length}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Report Period</div>
                <div className="font-bold text-gray-900 capitalize">{reportType}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Showing data from {startDate} 
                {endDate ? ` to ${endDate}` : reportType === 'yearly' ? ' (Full Year)' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

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
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
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
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Analytics;