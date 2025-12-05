import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const TrackOrder = () => {
  const { user } = useContext(AuthContext);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const res = await axios.get(`/orders/find/${user.id}`);
        // Filter for active orders only (not delivered/cancelled)
        const active = res.data.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status));
        setActiveOrders(active);
        if (active.length > 0) setSelectedOrder(active[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveOrders();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId) return;
    // In a real app, you might fetch a specific order by ID here
    // For now, we filter the local list
    const found = activeOrders.find(o => o._id.includes(searchId));
    if (found) setSelectedOrder(found);
    else alert('Order not found in your active shipments');
  };

  const steps = [
    { status: 'Pending', label: 'Order Placed', icon: Clock },
    { status: 'Processing', label: 'Processing', icon: Package },
    { status: 'Shipped', label: 'Shipped', icon: Truck },
    { status: 'Delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getCurrentStep = (status) => {
    switch(status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const getStepStatus = (stepIndex, currentStep) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  if (loading) return <div className="p-8 text-center">Loading tracking details...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-3">
            Track Order
            <Truck className="w-6 h-6 text-jewel-gold" />
          </h1>
          <p className="text-gray-500 mt-1">Real-time updates on your shipments</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Enter Order ID" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold outline-none w-full md:w-64"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-900 mb-4">Active Shipments ({activeOrders.length})</h3>
          {activeOrders.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-500 border border-gray-200">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No active orders to track.</p>
            </div>
          ) : (
            activeOrders.map(order => (
              <div 
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedOrder?._id === order._id 
                    ? 'border-jewel-gold bg-amber-50 shadow-sm' 
                    : 'border-gray-200 hover:border-jewel-gold hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{order.items?.length || 1} items</span>
                  <span className={`font-medium ${
                    order.status === 'Shipped' ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tracking Details */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {/* Mock delivery date + 5 days */}
                    {new Date(new Date(selectedOrder.createdAt).setDate(new Date(selectedOrder.createdAt).getDate() + 5)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                  <p className="font-mono font-medium text-gray-900">VK-{selectedOrder._id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative px-4 py-8">
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-100 md:left-0 md:right-0 md:top-12 md:h-0.5 md:w-full"></div>
                <div className="flex flex-col md:flex-row justify-between gap-8 relative">
                  {steps.map((step, index) => {
                    const currentStep = getCurrentStep(selectedOrder.status);
                    const status = getStepStatus(index, currentStep);
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.label} className="flex md:flex-col items-center gap-4 md:gap-2 z-10">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                          ${status === 'completed' ? 'bg-green-500 border-green-100 text-white' : 
                            status === 'current' ? 'bg-jewel-gold border-amber-100 text-white scale-110' : 
                            'bg-white border-gray-100 text-gray-300'}
                        `}>
                          <Icon size={18} />
                        </div>
                        <div className="md:text-center">
                          <p className={`font-bold text-sm ${status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                            {step.label}
                          </p>
                          {status === 'current' && (
                            <p className="text-xs text-jewel-gold font-medium animate-pulse">In Progress</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200 flex gap-4 items-start">
                <MapPin className="text-gray-400 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Shipping Destination</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedOrder.shippingAddress}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl border-dashed p-12 text-center text-gray-400">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p>Select an order to view tracking details</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TrackOrder;