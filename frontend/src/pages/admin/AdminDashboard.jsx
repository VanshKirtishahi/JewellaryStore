import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
    Clock,
    MoreVertical,
    ChevronRight,
    Eye,
    ExternalLink,
    Sparkles,
    BarChart3,
    RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        revenue: 0, revenueChange: 0, isRevenueUp: true,
        orders: 0, ordersChange: 0, isOrdersUp: true,
        products: 0, productsChange: 0, isProductsUp: true,
        customers: 0, customersChange: 0, isCustomersUp: true
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsVisible, setStatsVisible] = useState([false, false, false, false]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all data
                const [productsRes, ordersRes, usersRes] = await Promise.all([
                    axios.get('/products'),
                    axios.get('/orders'),
                    axios.get('/users?role=user')
                ]);

                const products = productsRes.data;
                const orders = ordersRes.data;
                const users = usersRes.data;

                // --- Helper: Filter Data by Month ---
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

                const filterByMonth = (data, dateField, month, year) => {
                    return data.filter(item => {
                        const d = new Date(item[dateField]);
                        return d.getMonth() === month && d.getFullYear() === year;
                    });
                };

                // --- Calculate Revenue ---
                const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

                const thisMonthOrders = filterByMonth(orders, 'createdAt', currentMonth, currentYear);
                const lastMonthOrders = filterByMonth(orders, 'createdAt', lastMonth, lastMonthYear);

                const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

                // Calculate Revenue Growth
                const revenueChange = lastMonthRevenue === 0 ? 100 : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

                // --- Calculate Orders Growth ---
                const ordersChange = lastMonthOrders.length === 0 ? 100 : ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;

                // --- Calculate Customers Growth ---
                const thisMonthUsers = filterByMonth(users, 'createdAt', currentMonth, currentYear);
                const lastMonthUsers = filterByMonth(users, 'createdAt', lastMonth, lastMonthYear);
                const customersChange = lastMonthUsers.length === 0 ? 100 : ((thisMonthUsers.length - lastMonthUsers.length) / lastMonthUsers.length) * 100;

                // --- Calculate Products Growth (New this month) ---
                const thisMonthProducts = filterByMonth(products, 'createdAt', currentMonth, currentYear);
                const lastMonthProducts = filterByMonth(products, 'createdAt', lastMonth, lastMonthYear);
                const productsChange = lastMonthProducts.length === 0 ? 100 : ((thisMonthProducts.length - lastMonthProducts.length) / lastMonthProducts.length) * 100;

                setStats({
                    revenue: totalRevenue,
                    revenueChange: Math.abs(revenueChange).toFixed(1),
                    isRevenueUp: revenueChange >= 0,

                    orders: orders.length,
                    ordersChange: Math.abs(ordersChange).toFixed(1),
                    isOrdersUp: ordersChange >= 0,

                    products: products.length,
                    productsChange: Math.abs(productsChange).toFixed(1),
                    isProductsUp: productsChange >= 0,

                    customers: users.length,
                    customersChange: Math.abs(customersChange).toFixed(1),
                    isCustomersUp: customersChange >= 0,
                });

                // Set Recent Orders (Top 5 newest)
                const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentOrders(sortedOrders.slice(0, 5));

            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
                // Animate stats cards in sequence
                setTimeout(() => {
                    setStatsVisible([true, false, false, false]);
                    setTimeout(() => setStatsVisible([true, true, false, false]), 150);
                    setTimeout(() => setStatsVisible([true, true, true, false]), 300);
                    setTimeout(() => setStatsVisible([true, true, true, true]), 450);
                }, 100);
            }
        };

        fetchData();
    }, []);

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

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const [productsRes, ordersRes, usersRes] = await Promise.all([
                axios.get('/products'),
                axios.get('/orders'),
                axios.get('/users?role=user')
            ]);

            const products = productsRes.data;
            const orders = ordersRes.data;
            const users = usersRes.data;

            // Calculate stats...
            const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            setStats(prev => ({ ...prev, revenue: totalRevenue, orders: orders.length, products: products.length, customers: users.length }));

            const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRecentOrders(sortedOrders.slice(0, 5));
        } catch (err) {
            console.error("Error refreshing data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-jewel-gold/20 border-t-jewel-gold rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-jewel-gold animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-gray-700">Loading Dashboard</p>
                    <p className="text-sm text-gray-500">Fetching latest store analytics...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Revenue',
            value: formatCurrency(stats.revenue),
            icon: DollarSign,
            gradient: 'from-emerald-400 to-green-500',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            change: `${stats.revenueChange}%`,
            isUp: stats.isRevenueUp
        },
        {
            label: 'Total Orders',
            value: stats.orders,
            icon: ShoppingBag,
            gradient: 'from-blue-400 to-cyan-500',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            change: `${stats.ordersChange}%`,
            isUp: stats.isOrdersUp
        },
        {
            label: 'Total Products',
            value: stats.products,
            icon: Package,
            gradient: 'from-amber-400 to-orange-500',
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
            change: `${stats.productsChange}%`,
            isUp: stats.isProductsUp
        },
        {
            label: 'Total Customers',
            value: stats.customers,
            icon: Users,
            gradient: 'from-purple-400 to-pink-500',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            change: `${stats.customersChange}%`,
            isUp: stats.isCustomersUp
        },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Page Header with Glowing Effect */}
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-jewel-gold/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-50 rounded-3xl"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-200/50 shadow-lg">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">Dashboard Overview</h1>
                                <Sparkles className="w-6 h-6 text-jewel-gold animate-pulse" />
                            </div>
                            <p className="text-gray-600 lg:text-lg">Real-time store performance and recent activity.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <Link
                                to="/admin/analytics"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-jewel-gold to-amber-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Full Analytics
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid with Staggered Animation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
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
                                {[...Array(5)].map((_, i) => (
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
                                    </div>
                                    <div className={`
              p-3 rounded-xl ${stat.bgColor} shadow-md
              transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
            `}>
                                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2.5 py-1.5 rounded-lg ${stat.isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'} flex items-center gap-1.5`}>
                                            {stat.isUp ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                            <span className="text-sm font-bold">{stat.change}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">vs last month</span>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${stat.isUp ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                                </div>
                            </div>

                            {/* Bottom Gradient Bar */}
                            <div className={`h-1 bg-gradient-to-r ${stat.gradient} transition-all duration-500 group-hover:h-1.5`}></div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders Section */}
            <div className="relative group">
                {/* Background Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    {/* Header with Animated Border */}
                    <div className="relative px-5 lg:px-8 py-5 lg:py-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-serif font-bold text-xl lg:text-2xl text-gray-900">Recent Orders</h3>
                                    <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-xs font-bold rounded-full">
                                        LIVE
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">Latest transactions from your store</p>
                            </div>
                            <Link
                                to="/admin/orders"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 group/link"
                            >
                                <span>View All</span>
                                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] lg:min-w-0">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                            Order ID
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                            Customer
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                            Date
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                            Amount
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                            Status
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                            Actions
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/50">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-gray-700">No orders found</p>
                                                    <p className="text-sm text-gray-500">Start selling to see orders here</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order, index) => (
                                        <tr
                                            key={order._id}
                                            className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all duration-300 group/row"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                                                    <span className="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-sm">
                                                        <span className="text-sm font-bold text-blue-700">
                                                            {order.userId?.name?.[0]?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 group-hover/row:text-blue-600 transition-colors">
                                                            {order.userId?.name || 'Guest User'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                                            {order.userId?.email || 'No Email'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                                                        <Clock className="w-4 h-4 text-amber-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {formatDate(order.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(order.totalAmount)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'Delivered' ? 'bg-green-500' :
                                                            order.status === 'Shipped' ? 'bg-purple-500' :
                                                                order.status === 'Processing' ? 'bg-blue-500' :
                                                                    'bg-yellow-500'
                                                        }`}></div>
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg text-gray-600 hover:text-blue-600 hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:scale-110"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        to={`/admin/orders/${order._id}`}
                                                        className="p-2 bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-lg text-amber-600 hover:text-amber-700 hover:from-amber-50 hover:to-amber-100 transition-all duration-300 hover:scale-110"
                                                        title="Open Order"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {recentOrders.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Showing <span className="font-bold text-gray-900">{recentOrders.length}</span> of latest orders
                                </span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-gray-700">Delivered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-gray-700">Processing</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
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
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default AdminDashboard;