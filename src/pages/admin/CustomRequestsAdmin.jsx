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
  Sparkles,
  Quote,
  Edit,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp
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

  const statusOptions = [
    { value: 'all', label: 'All Requests', color: 'gray' },
    { value: 'Submitted', label: 'Submitted', color: 'blue' },
    { value: 'Under Review', label: 'Under Review', color: 'yellow' },
    { value: 'Quote Sent', label: 'Quote Sent', color: 'orange' },
    { value: 'Approved', label: 'Approved', color: 'green' },
    { value: 'In Production', label: 'In Production', color: 'purple' },
    { value: 'Completed', label: 'Completed', color: 'emerald' },
    { value: 'Rejected', label: 'Rejected', color: 'red' },
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

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(request => 
        request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Apply sorting
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
    const match = budget.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
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
      
      // Show success notification
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
      prev.includes(id)
        ? prev.filter(requestId => requestId !== id)
        : [...prev, id]
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-jewel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading custom requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">Custom Design Requests</h1>
          <p className="text-gray-600 mt-1">Manage and respond to custom jewelry inquiries</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-jewel-gold text-white rounded-lg hover:bg-amber-600 transition-colors duration-300 flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: requests.length, color: 'blue', icon: MessageSquare },
          { label: 'Pending Review', value: requests.filter(r => r.status === 'Submitted').length, color: 'yellow', icon: Clock },
          { label: 'Quotes Sent', value: requests.filter(r => r.status === 'Quote Sent').length, color: 'orange', icon: DollarSign },
          { label: 'Approved', value: requests.filter(r => r.status === 'Approved' || r.status === 'In Production').length, color: 'green', icon: CheckCircle },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requests..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                onChange={selectAllRequests}
                className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold"
              />
              <span className="text-sm text-gray-600">
                {selectedRequests.length} of {filteredRequests.length} selected
              </span>
            </div>
            <span className="text-sm text-gray-600">
              Showing {filteredRequests.length} requests
            </span>
          </div>
        </div>

        {/* Requests */}
        <div className="divide-y divide-gray-200">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center">
              <Gem className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try changing your filters' 
                  : 'No custom design requests yet'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                {/* Request Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(req._id)}
                      onChange={() => toggleRequestSelection(req._id)}
                      className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold mt-1"
                    />
                    
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-jewel-gold/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                          <User className="text-jewel-gold" size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{req.userId?.name || 'Guest User'}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {req.userId?.email || 'No email provided'}
                            </span>
                            {req.userId?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={14} />
                                {req.userId.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-${getStatusColor(req.status)}-100 text-${getStatusColor(req.status)}-800`}>
                        {req.status === 'Quote Sent' && <DollarSign size={12} />}
                        {req.status === 'Submitted' && <Clock size={12} />}
                        {req.status === 'Approved' && <CheckCircle size={12} />}
                        {req.status}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        <Calendar size={12} className="inline mr-1" />
                        {formatDate(req.createdAt)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => toggleExpand(req._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      {expandedRequest === req._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Request Body */}
                <div className="pl-14">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gem size={16} className="text-jewel-gold" />
                      <span className="font-medium text-gray-700">Design Request</span>
                    </div>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      "{req.description}"
                    </p>
                  </div>

                  {/* Request Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Budget Range</div>
                      <div className="flex items-center gap-1 font-medium">
                        <DollarSign size={16} className="text-green-600" />
                        {req.budgetRange || 'Not specified'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Jewelry Type</div>
                      <div className="font-medium">{req.jewelryType || 'Not specified'}</div>
                    </div>
                    
                    {req.referenceImage && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Reference Image</div>
                        <a
                          href={req.referenceImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-jewel-gold hover:underline"
                        >
                          <ImageIcon size={16} />
                          View Image
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Admin Comments */}
                  {req.adminComments && (
                    <div className="mb-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Quote size={16} className="text-amber-600" />
                        <span className="font-medium text-amber-800">Admin Response</span>
                        {req.quoteAmount && (
                          <span className="ml-auto px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                            Quote: ${parseFloat(req.quoteAmount).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{req.adminComments}</p>
                      {req.repliedAt && (
                        <p className="text-xs text-amber-600 mt-2">
                          Sent on {formatDate(req.repliedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Expanded Actions */}
                  {expandedRequest === req._id && (
                    <div className="mt-4 space-y-4 animate-slideDown">
                      {/* Status Update */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Update Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions
                            .filter(s => s.value !== 'all')
                            .map(status => (
                              <button
                                key={status.value}
                                onClick={() => handleStatusUpdate(req._id, status.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                  req.status === status.value
                                    ? `bg-${status.color}-500 text-white`
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
                        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quote Amount (Optional)
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                              <input
                                type="number"
                                value={quoteAmount}
                                onChange={(e) => setQuoteAmount(e.target.value)}
                                placeholder="Enter quote amount"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                              />
                            </div>
                          </div>
                          
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Response
                          </label>
                          <textarea
                            className="w-full h-32 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none resize-none"
                            placeholder="Enter your response here... Provide details about timeline, materials, pricing, etc."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          
                          <div className="flex justify-end gap-3 mt-4">
                            <button
                              onClick={() => setActiveId(null)}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => sendReply(req._id)}
                              className="px-4 py-2 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 flex items-center gap-2"
                            >
                              <MessageSquare size={16} />
                              {quoteAmount ? 'Send Quote' : 'Send Reply'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setActiveId(req._id)}
                            className="px-4 py-2 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 flex items-center gap-2"
                          >
                            <MessageSquare size={16} />
                            {req.adminComments ? 'Reply Again' : 'Send Response'}
                          </button>
                          
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                            <Edit size={16} />
                            Edit
                          </button>
                          
                          <button className="px-4 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center gap-2">
                            <Trash2 size={16} />
                            Delete
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
                        className="text-jewel-gold hover:text-amber-600 transition-colors duration-200 flex items-center gap-1 text-sm"
                      >
                        <MessageSquare size={14} />
                        Reply
                      </button>
                      <button
                        onClick={() => toggleExpand(req._id)}
                        className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center gap-1 text-sm"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                        className="ml-auto text-sm border-none bg-transparent outline-none text-gray-600 hover:text-gray-800"
                      >
                        {statusOptions
                          .filter(s => s.value !== 'all')
                          .map(status => (
                            <option key={status.value} value={status.value}>
                              Set as {status.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 animate-slideUp">
          <div className="flex items-center gap-4">
            <span className="font-medium">
              {selectedRequests.length} request{selectedRequests.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none">
                <option>Bulk Actions</option>
                <option>Mark as Reviewed</option>
                <option>Send Quote Template</option>
                <option>Export Selected</option>
                <option>Delete Selected</option>
              </select>
              <button className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors duration-200">
                Apply
              </button>
              <button 
                onClick={() => setSelectedRequests([])}
                className="px-4 py-1.5 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomRequestsAdmin;