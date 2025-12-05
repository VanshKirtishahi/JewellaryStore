import { useState, useContext, useRef, useEffect } from 'react';
import axios from '../api/axios'; 
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Send, 
  Sparkles, 
  Gem, 
  Heart, 
  Crown, 
  Image as ImageIcon,
  IndianRupee,
  Calendar,
  Clock,
  CheckCircle,
  X,
  Loader2,
  Palette,
  Scale,
  Ruler,
  Users,
  MessageSquare,
  Shield,
  Circle,
  AlertCircle,
  Star,
  TrendingUp,
  Award,
  Zap
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
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  
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

  // --- 1. INDIAN JEWELRY TYPES ---
  const jewelryTypes = [
    { value: 'ring', label: 'Ring / Anguthi', icon: <Gem size={16} />, popular: true },
    { value: 'necklace', label: 'Necklace / Haar', icon: <Heart size={16} />, popular: true },
    { value: 'mangalsutra', label: 'Mangalsutra', icon: <Crown size={16} />, popular: true },
    { value: 'earrings', label: 'Earrings / Jhumka', icon: <Sparkles size={16} />, popular: true },
    { value: 'bangles', label: 'Bangles / Kadas', icon: <Circle size={16} />, popular: true },
    { value: 'nosepin', label: 'Nose Pin / Nath', icon: <Palette size={16} />, popular: false },
    { value: 'maangtikka', label: 'Maang Tikka', icon: <Crown size={16} />, popular: false },
    { value: 'bracelet', label: 'Bracelet', icon: <Palette size={16} />, popular: false },
    { value: 'set', label: 'Bridal Set', icon: <Users size={16} />, popular: true },
    { value: 'anklet', label: 'Anklet / Payal', icon: <Circle size={16} />, popular: false },
  ];

  // --- 2. INDIAN METAL PREFERENCES ---
  const metalTypes = [
    '22K Yellow Gold (916 Hallmarked)',
    '22K Rose Gold',
    '18K Diamond Gold',
    'Platinum (950)',
    'Temple Jewelry (Antique Finish)',
    'Kundan / Polki Setting',
    'Silver (925 Sterling)',
    'White Gold',
    'Diamond-studded Gold'
  ];

  // --- 3. GEMSTONES ---
  const gemstoneTypes = [
    'Diamond (Solitaire)',
    'Polki (Uncut Diamond)',
    'Ruby (Manik)',
    'Blue Sapphire (Neelam)',
    'Yellow Sapphire (Pukhraj)',
    'Emerald (Panna)',
    'Pearl (Moti)',
    'Coral (Moonga)',
    'Navratna (9 Gems)',
    'Kundan Work',
    'None / Plain Gold'
  ];

  // --- 4. BUDGET RANGES IN INR ---
  const budgetRanges = [
    { value: '₹15,000 - ₹30,000', label: '₹15k - ₹30k', popular: true },
    { value: '₹30,000 - ₹50,000', label: '₹30k - ₹50k', popular: true },
    { value: '₹50,000 - ₹1 Lakh', label: '₹50k - ₹1L', popular: true },
    { value: '₹1 Lakh - ₹2.5 Lakh', label: '₹1L - ₹2.5L', popular: false },
    { value: '₹2.5 Lakh - ₹5 Lakh', label: '₹2.5L - ₹5L', popular: false },
    { value: '₹5 Lakh+', label: '₹5 Lakh+', popular: false },
  ];

  // --- 5. INDIAN OCCASIONS ---
  const occasions = [
    'Wedding / Bridal',
    'Engagement / Roka',
    'Anniversary',
    'Diwali / Dhanteras',
    'Akshaya Tritiya',
    'Karva Chauth',
    'Birthday',
    'New Born / Naming Ceremony',
    'Daily Wear',
    'Investment / Heirloom',
    'Festival Gifting',
    'Housewarming'
  ];

  const steps = [
    { number: 1, title: 'Design Idea', description: 'Describe your vision' },
    { number: 2, title: 'Specifications', description: 'Metals & Stones' },
    { number: 3, title: 'Preferences', description: 'Timeline & Budget' },
    { number: 4, title: 'Review', description: 'Finalize request' },
  ];

  // Stats showing process
  const processStats = [
    { number: '48', label: 'Hours Response', icon: <Clock className="w-4 h-4" /> },
    { number: '100%', label: 'Handcrafted', icon: <Award className="w-4 h-4" /> },
    { number: '5', label: 'Revisions', icon: <TrendingUp className="w-4 h-4" /> },
    { number: '35+', label: 'Years Expertise', icon: <Zap className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/custom-request',
          message: 'Please login to submit a custom design request' 
        } 
      });
    }
  }, [user, navigate]);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.description.trim()) {
          newErrors.description = 'Please describe your design idea';
        }
        if (!formData.jewelryType) {
          newErrors.jewelryType = 'Please select jewelry type';
        }
        break;
      
      case 2:
        if (!formData.metalType) {
          newErrors.metalType = 'Please select metal type';
        }
        // Removed mandatory check for gemstone size if type is selected to make it easier
        break;
      
      case 3:
        if (!formData.budgetRange) {
          newErrors.budgetRange = 'Please select budget range';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, referenceImage: 'Please upload an image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, referenceImage: 'Image size should be less than 5MB' }));
        return;
      }

      setSelectedFile(file); // Store the file object
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 100);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({ ...prev, referenceImage: reader.result }));
        setErrors(prev => ({ ...prev, referenceImage: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Create FormData object
      const data = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        // Don't append the base64 string if we have a file object, unless you handle base64 on backend
        if (key !== 'referenceImage') {
             data.append(key, formData[key]);
        }
      });

      // Append User Data
      data.append('userId', user.id);
      data.append('userName', user.name);
      data.append('userEmail', user.email);
      data.append('submittedAt', new Date().toISOString());
      data.append('status', 'Submitted');
      data.append('referenceNumber', `CUST${Date.now().toString().slice(-6)}`);

      // Append the File (if exists)
      if (selectedFile) {
        data.append('referenceImage', selectedFile);
      }

      await axios.post('/custom', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting request:', err);
      setErrors(prev => ({ 
        ...prev, 
        submit: 'There was an error submitting your request. Please try again.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => { 
    if (validateStep(activeStep) && activeStep < 4) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => { 
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, referenceImage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, jewelryType: type }));
    if (errors.jewelryType) {
      setErrors(prev => ({ ...prev, jewelryType: '' }));
    }
  };

  const handleBudgetSelect = (range) => {
    setFormData(prev => ({ ...prev, budgetRange: range }));
    if (errors.budgetRange) {
      setErrors(prev => ({ ...prev, budgetRange: '' }));
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Popular Jewelry Types */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    <Palette size={16} />
                    Select Jewelry Type
                  </span>
                </label>
                <span className="text-xs text-gray-500">Click to select</span>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-600">Most Popular Designs</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {jewelryTypes.filter(type => type.popular).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleTypeSelect(type.value)}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-md ${
                        formData.jewelryType === type.value
                          ? 'border-jewel-gold bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 shadow-sm'
                          : 'border-gray-200 hover:border-jewel-gold'
                      }`}
                    >
                      <span className={`${formData.jewelryType === type.value ? 'text-jewel-gold' : 'text-gray-600'}`}>
                        {type.icon}
                      </span>
                      <span className={`text-xs font-medium text-center ${
                        formData.jewelryType === type.value ? 'text-jewel-gold' : 'text-gray-700'
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* All Types */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {jewelryTypes.filter(type => !type.popular).map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeSelect(type.value)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-md ${
                      formData.jewelryType === type.value
                        ? 'border-jewel-gold bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 shadow-sm'
                        : 'border-gray-200 hover:border-jewel-gold'
                    }`}
                  >
                    <span className={`${formData.jewelryType === type.value ? 'text-jewel-gold' : 'text-gray-600'}`}>
                      {type.icon}
                    </span>
                    <span className={`text-xs font-medium text-center ${
                      formData.jewelryType === type.value ? 'text-jewel-gold' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.jewelryType && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.jewelryType}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  Describe Your Vision
                </span>
                <span className="text-xs text-gray-500 mt-1 block">
                  Be descriptive (e.g., "Heavy Kundan set for wedding" or "Lightweight gold chain for daily use")
                </span>
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Example: 'I want a traditional South Indian temple jewelry necklace with heavy ruby and emerald stones, antique gold finish...'"
                required
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.description}
                </p>
              )}
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
                    Metal Preference *
                  </span>
                </label>
                <select
                  name="metalType"
                  value={formData.metalType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 ${
                    errors.metalType ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Preferred Metal</option>
                  {metalTypes.map((metal) => (
                    <option key={metal} value={metal}>{metal}</option>
                  ))}
                </select>
                {errors.metalType && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.metalType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Gem size={16} />
                    Gemstone / Stone
                  </span>
                </label>
                <select
                  name="gemstoneType"
                  value={formData.gemstoneType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                >
                  <option value="">Select Gemstone (Optional)</option>
                  {gemstoneTypes.map((gem) => (
                    <option key={gem} value={gem}>{gem}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.gemstoneType && formData.gemstoneType !== 'None / Plain Gold' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stone Details (Recommended)
                  <span className="text-xs text-gray-500 ml-2">e.g., Carat/Ratti, Clarity, Cut</span>
                </label>
                <input
                  type="text"
                  name="gemstoneSize"
                  value={formData.gemstoneSize}
                  onChange={handleChange}
                  placeholder="e.g., 1 Carat VVS Diamond, or 5 Ratti Certified Ruby"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 ${
                    errors.gemstoneSize ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Ruler size={16} />
                    Size (if applicable)
                  </span>
                  <span className="text-xs text-gray-500">Ring size, chain length, bangle diameter</span>
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="e.g., Ring Size 12, Chain 18 inch, Bangle 2-6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personalization / Engraving
                  <span className="text-xs text-gray-500 ml-2">Names, dates, or special text</span>
                </label>
                <input
                  type="text"
                  name="personalization"
                  value={formData.personalization}
                  onChange={handleChange}
                  placeholder="e.g., 'Family Name' or '15-02-2024'"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="additionalNotes"
                rows="3"
                value={formData.additionalNotes}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 resize-none"
                placeholder="Any special requirements, allergies to metals, or specific design references..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Budget Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    <IndianRupee size={16} />
                    Budget Range *
                  </span>
                </label>
                <span className="text-xs text-gray-500">Select one</span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-600">Popular Budget Ranges</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {budgetRanges.filter(range => range.popular).map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => handleBudgetSelect(range.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                        formData.budgetRange === range.value
                          ? 'border-jewel-gold bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 shadow-sm'
                          : 'border-gray-200 hover:border-jewel-gold'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        formData.budgetRange === range.value ? 'text-jewel-gold' : 'text-gray-700'
                      }`}>
                        {range.label}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Starting from</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {budgetRanges.filter(range => !range.popular).map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => handleBudgetSelect(range.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                      formData.budgetRange === range.value
                        ? 'border-jewel-gold bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 shadow-sm'
                        : 'border-gray-200 hover:border-jewel-gold'
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
              {errors.budgetRange && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.budgetRange}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    Needed By Date
                  </span>
                  <span className="text-xs text-gray-500">When do you need this ready?</span>
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <ImageIcon size={16} />
                  Reference Images (Optional)
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Upload photos or paste links of designs you like
                </span>
              </label>
              
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group ${
                    previewImage || errors.referenceImage 
                      ? 'border-jewel-gold' 
                      : 'border-gray-300 hover:border-jewel-gold hover:bg-gray-50'
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
                  <div className="w-16 h-16 bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">Click to upload design images</p>
                  <p className="text-xs text-gray-500">Supports JPG, PNG (Max 5MB)</p>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-jewel-gold h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                </div>

                {previewImage && (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 w-full max-w-xs mx-auto">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {errors.referenceImage && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.referenceImage}
                  </p>
                )}

                <input
                  type="text"
                  name="referenceImage"
                  value={formData.referenceImage}
                  onChange={handleChange}
                  placeholder="Or paste an image URL (Pinterest, Instagram, etc.)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Request Summary
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Jewelry Type</p>
                    <p className="font-medium text-gray-900">
                      {jewelryTypes.find(t => t.value === formData.jewelryType)?.label || '-'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Budget Range</p>
                    <p className="font-medium text-gray-900">{formData.budgetRange || '-'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Metal Type</p>
                    <p className="font-medium text-gray-900">{formData.metalType || '-'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Gemstone</p>
                    <p className="font-medium text-gray-900">{formData.gemstoneType || 'None'}</p>
                  </div>
                </div>
                
                {formData.gemstoneSize && (
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Stone Details</p>
                    <p className="font-medium text-gray-900">{formData.gemstoneSize}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Occasion</p>
                    <p className="font-medium text-gray-900">{formData.occasion || '-'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-medium text-gray-900">{formData.deadline ? new Date(formData.deadline).toLocaleDateString() : 'Flexible'}</p>
                  </div>
                </div>
                
                {formData.size && (
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="font-medium text-gray-900">{formData.size}</p>
                  </div>
                )}
                
                {formData.personalization && (
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Personalization</p>
                    <p className="font-medium text-gray-900">{formData.personalization}</p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-500 text-sm mb-2">Your Design Description</p>
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {formData.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {formData.additionalNotes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-500 text-sm mb-2">Additional Notes</p>
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {formData.additionalNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Process Stats */}
            <div className="bg-gradient-to-r from-jewel-gold/5 to-amber-500/5 rounded-xl p-6 border border-jewel-gold/20">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Zap size={16} className="text-jewel-gold" />
                Our Custom Process
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {processStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
              <div className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium mb-1">What Happens Next?</p>
                  <p>
                    1. <strong>Within 48 hours:</strong> Our master jeweler will review your design<br />
                    2. <strong>You'll receive:</strong> A custom quote and initial sketch<br />
                    3. <strong>Design approval:</strong> 3D renderings and material samples<br />
                    4. <strong>Craftsmanship:</strong> Handcrafting by our artisans<br />
                    5. <strong>Delivery:</strong> Insured shipping and certification
                  </p>
                </div>
              </div>
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
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Request Received!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your custom design request. Our master jeweler will review your requirements 
            and contact you within 48 hours with a custom quote.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/user/dashboard')}
              className="w-full bg-gradient-to-r from-jewel-gold to-amber-500 text-white py-3 rounded-xl font-bold hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 shadow-md"
            >
              Track in Dashboard
            </button>
            <button
              onClick={() => navigate('/collections')}
              className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Browse Collections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/20 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Custom Jewelry Design</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Create your dream piece with our master artisans. Fill out the form below and we'll bring your vision to life.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4 relative">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center gap-4 z-10 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300
                  ${activeStep > step.number 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : activeStep === step.number
                    ? 'bg-jewel-gold border-jewel-gold text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  {activeStep > step.number ? <CheckCircle size={18} /> : step.number}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    activeStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-amber-50/30 px-8 py-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">{steps[activeStep - 1].title}</h2>
              <span className="text-xs font-medium bg-white px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 shadow-sm">
                Step {activeStep} of {steps.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{steps[activeStep - 1].description}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            {renderStepContent()}

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.submit}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={prevStep}
                disabled={activeStep === 1}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeStep === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                ← Back
              </button>

              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  Continue <Send size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Shield size={16} /> Submit Custom Request
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-jewel-gold/5 to-amber-500/5 rounded-2xl p-6 border border-jewel-gold/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-2/3">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm">
                Our jewelry experts are here to assist you. Contact us for personalized guidance 
                on your custom design or schedule a video consultation.
              </p>
            </div>
            <div className="md:w-1/3 flex gap-3">
              <button
                onClick={() => navigate('/contact')}
                className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 text-sm"
              >
                Contact Us
              </button>
              <button
                onClick={() => window.open('tel:+911234567890')}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl font-medium hover:shadow-md transition-all duration-300 text-sm"
              >
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDesignRequest;