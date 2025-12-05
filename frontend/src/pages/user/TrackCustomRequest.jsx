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
  ChevronRight
} from 'lucide-react';

const TrackCustomRequest = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`/custom/user/${user.id}`);
        // Sort by newest first
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRequests(sorted);
        if (sorted.length > 0) setSelectedRequest(sorted[0]);
      } catch (err) {
        console.error("Error fetching custom requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const found = requests.find(r => 
      r._id.includes(searchQuery) || 
      r.jewelryType.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) setSelectedRequest(found);
  };

  // Timeline Steps Logic
  const steps = [
    { status: 'Submitted', label: 'Request Received', icon: PenTool },
    { status: 'Under Review', label: 'Under Review', icon: Clock },
    { status: 'Quote Sent', label: 'Quote Ready', icon: DollarSign },
    { status: 'Approved', label: 'Design Approved', icon: CheckCircle },
    { status: 'In Production', label: 'In Production', icon: Hammer },
    { status: 'Completed', label: 'Ready for Delivery', icon: Gem },
  ];

  const getStepStatus = (stepStatus, currentStatus) => {
    const statusOrder = ['Submitted', 'Under Review', 'Quote Sent', 'Approved', 'In Production', 'Completed'];
    
    if (currentStatus === 'Rejected') return 'rejected';

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (currentIndex === -1) return 'upcoming'; // Fallback for unknown statuses
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading your requests...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-3">
            Track Custom Design
            <Sparkles className="w-6 h-6 text-purple-500" />
          </h1>
          <p className="text-gray-500 mt-1">Follow the journey of your masterpiece</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Request ID or Type" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-full md:w-72"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Request List (Sidebar) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-900 mb-2">Your Requests ({requests.length})</h3>
          {requests.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-xl text-center border border-gray-200 border-dashed">
              <PenTool className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">No custom requests yet.</p>
              <button onClick={() => window.location.href='/custom-request'} className="mt-3 text-purple-600 font-medium hover:underline">Start a design</button>
            </div>
          ) : (
            requests.map(req => (
              <div 
                key={req._id}
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedRequest?._id === req._id 
                    ? 'border-purple-500 bg-purple-50/50' 
                    : 'border-gray-200 bg-white hover:border-purple-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-gray-900 block">{req.jewelryType || 'Custom Jewelry'}</span>
                    <span className="text-xs text-gray-500 font-mono">#{req._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex justify-between items-end text-sm">
                   <span className="text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                   <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tracking Details (Main Area) */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 pb-6 border-b border-gray-100">
                <div className="flex gap-4">
                  {selectedRequest.referenceImage ? (
                    <img 
                      src={selectedRequest.referenceImage} 
                      alt="Reference" 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <Gem size={24} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedRequest.jewelryType} Design</h2>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-md">
                      "{selectedRequest.description}"
                    </p>
                  </div>
                </div>
                
                {selectedRequest.quoteAmount && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Estimated Quote</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(selectedRequest.quoteAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {selectedRequest.status === 'Rejected' ? (
                <div className="p-6 bg-red-50 rounded-xl border border-red-100 flex items-center gap-4 text-red-700">
                  <XCircle size={32} />
                  <div>
                    <h3 className="font-bold">Request Rejected</h3>
                    <p className="text-sm mt-1">{selectedRequest.adminComments || 'Your request could not be processed at this time.'}</p>
                  </div>
                </div>
              ) : (
                <div className="relative px-4 py-8">
                   {/* Connecting Line */}
                  <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-100 md:left-0 md:right-0 md:top-10 md:h-0.5 md:w-full"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between gap-8 relative">
                    {steps.map((step, index) => {
                      const statusState = getStepStatus(step.status, selectedRequest.status);
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.label} className="flex md:flex-col items-center gap-4 md:gap-3 z-10">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                            ${statusState === 'completed' ? 'bg-purple-600 border-purple-100 text-white' : 
                              statusState === 'current' ? 'bg-white border-purple-500 text-purple-600 scale-110 shadow-lg ring-4 ring-purple-50' : 
                              'bg-white border-gray-100 text-gray-300'}
                          `}>
                            <Icon size={18} />
                          </div>
                          <div className="md:text-center">
                            <p className={`font-bold text-sm ${statusState === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                              {step.label}
                            </p>
                            {statusState === 'current' && (
                              <p className="text-xs text-purple-600 font-medium animate-pulse">Current Stage</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Designer Message Box */}
              {selectedRequest.adminComments && selectedRequest.status !== 'Rejected' && (
                <div className="mt-8 bg-amber-50 rounded-xl p-5 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2 text-amber-800 font-medium">
                    <MessageSquare size={18} />
                    Message from Designer
                  </div>
                  <p className="text-gray-700 text-sm italic">
                    "{selectedRequest.adminComments}"
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl border-dashed p-12 text-center text-gray-400">
              <Sparkles className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a request to track its progress</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Import Sparkles icon locally if needed or remove if already imported */}
      <div style={{ display: 'none' }}>
        {/* Hidden import reference helper */}
        <Sparkles />
      </div>
    </div>
  );
};

import { Sparkles } from 'lucide-react'; // Ensure this import exists at top

export default TrackCustomRequest;