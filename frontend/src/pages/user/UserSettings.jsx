import { useState, useContext } from 'react';
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
  Bell
} from 'lucide-react';

const UserSettings = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      // Assuming you have a PUT endpoint for updating users
      // If not, this is just the frontend implementation
      await axios.put(`/users/${user.id}`, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        // Only send password if user entered a new one
        ...(formData.newPassword ? { password: formData.newPassword } : {})
      });
      
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed', err);
      // alert('Failed to update profile'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile and security preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar / Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-jewel-gold to-amber-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              <Shield size={12} />
              Verified Customer
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell size={18} /> Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold" />
                Email Notifications
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold" />
                Order Updates
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold" />
                SMS Alerts
              </label>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            
            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-gray-400" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street, City, Zip"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            {/* Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={20} className="text-gray-400" />
                Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 flex items-center gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-jewel-gold text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                )}
              </button>
              {successMsg && (
                <span className="text-green-600 text-sm font-medium animate-fadeIn">{successMsg}</span>
              )}
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