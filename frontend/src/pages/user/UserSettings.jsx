import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Lock, 
  Shield,
  Bell,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const UserSettings = () => {
  const { user, login } = useContext(AuthContext); // Assuming login updates context state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Populate form when user data is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear messages when user types
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Basic Validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setLoading(false);
      return;
    }

    try {
      // Use _id or id
      const userId = user._id || user.id;
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      };

      // Only add password if field is filled
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const res = await axios.put(`/users/${userId}`, updateData);
      
      // Update local context with new user data
      // Assuming res.data contains the updated user object
      // You might need to update the token or just the user state depending on your auth flow
      // login(localStorage.getItem('token'), res.data); 

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (err) {
      console.error('Update failed', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your personal information and security</p>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-jewel-gold to-amber-500"></div>
            <div className="px-6 pb-6 text-center relative">
              <div className="w-24 h-24 bg-white rounded-full p-1 mx-auto -mt-12 mb-4 shadow-md">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                <Shield size={12} />
                Verified Account
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell size={18} className="text-gray-400" /> Preferences
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-jewel-gold rounded border-gray-300 focus:ring-jewel-gold transition-all" />
                <span className="group-hover:text-gray-900">Email Notifications</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-jewel-gold rounded border-gray-300 focus:ring-jewel-gold transition-all" />
                <span className="group-hover:text-gray-900">Order Updates</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 text-jewel-gold rounded border-gray-300 focus:ring-jewel-gold transition-all" />
                <span className="group-hover:text-gray-900">SMS Alerts</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            <div className="p-6 md:p-8 space-y-8">
              {/* Personal Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <User size={20} className="text-jewel-gold" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold/20 focus:border-jewel-gold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="email" 
                        value={formData.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold/20 focus:border-jewel-gold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street, City, Zip"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold/20 focus:border-jewel-gold outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Lock size={20} className="text-jewel-gold" />
                  Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input 
                      type="password" 
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold/20 focus:border-jewel-gold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold/20 focus:border-jewel-gold outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
              <button 
                type="button" 
                onClick={() => window.location.reload()} // Simple reset
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-white transition-all font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default UserSettings;