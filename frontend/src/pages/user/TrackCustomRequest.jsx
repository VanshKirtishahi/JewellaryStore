import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  Search, 
  Gem, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  PenTool, 
  Hammer, 
  DollarSign,
  XCircle,
  ChevronRight,
  Sparkles,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TrackCustomRequest = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- FETCH WHOLE DATA ---
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!user) return;
        setLoading(true);
        
        const userId = user._id || user.id;
        const res = await axios.get(`/custom/user/${userId}`);
        
        // Sort by newest first
        const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRequests(sorted);
        
        // Auto-select the first request if available
        if (sorted.length > 0) setSelectedRequest(sorted[0]);
        
      } catch (err) {
        console.error("Error fetching custom requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  // --- SEARCH FILTER ---
  const filteredRequests = requests.filter(r => 
    r._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.jewelryType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- TIMELINE LOGIC ---
  const steps = [
    { status: 'Submitted', label: 'Request Received', description: 'We have received your design details.', icon: PenTool },
    { status: 'Under Review', label: 'Under Review', description: 'Our experts are analyzing your request.', icon: Clock },
    { status: 'Quote Sent', label: 'Quote Ready', description: 'Price estimate sent for your approval.', icon: DollarSign },
    { status: 'Approved', label: 'Design Approved', description: 'You approved the design & quote.', icon: CheckCircle },
    { status: 'In Production', label: 'In Production', description: 'Crafting your unique piece.', icon: Hammer },
    { status: 'Completed', label: 'Ready for Delivery', description: 'Your masterpiece is ready!', icon: Gem },
  ];

  const getStepStatus = (stepStatus, currentStatus) => {
    if (currentStatus === 'Rejected') return 'rejected';
    
    const statusOrder = ['Submitted', 'Under Review', 'Quote Sent', 'Approved', 'In Production', 'Completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (currentIndex === -1) return 'upcoming'; 
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'TBD';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-jewel-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Track Custom Design
            <Sparkles className="w-5 h-5 text-purple-500" />
          </h1>
          <p className="text-gray-500 text-sm mt-1">Follow the journey of your unique masterpiece</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Request ID or Type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* LEFT COLUMN: Request List */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Your Requests</h3>
            <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
              {requests.length}
            </span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PenTool className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 text-sm mb-4">No requests found.</p>
                <Link to="/custom-request" className="text-sm font-medium text-purple-600 hover:underline">
                  Start a new design
                </Link>
              </div>
            ) : (
              filteredRequests.map(req => (
                <div 
                  key={req._id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border group ${
                    selectedRequest?._id === req._id 
                      ? 'border-purple-500 bg-purple-50/50 shadow-sm' 
                      : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`font-semibold block ${selectedRequest?._id === req._id ? 'text-purple-900' : 'text-gray-900'}`}>
                        {req.jewelryType || 'Custom Jewelry'}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">#{req._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium border ${
                      req.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' :
                      req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(req.createdAt)}
                    </span>
                    <ChevronRight size={14} className={`transition-transform ${selectedRequest?._id === req._id ? 'text-purple-500 translate-x-1' : 'text-gray-300'}`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Tracking */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {selectedRequest ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
              
              {/* Detail Header */}
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-6 justify-between bg-gradient-to-r from-white to-purple-50/30">
                <div className="flex gap-5">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden">
                    {selectedRequest.referenceImage ? (
                      <img 
                        src={selectedRequest.referenceImage} 
                        alt="Reference" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Gem size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedRequest.jewelryType} Request</h2>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-md">
                      "{selectedRequest.description}"
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        <Clock size={12} />
                        Updated {new Date(selectedRequest.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        <DollarSign size={12} />
                        Budget: {selectedRequest.budgetRange}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRequest.quoteAmount && (
                  <div className="text-right bg-white p-3 rounded-xl border border-gray-200 shadow-sm self-start">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Estimated Quote</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {formatCurrency(selectedRequest.quoteAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {/* Status Alert if Rejected */}
                {selectedRequest.status === 'Rejected' && (
                  <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 flex gap-4">
                    <div className="p-2 bg-red-100 rounded-full h-fit text-red-600">
                      <XCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-800">Request Declined</h4>
                      <p className="text-sm text-red-600 mt-1">
                        {selectedRequest.adminComments || 'Unfortunately, we cannot proceed with this request at this time. Please contact support for more details.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tracking Timeline */}
                {selectedRequest.status !== 'Rejected' && (
                  <div className="relative pl-4 sm:pl-0">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <ActivityIcon /> Tracking Timeline
                    </h3>
                    
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-10 bottom-4 w-0.5 bg-gray-100 sm:left-9"></div>

                    <div className="space-y-8">
                      {steps.map((step, index) => {
                        const statusState = getStepStatus(step.status, selectedRequest.status);
                        const Icon = step.icon;
                        
                        return (
                          <div key={index} className="relative flex gap-6 group">
                            {/* Step Indicator */}
                            <div className={`
                              relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 flex-shrink-0 transition-all duration-500
                              ${statusState === 'completed' ? 'bg-purple-600 border-purple-100 text-white' : 
                                statusState === 'current' ? 'bg-white border-purple-500 text-purple-600 shadow-lg ring-4 ring-purple-50 scale-110' : 
                                'bg-white border-gray-100 text-gray-300'}
                            `}>
                              <Icon size={18} strokeWidth={statusState === 'current' ? 2.5 : 2} />
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pt-1 ${statusState === 'upcoming' ? 'opacity-50' : 'opacity-100'}`}>
                              <div className="flex justify-between items-center mb-1">
                                <h4 className={`font-bold text-base ${statusState === 'current' ? 'text-purple-700' : 'text-gray-900'}`}>
                                  {step.label}
                                </h4>
                                {statusState === 'current' && (
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-purple-600 px-2 py-0.5 rounded-full animate-pulse">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 max-w-md">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Admin/Designer Comments Section */}
                {selectedRequest.adminComments && selectedRequest.status !== 'Rejected' && (
                  <div className="mt-10 bg-amber-50 rounded-2xl p-6 border border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                        <MessageSquare size={18} />
                      </div>
                      <h4 className="font-bold text-amber-900">Note from Designer</h4>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-amber-100 text-gray-700 italic text-sm shadow-sm relative">
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-amber-100 transform rotate-45"></div>
                      "{selectedRequest.adminComments}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Sparkles className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Select a request</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-1">
                Click on a request from the list to view its tracking timeline and details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for the section header icon
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

export default TrackCustomRequest;