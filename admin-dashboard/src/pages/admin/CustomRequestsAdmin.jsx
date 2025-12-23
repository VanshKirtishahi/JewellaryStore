import { useState, useEffect } from 'react';
import axios from '../../api/axios'; // Ensure this points to your axios instance
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MoreVertical, 
  X,
  Hammer,
  DollarSign,
  Calendar,
  User,
  Mail,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

const CustomRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // For Modal
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // --- 1. FETCH DATA ---
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // FIXED: Correct endpoint matching your CustomDesignRequest.jsx POST
      const res = await axios.get('/custom'); 
      setRequests(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // --- 2. ACTIONS ---
  const handleStatusUpdate = async (id, newStatus, adminComments = '') => {
    try {
      setActionLoading(true);
      // Ensure your backend has a PUT route for this: router.put('/:id', ...)
      await axios.put(`/custom/${id}`, { 
        status: newStatus,
        adminComments: adminComments
      });
      
      // Update local state to reflect change immediately
      setRequests(prev => prev.map(req => 
        req._id === id ? { ...req, status: newStatus, adminComments } : req
      ));
      
      if (selectedRequest?._id === id) {
        setSelectedRequest(prev => ({ ...prev, status: newStatus, adminComments }));
      }
      
      // Close modal if it was an approval/rejection action
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

  // --- 3. FILTER LOGIC ---
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req._id.includes(searchTerm) ||
      req.jewelryType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Stats for Dashboard
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Submitted').length,
    inProgress: requests.filter(r => ['Approved', 'In Production'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'Completed').length,
  };

  // Helper for Status Badge Colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'Submitted': return 'bg-blue-100 text-blue-700';
      case 'Under Review': return 'bg-amber-100 text-amber-700';
      case 'Quote Sent': return 'bg-purple-100 text-purple-700';
      case 'Approved': return 'bg-emerald-100 text-emerald-700';
      case 'In Production': return 'bg-orange-100 text-orange-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={32} /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Custom Design Requests</h1>
        <p className="text-gray-500">Manage incoming jewelry design inquiries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Total Requests</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/50 shadow-sm">
          <p className="text-blue-600 text-sm font-medium">New / Pending</p>
          <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-orange-100 bg-orange-50/50 shadow-sm">
          <p className="text-orange-600 text-sm font-medium">In Production</p>
          <p className="text-2xl font-bold text-orange-700">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-green-100 bg-green-50/50 shadow-sm">
          <p className="text-green-600 text-sm font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by User, ID or Type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Submitted', 'Approved', 'Completed', 'Rejected'].map(status => (
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Jewelry Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">
                    #{req._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{req.userName}</p>
                      <p className="text-xs text-gray-500">{req.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2">
                      {req.jewelryType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleViewDetails(req)}
                      className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center justify-end gap-1"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No requests found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL: VIEW DETAILS --- */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                <p className="text-sm text-gray-500 font-mono mt-1">ID: {selectedRequest._id}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                    {selectedRequest.referenceImage ? (
                      <img 
                        src={selectedRequest.referenceImage} // Ensure this path works (full URL or relative)
                        alt="Design Reference" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon size={48} className="mx-auto mb-2" />
                        <p className="text-sm">No reference image</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">User Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={14} /> {selectedRequest.userName}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} /> {selectedRequest.userEmail}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} /> Submitted: {new Date(selectedRequest.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {selectedRequest.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Jewelry Type</p>
                      <p className="font-medium text-gray-900">{selectedRequest.jewelryType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Budget Range</p>
                      <p className="font-medium text-gray-900">{selectedRequest.budgetRange}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Metal</p>
                      <p className="font-medium text-gray-900">{selectedRequest.metalType || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gemstone</p>
                      <p className="font-medium text-gray-900">{selectedRequest.gemstoneType || 'None'}</p>
                    </div>
                  </div>

                  {/* Actions Panel */}
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <h4 className="font-bold text-gray-900 mb-3">Update Status</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleStatusUpdate(selectedRequest._id, 'Approved', 'Your design has been approved! We will start crafting shortly.')}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      
                      <button 
                        onClick={() => handleStatusUpdate(selectedRequest._id, 'Quote Sent', 'We have prepared a quote for your design.')}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <DollarSign size={16} /> Send Quote
                      </button>

                      <button 
                        onClick={() => handleStatusUpdate(selectedRequest._id, 'In Production', 'Production has started.')}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Hammer size={16} /> Production
                      </button>

                      <button 
                        onClick={() => handleStatusUpdate(selectedRequest._id, 'Rejected', 'Unfortunately we cannot process this request.')}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        <XCircle size={16} /> Reject
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