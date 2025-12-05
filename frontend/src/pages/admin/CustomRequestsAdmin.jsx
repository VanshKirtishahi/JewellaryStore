import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { 
  MessageSquare, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Image as ImageIcon,
  Calendar,
  User,
  Mail,
  Phone,
  Gem,
  Quote,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Target,
  Crown,
  Award,
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart3,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Shield
} from 'lucide-react';

const CustomRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [statsVisible, setStatsVisible] = useState([false, false, false, false]);
  const [hoveredRequest, setHoveredRequest] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Requests', color: 'gray', bgGradient: 'from-gray-400 to-gray-600' },
    { value: 'Submitted', label: 'Submitted', color: 'blue', bgGradient: 'from-blue-400 to-cyan-500' },
    { value: 'Under Review', label: 'Under Review', color: 'yellow', bgGradient: 'from-amber-400 to-yellow-500' },
    { value: 'Quote Sent', label: 'Quote Sent', color: 'orange', bgGradient: 'from-orange-400 to-amber-500' },
    { value: 'Approved', label: 'Approved', color: 'green', bgGradient: 'from-emerald-400 to-green-500' },
    { value: 'In Production', label: 'In Production', color: 'purple', bgGradient: 'from-purple-400 to-pink-500' },
    { value: 'Completed', label: 'Completed', color: 'emerald', bgGradient: 'from-teal-400 to-emerald-500' },
    { value: 'Rejected', label: 'Rejected', color: 'red', bgGradient: 'from-red-400 to-rose-500' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget-high', label: 'Highest Budget' },
    { value: 'budget-low', label: 'Lowest Budget' },
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [requests, searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setStatsVisible([true, false, false, false]), 100);
      setTimeout(() => setStatsVisible([true, true, false, false]), 200);
      setTimeout(() => setStatsVisible([true, true, true, false]), 300);
      setTimeout(() => setStatsVisible([true, true, true, true]), 400);
    }
  }, [loading]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/custom');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRequests = () => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(request => 
        request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'budget-high':
          return parseBudget(b.budgetRange) - parseBudget(a.budgetRange);
        case 'budget-low':
          return parseBudget(a.budgetRange) - parseBudget(b.budgetRange);
        default:
          return 0;
      }
    });

    setFilteredRequests(filtered);
  };

  const parseBudget = (budget) => {
    if (!budget) return 0;
    const match = budget.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const sendReply = async (id) => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      await axios.put(`/custom/${id}`, { 
        adminComments: replyText,
        quoteAmount: quoteAmount || undefined,
        status: quoteAmount ? 'Quote Sent' : 'Under Review',
        repliedAt: new Date().toISOString()
      });
      
      setActiveId(null);
      setReplyText('');
      setQuoteAmount('');
      fetchRequests();
      alert("Reply sent successfully!");
    } catch (err) {
      alert("Error sending reply");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/custom/${id}`, { status: newStatus });
      fetchRequests();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const toggleRequestSelection = (id) => {
    setSelectedRequests(prev =>
      prev.includes(id) ? prev.filter(requestId => requestId !== id) : [...prev, id]
    );
  };

  const selectAllRequests = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req._id));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const toggleExpand = (id) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-jewel-gold/20 border-t-jewel-gold rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Gem className="w-8 h-8 text-jewel-gold animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-700">Loading Custom Designs</p>
          <p className="text-sm text-gray-500">Fetching all custom jewelry requests...</p>
        </div>
      </div>
    );
  }

  // Stats Calculation
  const totalRequests = requests.length;
  const pendingReview = requests.filter(r => ['Submitted', 'Under Review'].includes(r.status)).length;
  const quotesSent = requests.filter(r => r.status === 'Quote Sent').length;
  const approved = requests.filter(r => ['Approved', 'In Production', 'Completed'].includes(r.status)).length;

  const statsCards = [
    { 
      label: 'Total Requests', 
      value: totalRequests, 
      icon: MessageSquare,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      iconColor: 'text-white',
      subtext: 'Custom designs requested'
    },
    { 
      label: 'Pending Review', 
      value: pendingReview, 
      icon: Clock,
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-500',
      iconColor: 'text-white',
      subtext: 'Awaiting evaluation'
    },
    { 
      label: 'Quotes Sent', 
      value: quotesSent, 
      icon: DollarSign,
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
      iconColor: 'text-white',
      subtext: 'Quotes delivered'
    },
    { 
      label: 'Approved', 
      value: approved, 
      icon: Award,
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
      iconColor: 'text-white',
      subtext: 'In production/completed'
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-jewel-gold/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-30 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-200/50 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">Custom Design Requests</h1>
                <Sparkles className="w-6 h-6 text-jewel-gold animate-pulse" />
              </div>
              <p className="text-gray-600 lg:text-lg">Manage and respond to custom jewelry inquiries</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchRequests}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-jewel-gold to-amber-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
              >
                <Filter className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
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
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live updates</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
              </div>
            </div>

            {/* Bottom Gradient Bar */}
            <div className={`h-1 ${stat.iconBg} transition-all duration-500 group-hover:h-1.5`}></div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-slideDown hover:shadow-2xl transition-all duration-500">
            <h3 className="font-serif font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-jewel-gold" />
              Filter & Sort Requests
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  Search Requests
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by description, name, or email..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg bg-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{filteredRequests.length}</span> requests match your criteria
              </div>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSortBy('newest');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300 hover:scale-105"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-jewel-gold/20 to-amber-500/20 blur-xl rounded-3xl animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-jewel-gold/10 to-amber-500/10 border border-jewel-gold/20 rounded-2xl p-4 lg:p-6 animate-slideDown">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-jewel-gold to-amber-500 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {selectedRequests.length} request{selectedRequests.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-gray-600">Perform bulk actions on selected requests</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  onChange={(e) => {
                    selectedRequests.forEach(id => handleStatusUpdate(id, e.target.value));
                    setSelectedRequests([]);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-jewel-gold min-w-[180px]"
                >
                  <option value="">Bulk Status Update</option>
                  <option value="Under Review">Mark as Under Review</option>
                  <option value="Quote Sent">Mark as Quote Sent</option>
                  <option value="Approved">Mark as Approved</option>
                  <option value="Rejected">Mark as Rejected</option>
                </select>
                <button className="px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Selected
                </button>
                <button 
                  onClick={() => setSelectedRequests([])}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:scale-[1.02] active:scale-95"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={selectAllRequests}
                    className="w-5 h-5 text-jewel-gold rounded focus:ring-2 focus:ring-jewel-gold cursor-pointer hover:scale-110 transition-transform duration-300"
                  />
                  <div className="text-sm font-medium text-gray-700">
                    {selectedRequests.length} of {filteredRequests.length} selected
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-medium">
                  <span className="text-gray-900 font-bold">{filteredRequests.length}</span> requests
                </div>
              </div>
            </div>
          </div>

          {/* Requests Content */}
          <div className="divide-y divide-gray-200/50">
            {filteredRequests.length === 0 ? (
              <div className="py-16 text-center">
                <div className="relative inline-block mb-6">
                  <Gem className="w-16 h-16 text-gray-300 group-hover:text-jewel-gold/50 transition-all duration-500" />
                  <Search className="absolute -top-2 -right-2 w-8 h-8 text-jewel-gold animate-pulse" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No Requests Found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters' 
                    : 'No custom design requests have been submitted yet.'}
                </p>
                {searchQuery || statusFilter !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2 mx-auto group"
                  >
                    <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                    Reset Filters
                  </button>
                ) : null}
              </div>
            ) : (
              filteredRequests.map((req, index) => {
                const statusObj = statusOptions.find(s => s.value === req.status) || statusOptions[0];
                
                return (
                  <div 
                    key={req._id} 
                    className={`
                      relative overflow-hidden group/request bg-white
                      hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all duration-300
                      ${hoveredRequest === req._id ? 'ring-1 ring-jewel-gold/10' : ''}
                    `}
                    onMouseEnter={() => setHoveredRequest(req._id)}
                    onMouseLeave={() => setHoveredRequest(null)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Main Request Row */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        {/* Left Side - Selection & Basic Info */}
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(req._id)}
                            onChange={() => toggleRequestSelection(req._id)}
                            className="w-5 h-5 text-jewel-gold rounded focus:ring-2 focus:ring-jewel-gold cursor-pointer hover:scale-110 transition-transform duration-300 mt-1"
                          />
                          
                          <div className="flex items-start gap-4">
                            {/* Customer Avatar */}
                            <div className="relative">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white shadow-sm">
                                <div className={`w-full h-full rounded-full bg-gradient-to-br ${statusObj.bgGradient} flex items-center justify-center`}>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Customer Details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-gray-900">
                                  {req.userId?.name || 'Guest User'}
                                </h3>
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(req.createdAt)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1.5 text-gray-600">
                                  <Mail className="w-4 h-4" />
                                  {req.userId?.email || 'No email'}
                                </span>
                                {req.userId?.phone && (
                                  <span className="flex items-center gap-1.5 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    {req.userId.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Side - Status & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-br ${statusObj.bgGradient} shadow-md`}>
                              {req.status === 'Quote Sent' && <DollarSign className="w-3 h-3" />}
                              {req.status === 'Submitted' && <Clock className="w-3 h-3" />}
                              {req.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                              {req.status}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => toggleExpand(req._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 group/expand"
                          >
                            {expandedRequest === req._id ? (
                              <ChevronUp className="w-5 h-5 group-hover/expand:text-jewel-gold transition-colors duration-300" />
                            ) : (
                              <ChevronDown className="w-5 h-5 group-hover/expand:text-jewel-gold transition-colors duration-300" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Request Body */}
                      <div className="pl-16">
                        {/* Design Request */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Gem className="w-4 h-4 text-jewel-gold" />
                            <span className="font-medium text-gray-700">Design Request</span>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 group-hover/request:border-jewel-gold/30 transition-all duration-300">
                            <p className="text-gray-700 italic">"{req.description}"</p>
                          </div>
                        </div>

                        {/* Request Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                            <div className="text-xs font-medium text-gray-500 mb-1">BUDGET RANGE</div>
                            <div className="flex items-center gap-1 font-bold text-gray-900 text-lg">
                              <DollarSign className="w-4 h-4 text-emerald-500" />
                              {req.budgetRange || 'Not specified'}
                            </div>
                          </div>
                          
                          <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                            <div className="text-xs font-medium text-gray-500 mb-1">JEWELRY TYPE</div>
                            <div className="font-bold text-gray-900 text-lg">{req.jewelryType || 'Not specified'}</div>
                          </div>
                          
                          {req.referenceImage && (
                            <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100 group hover:shadow-md transition-all duration-300">
                              <div className="text-xs font-medium text-gray-500 mb-1">REFERENCE IMAGE</div>
                              <a
                                href={req.referenceImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 font-medium text-amber-700 hover:text-amber-800 transition-colors duration-300 group-hover:scale-105"
                              >
                                <ImageIcon className="w-4 h-4" />
                                View Reference Image
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Admin Comments */}
                        {req.adminComments && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-l-4 border-amber-500 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Quote className="w-4 h-4 text-amber-600" />
                              <span className="font-bold text-amber-800">Admin Response</span>
                              {req.quoteAmount && (
                                <span className="ml-auto px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                                  Quote: {formatCurrency(req.quoteAmount)}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700">{req.adminComments}</p>
                            {req.repliedAt && (
                              <p className="text-xs text-amber-600 mt-2 font-medium">
                                Sent on {formatDate(req.repliedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Expanded Actions */}
                        {expandedRequest === req._id && (
                          <div className="mt-6 space-y-6 animate-slideDown">
                            {/* Status Update Buttons */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-jewel-gold" />
                                Update Status
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {statusOptions
                                  .filter(s => s.value !== 'all')
                                  .map(status => (
                                    <button
                                      key={status.value}
                                      onClick={() => handleStatusUpdate(req._id, status.value)}
                                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                                        req.status === status.value
                                          ? `text-white bg-gradient-to-br ${status.bgGradient} shadow-lg`
                                          : `bg-${status.color}-100 text-${status.color}-800 hover:bg-${status.color}-200`
                                      }`}
                                    >
                                      {status.label}
                                    </button>
                                  ))}
                              </div>
                            </div>

                            {/* Reply Form */}
                            {activeId === req._id ? (
                              <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                    Quote Amount (Optional)
                                  </label>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                      type="number"
                                      value={quoteAmount}
                                      onChange={(e) => setQuoteAmount(e.target.value)}
                                      placeholder="Enter quote amount"
                                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                                    />
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                    Your Response
                                  </label>
                                  <textarea
                                    className="w-full h-40 border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none resize-none transition-all duration-300 focus:shadow-lg"
                                    placeholder="Enter your response here..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                  />
                                </div>
                                
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => setActiveId(null)}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => sendReply(req._id)}
                                    className="px-5 py-2.5 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2 group"
                                  >
                                    <MessageSquare className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                                    {quoteAmount ? 'Send Quote' : 'Send Response'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                  onClick={() => setActiveId(req._id)}
                                  className="flex-1 px-5 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                  <MessageSquare className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                                  {req.adminComments ? 'Reply Again' : 'Send Response'}
                                </button>
                                <button className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                  <Edit className="w-4 h-4" /> Edit
                                </button>
                                <button className="px-5 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Quick Actions Bar */}
                        {expandedRequest !== req._id && (
                          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setActiveId(req._id)}
                              className="text-jewel-gold hover:text-amber-600 transition-colors duration-300 flex items-center gap-2 text-sm font-medium hover:scale-105"
                            >
                              <MessageSquare className="w-4 h-4" /> Reply
                            </button>
                            <button
                              onClick={() => toggleExpand(req._id)}
                              className="text-gray-600 hover:text-gray-800 transition-colors duration-300 flex items-center gap-2 text-sm font-medium hover:scale-105"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button className="text-blue-600 hover:text-blue-800 transition-colors duration-300 flex items-center gap-2 text-sm font-medium hover:scale-105">
                              <ExternalLink className="w-4 h-4" /> View Customer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CustomRequestsAdmin;