import { useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Gem, 
  Crown, 
  Shield, 
  ArrowRight,
  Loader2,
  Calendar,
  Phone,
  MapPin,
  Gift,
  Award,
  Users,
  Facebook,
  Instagram,
  ChevronRight
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    phone: '',
    birthday: '',
    newsletter: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validation, setValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const passwordRequirements = [
    { id: 'minLength', label: 'At least 8 characters', met: validation.hasMinLength },
    { id: 'uppercase', label: 'One uppercase letter', met: validation.hasUppercase },
    { id: 'lowercase', label: 'One lowercase letter', met: validation.hasLowercase },
    { id: 'number', label: 'One number', met: validation.hasNumber },
    { id: 'special', label: 'One special character', met: validation.hasSpecialChar },
  ];

  const membershipBenefits = [
    { icon: <Gift size={20} />, title: 'Welcome Gift', description: '10% off your first purchase' },
    { icon: <Award size={20} />, title: 'Loyalty Points', description: 'Earn points on every purchase' },
    { icon: <Users size={20} />, title: 'VIP Access', description: 'Exclusive previews & events' },
    { icon: <Shield size={20} />, title: 'Priority Support', description: 'Dedicated customer service' },
  ];

  const validatePassword = (password) => {
    const validations = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    setValidation(validations);
    
    // Calculate strength (0-100)
    const metCount = Object.values(validations).filter(v => v).length;
    setPasswordStrength((metCount / 5) * 100);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (error) setError('');

    // Password validation
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 60) {
      setError('Please use a stronger password');
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        birthday: formData.birthday || undefined,
        newsletter: formData.newsletter,
        registrationSource: 'website',
        joinDate: new Date().toISOString()
      };

      const res = await axios.post('/auth/register', registrationData);
      
      // Auto-login after registration
      login(res.data.token, res.data.user);
      
      setSuccess('Welcome to Venkateshwara Fine Jewelry! Your account has been created.');
      
      // Redirect after delay
      setTimeout(() => {
        navigate(from, { 
          replace: true,
          state: { 
            showWelcome: true,
            welcomeGift: '10% off your first purchase'
          }
        });
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (strength) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (strength) => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Fair';
    if (strength < 90) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 items-center">
        
        {/* Left Side - Benefits */}
        <div className="lg:w-1/2">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-16 h-16 bg-gradient-to-br from-jewel-gold to-amber-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                <Crown className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">Join Our Family</h1>
                <p className="text-sm text-gray-500">Become a member of Venkateshwara Fine Jewelry</p>
              </div>
            </Link>
          </div>

          <div className="hidden lg:block space-y-6">
            {/* Membership Benefits */}
            <div className="bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-2xl p-8 border border-jewel-gold/20">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="text-jewel-gold" size={24} />
                Membership Benefits
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {membershipBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-jewel-gold shadow-sm">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{benefit.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="text-jewel-gold" size={20} />
                What Our Members Say
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">JM</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Jennifer M.</p>
                    <p className="text-xs text-gray-500 mb-2">Member since 2022</p>
                    <p className="text-sm text-gray-600 italic">
                      "The VIP previews and personal consultations are unmatched. Truly a luxury experience."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <Shield className="text-green-500" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900">Secure Registration</h3>
                  <p className="text-sm text-gray-600">
                    Your information is protected with 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:w-1/2 max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-center">
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Create Your Account</h2>
              <p className="text-gray-300 text-sm">Join our community of jewelry enthusiasts</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-slideDown">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-green-700 text-sm font-medium">{success}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-slideDown">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={20} />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <User size={16} />
                    Full Name *
                  </span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Mail size={16} />
                    Email Address *
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

              {/* Optional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Phone size={16} />
                      Phone Number
                    </span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(123) 456-7890"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      Birthday
                    </span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Lock size={16} />
                    Password *
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength < 40 ? 'text-red-600' :
                        passwordStrength < 70 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getStrengthColor(passwordStrength)} transition-all duration-500`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-1">
                    {passwordRequirements.map((req) => (
                      <div key={req.id} className="flex items-center gap-2">
                        {req.met ? (
                          <CheckCircle size={12} className="text-green-500" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                        )}
                        <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Newsletter Opt-in */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleChange}
                  id="newsletter"
                  className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold mt-1"
                  disabled={isLoading}
                />
                <label htmlFor="newsletter" className="text-sm text-gray-700">
                  I want to receive exclusive offers, new collection previews, and jewelry care tips via email.
                </label>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  required
                  id="terms"
                  className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold mt-1"
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-jewel-gold hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-jewel-gold hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-jewel-gold to-amber-500 text-white py-4 rounded-xl font-bold hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Social Signup (Placeholder) */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center mb-3">Or sign up with</p>
                <div className="flex gap-3">
                  <button
                    type="button"
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
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Facebook size={20} className="text-blue-600" />
                    Facebook
                  </button>
                </div>
              </div>
            </form>

            {/* Login Link */}
            <div className="p-6 border-t border-gray-200 text-center bg-gray-50">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-jewel-gold hover:text-amber-600 font-bold transition-colors duration-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile Benefits */}
          <div className="lg:hidden mt-6">
            <div className="bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="text-jewel-gold" size={20} />
                Join and Get 10% Off Your First Purchase
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {membershipBenefits.slice(0, 2).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-jewel-gold">
                      {benefit.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{benefit.title}</p>
                    </div>
                  </div>
                ))}
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

export default Register;