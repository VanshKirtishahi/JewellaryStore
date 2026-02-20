import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios'; 
import { 
  Eye, CheckCircle, XCircle, Clock, Search,
  X, Hammer, DollarSign, Calendar, RefreshCw,
  User, Mail, Loader2, Image as ImageIcon,
  ChevronDown, Palette, Gem, Box
} from 'lucide-react';

const CustomRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [customerNames, setCustomerNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  
  // Filter States
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Dropdown States
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [nameDropdownSearch, setNameDropdownSearch] = useState('');
  const dropdownRef = useRef(null);

  const [actionLoading, setActionLoading] = useState(false);

  const statusConfig = {
    'Submitted': { color: 'text-blue-700 bg-blue-100', border: 'border-l-blue-500', icon: Clock },
    'Under Review': { color: 'text-amber-700 bg-amber-100', border: 'border-l-amber-500', icon: Search },
    'Quote Sent': { color: 'text-purple-700 bg-purple-100', border: 'border-l-purple-500', icon: DollarSign },
    'Approved': { color: 'text-emerald-700 bg-emerald-100', border: 'border-l-emerald-500', icon: CheckCircle },
    'In Production': { color: 'text-orange-700 bg-orange-100', border: 'border-l-orange-500', icon: Hammer },
    'Completed': { color: 'text-green-700 bg-green-100', border: 'border-l-green-500', icon: CheckCircle },
    'Rejected': { color: 'text-red-700 bg-red-100', border: 'border-l-red-500', icon: XCircle },
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/custom'); 
      const sortedData = res?.data?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)) || [];
      setRequests(sortedData);

      // Extract unique user names for the custom dropdown
      const names = new Set(sortedData.map(r => r?.userName).filter(Boolean));
      setCustomerNames(Array.from(names).sort());

    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle clicking outside custom dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNameDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusUpdate = async (id, newStatus, adminComments = '') => {
    try {
      setActionLoading(true);
      await axios.put(`/custom/${id}`, { 
        status: newStatus,
        adminComments: adminComments
      });
      
      setRequests(prev => prev.map(req => 
        req?._id === id ? { ...req, status: newStatus, adminComments } : req
      ));
      
      if (selectedRequest?._id === id) {
        setSelectedRequest(prev => ({ ...prev, status: newStatus, adminComments }));
      }
      
      if (['Approved', 'Rejected', 'Completed'].includes(newStatus)) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // Strict Client-Side Filtering
  const displayedRequests = requests?.filter(req => {
    const searchMatch = !searchTerm || 
      (req?.userName || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) || 
      (req?._id || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (req?.jewelryType || '').toLowerCase().includes(searchTerm.toLowerCase().trim());
    
    const statusMatch = filterStatus === 'All' || req?.status === filterStatus;
    
    return searchMatch && statusMatch;
  });

  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r?.status === 'Submitted' || r?.status === 'Under Review')?.length || 0,
    inProgress: requests?.filter(r => ['Approved', 'In Production'].includes(r?.status))?.length || 0,
    completed: requests?.filter(r => r?.status === 'Completed')?.length || 0,
  };

  const getStatusData = (status) => statusConfig[status] || { color: 'text-gray-700 bg-gray-100', border: 'border-l-gray-300', icon: Clock };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 relative bg-gray-50 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="text-blue-600" size={24} />
            Custom Design Requests
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Manage incoming bespoke jewelry design inquiries</p>
        </div>
        <button 
          onClick={fetchRequests} 
          className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white flex-shrink-0 self-start md:self-auto"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Requests', value: stats?.total, icon: Box, bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
          { label: 'New / Pending', value: stats?.pending, icon: Clock, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
          { label: 'In Production', value: stats?.inProgress, icon: Hammer, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
          { label: 'Completed', value: stats?.completed, icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
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
            {/* Direct Text Search */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search ID, Name or Type..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Custom User Dropdown Filter */}
            <div className="relative w-full md:w-64" ref={dropdownRef}>
              <div 
                className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowNameDropdown(!showNameDropdown)}
              >
                <span className="text-sm text-gray-700 truncate select-none flex items-center gap-2">
                  <User size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{searchTerm && customerNames.includes(searchTerm) ? searchTerm : 'Filter by Customer'}</span>
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
                        !searchTerm || !customerNames.includes(searchTerm) 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => { setSearchTerm(''); setShowNameDropdown(false); setNameDropdownSearch(''); }}
                    >
                      <User size={14} /> All Customers
                    </div>
                    {customerNames
                      .filter(name => name.toLowerCase().includes(nameDropdownSearch.toLowerCase()))
                      .map((name, idx) => (
                      <div 
                        key={idx}
                        className={`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                          searchTerm === name 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => { setSearchTerm(name); setShowNameDropdown(false); setNameDropdownSearch(''); }}
                      >
                        <User size={14} className="text-gray-400" /> {name}
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

          {/* Status Filter Buttons (Scrollable on mobile) */}
          <div className="w-full lg:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <div className="flex gap-2 min-w-max">
              {['All', 'Submitted', 'Approved', 'In Production', 'Completed', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterStatus === status 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Requests Table/List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden z-0 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
            <p className="text-gray-500 text-sm">Loading custom requests...</p>
          </div>
        ) : displayedRequests?.length === 0 ? (
          <div className="p-12 text-center">
            <Palette className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 mt-3">No requests found matching your filters.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Request Details</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-3">Jewelry Specs</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            <div className="divide-y divide-gray-200">
              {displayedRequests?.map((req, index) => {
                const rowBgColor = index % 2 === 0 ? 'bg-white' : 'bg-blue-50/20';
                const statusData = getStatusData(req?.status);
                const StatusIcon = statusData.icon;

                return (
                  <div key={req?._id} className={`${rowBgColor} hover:bg-blue-50/60 transition-colors border-l-4 ${statusData.border}`}>
                    
                    {/* Desktop Row View */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                      <div className="col-span-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${statusData.color}`}>
                            <StatusIcon size={18} />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-gray-900">
                              #{req?._id?.slice(-6).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Calendar size={12} />
                              {new Date(req?.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3">
                        <div className="text-sm font-semibold text-gray-900">{req?.userName}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Mail size={12} className="flex-shrink-0" />
                          <span className="truncate">{req?.userEmail}</span>
                        </div>
                      </div>

                      <div className="col-span-3">
                        <div className="text-sm font-medium text-gray-800 flex items-center gap-1.5 mb-1">
                          <Gem size={14} className="text-purple-600" />
                          {req?.jewelryType}
                        </div>
                        <div className="text-xs text-gray-500">
                          {req?.metalType || 'Unspecified'} • {req?.gemstoneType || 'None'}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${statusData.color}`}>
                          {req?.status}
                        </span>
                      </div>

                      <div className="col-span-1 flex items-center justify-end">
                        <button 
                          onClick={() => handleViewDetails(req)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye size={16} /> View
                        </button>
                      </div>
                    </div>

                    {/* Mobile Row View */}
                    <div className="lg:hidden p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg self-start ${statusData.color}`}>
                            <StatusIcon size={16} />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-gray-900 text-sm">
                              #{req?._id?.slice(-6).toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {new Date(req?.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusData.color}`}>
                          {req?.status}
                        </span>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-gray-100 mb-3 shadow-sm">
                        <div className="font-semibold text-gray-900 text-sm">{req?.userName}</div>
                        <div className="text-xs text-gray-500 mt-1 break-all">{req?.userEmail}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                          <Gem size={14} className="text-purple-600" />
                          {req?.jewelryType}
                        </div>
                        <button 
                          onClick={() => handleViewDetails(req)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-100"
                        >
                          <Eye size={14} /> Details
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal - Fully Responsive and Modernized */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm md:p-4">
          <div className="bg-white md:rounded-xl shadow-2xl w-full max-w-4xl h-full md:h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 md:p-5 border-b border-gray-200 flex justify-between items-center bg-white z-20 shadow-sm">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Palette className="text-blue-600" size={20} />
                  Request Details
                </h3>
                <p className="text-xs md:text-sm text-gray-500 font-mono mt-1">ID: {selectedRequest?._id}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Image & User Info */}
                <div className="space-y-6">
                  {/* Image Reference */}
                  <div className="aspect-square md:aspect-[4/3] bg-white rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shadow-sm relative group">
                    {selectedRequest?.referenceImage ? (
                      <img 
                        src={selectedRequest?.referenceImage} 
                        alt="Design Reference" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400 flex flex-col items-center">
                        <ImageIcon size={48} className="mb-3 opacity-50" />
                        <p className="text-sm font-medium">No reference image provided</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${getStatusData(selectedRequest?.status).color}`}>
                        {selectedRequest?.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={14} className="text-blue-600" /> Customer Info
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {selectedRequest?.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedRequest?.userName}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={10} /> {selectedRequest?.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 pt-1">
                        <Calendar size={14} className="text-gray-400" /> 
                        <span className="font-medium">Submitted:</span> {new Date(selectedRequest?.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Specs & Actions */}
                <div className="space-y-6">
                  
                  {/* Jewelry Specifications Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Gem size={14} className="text-purple-600" /> Design Specifications
                    </h4>
                    
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Description</p>
                      <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                        {selectedRequest?.description || 'No specific description provided.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Jewelry Type</p>
                        <p className="font-semibold text-gray-900 text-sm">{selectedRequest?.jewelryType}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Budget Range</p>
                        <p className="font-semibold text-green-700 text-sm">{selectedRequest?.budgetRange}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Metal</p>
                        <p className="font-semibold text-amber-700 text-sm">{selectedRequest?.metalType || 'Unspecified'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Gemstone</p>
                        <p className="font-semibold text-purple-700 text-sm">{selectedRequest?.gemstoneType || 'None'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Status Update Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-blue-500">
                    <h4 className="font-bold text-gray-900 mb-4">Manage Request Status</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleStatusUpdate(selectedRequest?._id, 'Approved', 'Your design has been approved! We will start crafting shortly.')}
                        disabled={actionLoading || selectedRequest?.status === 'Approved'}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 group"
                      >
                        <CheckCircle size={16} className="group-hover:text-white" /> Approve
                      </button>
                      
                      <button 
                        onClick={() => handleStatusUpdate(selectedRequest?._id, 'Quote Sent', 'We have prepared a quote for your design.')}
                        disabled={actionLoading || selectedRequest?.status === 'Quote Sent'}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 group"
                      >
                        <DollarSign size={16} className="group-hover:text-white" /> Send Quote
                      </button>

                      <button 
                        onClick={() => handleStatusUpdate(selectedRequest?._id, 'In Production', 'Production has started.')}
                        disabled={actionLoading || selectedRequest?.status === 'In Production'}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border border-orange-200 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 group"
                      >
                        <Hammer size={16} className="group-hover:text-white" /> Production
                      </button>

                      <button 
                        onClick={() => handleStatusUpdate(selectedRequest?._id, 'Rejected', 'Unfortunately we cannot process this request.')}
                        disabled={actionLoading || selectedRequest?.status === 'Rejected'}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 group"
                      >
                        <XCircle size={16} className="group-hover:text-white" /> Reject
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomRequestsAdmin;