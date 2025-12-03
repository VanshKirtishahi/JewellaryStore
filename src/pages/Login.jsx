import { useState, useContext, useEffect } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Gem, 
  Crown, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  User,
  Facebook,
  Instagram,
  ArrowRight,
  Loader2
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Pre-fill email if coming from cart/checkout
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.success) {
      setSuccessMessage(location.state.success);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post('/auth/login', {
        ...formData,
        rememberMe
      });
      
      login(res.data.token, res.data.user);
      
      // Show success message
      setSuccessMessage('Welcome back! Redirecting...');
      
      // Redirect after delay
      setTimeout(() => {
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      }, 1000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Invalid email or password';
      setError(errorMessage);
      
      // Clear form on specific errors
      if (err.response?.status === 401) {
        setFormData({ email: '', password: '' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      customer: { email: 'customer@demo.com', password: 'demo123' },
      admin: { email: 'admin@demo.com', password: 'admin123' }
    };
    
    setFormData(demoCredentials[role]);
    setError('');
  };

  const handleSocialLogin = (provider) => {
    // For now, just show a message
    alert(`In a real app, this would redirect to ${provider} authentication`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 items-center">
        
        {/* Left Side - Brand & Info */}
        <div className="lg:w-1/2 flex flex-col items-center lg:items-start">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-16 h-16 bg-gradient-to-br from-jewel-gold to-amber-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                <Crown className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">Venkateshwara</h1>
                <p className="text-sm text-gray-500">Fine Jewelry Since 1985</p>
              </div>
            </Link>
          </div>

          <div className="hidden lg:block max-w-lg">
            <div className="bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-2xl p-8 border border-jewel-gold/20">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="text-jewel-gold" size={24} />
                Welcome Back
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-jewel-gold/20 to-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="text-jewel-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Secure Access</h3>
                    <p className="text-gray-600 text-sm">
                      Your account is protected with 256-bit SSL encryption
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-jewel-gold/20 to-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Gem className="text-jewel-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Exclusive Benefits</h3>
                    <p className="text-gray-600 text-sm">
                      Access member-only offers, early previews, and personalized service
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">SM</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sarah M.</p>
                    <p className="text-sm text-gray-500">Gold Member</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The personal service and exquisite pieces keep me coming back. Truly exceptional!"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-center">
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Sign In to Your Account</h2>
              <p className="text-gray-300 text-sm">Access your orders, wishlist, and personalized recommendations</p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-slideDown">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-green-700 text-sm font-medium">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-slideDown">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={20} />
                  <div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                    {error.includes('Invalid') && (
                      <p className="text-red-600 text-xs mt-1">
                        Try: customer@demo.com / demo123
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-2">
                      <Lock size={16} />
                      Password
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-jewel-gold hover:text-amber-600 transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <div className="text-sm text-gray-500">
                  <Shield size={14} className="inline mr-1" />
                  Secure connection
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-jewel-gold to-amber-500 text-white py-4 rounded-xl font-bold hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Demo Accounts */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center mb-3">Try demo accounts:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('customer')}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    <User size={14} />
                    Customer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    <Crown size={14} />
                    Admin Demo
                  </button>
                </div>
              </div>

              {/* Social Login (Placeholder) */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center mb-3">Or continue with</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Facebook size={20} className="text-blue-600" />
                    Facebook
                  </button>
                </div>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="p-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-jewel-gold hover:text-amber-600 font-bold transition-colors duration-300"
                >
                  Create an account
                </Link>
              </p>
              <p className="text-xs text-gray-500 mt-3">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="underline hover:text-gray-700">Terms</Link> and{' '}
                <Link to="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>
              </p>
            </div>
          </div>

          {/* Mobile Features */}
          <div className="lg:hidden mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-xl p-4 text-center">
                <Shield className="w-8 h-8 text-jewel-gold mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Secure</p>
              </div>
              <div className="bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-xl p-4 text-center">
                <Gem className="w-8 h-8 text-jewel-gold mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Exclusive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;