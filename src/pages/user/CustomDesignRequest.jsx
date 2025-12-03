import { useState, useContext, useRef } from 'react';
import axios from '../../api/axios'; 
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Send, 
  Sparkles, 
  Gem, 
  Diamond, 
  Heart, 
  Crown, 
  Image as ImageIcon,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Palette,
  Scale,
  Ruler,
  Users,
  MessageSquare,
  Shield
} from 'lucide-react';

const CustomDesignRequest = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  const [formData, setFormData] = useState({
    description: '',
    budgetRange: '',
    jewelryType: '',
    metalType: '',
    gemstoneType: '',
    gemstoneSize: '',
    deadline: '',
    occasion: '',
    referenceImage: '',
    personalization: '',
    size: '',
    additionalNotes: ''
  });

  const jewelryTypes = [
    { value: 'ring', label: 'Ring', icon: <Gem size={16} /> },
    { value: 'necklace', label: 'Necklace', icon: <Heart size={16} /> },
    { value: 'earrings', label: 'Earrings', icon: <Sparkles size={16} /> },
    { value: 'bracelet', label: 'Bracelet', icon: <Diamond size={16} /> },
    { value: 'pendant', label: 'Pendant', icon: <Crown size={16} /> },
    { value: 'brooch', label: 'Brooch', icon: <Palette size={16} /> },
  ];

  const metalTypes = [
    'Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum', 'Sterling Silver', 'Palladium'
  ];

  const gemstoneTypes = [
    'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Pearl', 'Opal', 'Aquamarine', 'Tanzanite', 'Custom'
  ];

  const budgetRanges = [
    { value: '$500 - $1,000', label: '$500 - $1,000' },
    { value: '$1,000 - $2,500', label: '$1,000 - $2,500' },
    { value: '$2,500 - $5,000', label: '$2,500 - $5,000' },
    { value: '$5,000 - $10,000', label: '$5,000 - $10,000' },
    { value: '$10,000+', label: '$10,000+' },
    { value: 'custom', label: 'Custom Budget' },
  ];

  const occasions = [
    'Engagement', 'Wedding', 'Anniversary', 'Birthday', 'Graduation', 
    'Mother\'s Day', 'Valentine\'s Day', 'Christmas', 'Just Because'
  ];

  const steps = [
    { number: 1, title: 'Design Idea', description: 'Describe your vision' },
    { number: 2, title: 'Specifications', description: 'Choose materials & details' },
    { number: 3, title: 'Preferences', description: 'Add timeline & budget' },
    { number: 4, title: 'Review', description: 'Finalize your request' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // Convert to data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({ ...prev, referenceImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to submit a custom design request");
      navigate('/login', { state: { from: '/custom-request' } });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        ...formData,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        submittedAt: new Date().toISOString(),
        status: 'Submitted'
      };

      await axios.post('/custom', requestData);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting request:', err);
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (activeStep < 4) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, referenceImage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  Describe Your Dream Jewelry
                </span>
                <span className="text-xs text-gray-500 mt-1">Be as detailed as possible</span>
              </label>
              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 resize-none"
                placeholder="Describe your vision in detail... For example: 'I'm looking for a vintage-inspired engagement ring with a oval-cut diamond center stone, halo setting, and intricate filigree details on the band...'"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Palette size={16} />
                  Jewelry Type
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {jewelryTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, jewelryType: type.value }))}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                      formData.jewelryType === type.value
                        ? 'border-jewel-gold bg-gradient-to-br from-jewel-gold/10 to-amber-500/10'
                        : 'border-gray-200 hover:border-jewel-gold hover:bg-gray-50'
                    }`}
                  >
                    <span className={`${formData.jewelryType === type.value ? 'text-jewel-gold' : 'text-gray-600'}`}>
                      {type.icon}
                    </span>
                    <span className={`text-sm font-medium ${
                      formData.jewelryType === type.value ? 'text-jewel-gold' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Scale size={16} />
                    Metal Type
                  </span>
                </label>
                <select
                  name="metalType"
                  value={formData.metalType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                >
                  <option value="">Select Metal Type</option>
                  {metalTypes.map((metal) => (
                    <option key={metal} value={metal}>{metal}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Gem size={16} />
                    Gemstone Type
                  </span>
                </label>
                <select
                  name="gemstoneType"
                  value={formData.gemstoneType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                >
                  <option value="">Select Gemstone</option>
                  {gemstoneTypes.map((gem) => (
                    <option key={gem} value={gem}>{gem}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.gemstoneType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemstone Size/Details
                </label>
                <input
                  type="text"
                  name="gemstoneSize"
                  value={formData.gemstoneSize}
                  onChange={handleChange}
                  placeholder="e.g., 1 carat, 3mm, custom specifications"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personalization (Engravings, etc.)
              </label>
              <input
                type="text"
                name="personalization"
                value={formData.personalization}
                onChange={handleChange}
                placeholder="e.g., 'Forever & Always', initials, dates"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Ruler size={16} />
                  Size (if applicable)
                </span>
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g., Ring size 7, 18-inch chain length"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <DollarSign size={16} />
                  Budget Range
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {budgetRanges.map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, budgetRange: range.value }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      formData.budgetRange === range.value
                        ? 'border-jewel-gold bg-gradient-to-br from-jewel-gold/10 to-amber-500/10'
                        : 'border-gray-200 hover:border-jewel-gold hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      formData.budgetRange === range.value ? 'text-jewel-gold' : 'text-gray-700'
                    }`}>
                      {range.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    Desired Completion Date
                  </span>
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    Occasion
                  </span>
                </label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                >
                  <option value="">Select Occasion</option>
                  {occasions.map((occasion) => (
                    <option key={occasion} value={occasion}>{occasion}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <ImageIcon size={16} />
                  Reference Images
                </span>
                <span className="text-xs text-gray-500 mt-1">Upload or provide image URLs for inspiration</span>
              </label>
              
              <div className="space-y-4">
                {/* File Upload */}
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    previewImage ? 'border-jewel-gold' : 'border-gray-300 hover:border-jewel-gold hover:bg-gray-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 mb-1">Click to upload an image</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>

                {/* Image Preview */}
                {previewImage && (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* URL Input */}
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="referenceImage"
                    value={formData.referenceImage}
                    onChange={handleChange}
                    placeholder="Or paste an image URL here..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Review Your Request
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Jewelry Type</p>
                    <p className="font-medium">{jewelryTypes.find(t => t.value === formData.jewelryType)?.label || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget Range</p>
                    <p className="font-medium">{formData.budgetRange || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Metal Type</p>
                    <p className="font-medium">{formData.metalType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gemstone</p>
                    <p className="font-medium">{formData.gemstoneType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Occasion</p>
                    <p className="font-medium">{formData.occasion || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Desired Completion</p>
                    <p className="font-medium">{formData.deadline || 'Flexible'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                    {formData.description || 'No description provided'}
                  </p>
                </div>

                {formData.additionalNotes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Additional Notes</p>
                    <p className="text-gray-700">{formData.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any Additional Notes or Special Instructions
              </label>
              <textarea
                name="additionalNotes"
                rows="3"
                value={formData.additionalNotes}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 resize-none"
                placeholder="Add any final thoughts, preferences, or questions for our designers..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">Request Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for sharing your vision with us. Our master jewelers will review your request 
            and get back to you within 2-3 business days with a custom quote.
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Request ID</span>
                <span className="font-mono font-bold text-gray-900">#{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estimated Response</span>
                <span className="font-medium text-gray-900">2-3 business days</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-jewel-gold to-amber-500 text-white py-3 rounded-xl font-bold hover:from-amber-500 hover:to-jewel-gold transition-all duration-300"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-jewel-gold to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900">Custom Jewelry Design</h1>
              <p className="text-gray-600 mt-2">Bring your dream piece to life with our master artisans</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center relative z-10">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 transition-all duration-300
                  ${activeStep >= step.number 
                    ? 'bg-gradient-to-br from-jewel-gold to-amber-500 border-transparent text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                  ${activeStep === step.number ? 'scale-110 shadow-lg' : ''}
                `}>
                  {activeStep > step.number ? <CheckCircle size={18} /> : step.number}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${activeStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
                )}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-jewel-gold to-amber-500 transition-all duration-500"
              style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-2">
                Step {activeStep}: {steps[activeStep - 1]?.title}
              </h2>
              <p className="text-gray-300">{steps[activeStep - 1]?.description}</p>
            </div>
            <div className="absolute top-0 right-0 opacity-10">
              <Sparkles size={120} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                disabled={activeStep === 1}
              >
                Back
              </button>

              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl font-bold hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 flex items-center gap-2"
                >
                  Continue
                  <Send size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-emerald-500 hover:to-green-500 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Submit Request
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-2xl p-6 border border-jewel-gold/20">
          <h3 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="text-jewel-gold" size={20} />
            Why Choose Our Custom Design Service
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Gem size={20} />, title: 'Master Artisans', desc: '20+ years of craftsmanship' },
              { icon: <Shield size={20} />, title: 'Quality Guarantee', desc: 'Lifetime warranty' },
              { icon: <Clock size={20} />, title: 'Personalized Timeline', desc: 'Regular updates & communication' },
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-jewel-gold">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Animation */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <Upload className="w-12 h-12 text-jewel-gold mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading Image</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-jewel-gold to-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDesignRequest;