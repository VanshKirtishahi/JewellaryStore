import { useState, useContext, useRef, useEffect } from 'react';
import axios from '../api/axios'; 
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Send, Sparkles, Gem, Heart, Crown, Image as ImageIcon,
  IndianRupee, Calendar, Clock, CheckCircle, X, Loader2, Palette,
  Scale, Ruler, Users, MessageSquare, Shield, Circle, AlertCircle,
  Star, TrendingUp, Award, Zap
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
    description: '', budgetRange: '', jewelryType: '', metalType: '',
    gemstoneType: '', gemstoneSize: '', deadline: '', occasion: '',
    referenceImage: '', personalization: '', size: '', additionalNotes: ''
  });

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

  const metalTypes = ['22K Yellow Gold (916 Hallmarked)', '22K Rose Gold', '18K Diamond Gold', 'Platinum (950)', 'Temple Jewelry (Antique Finish)', 'Kundan / Polki Setting', 'Silver (925 Sterling)', 'White Gold', 'Diamond-studded Gold'];
  const gemstoneTypes = ['Diamond (Solitaire)', 'Polki (Uncut Diamond)', 'Ruby (Manik)', 'Blue Sapphire (Neelam)', 'Yellow Sapphire (Pukhraj)', 'Emerald (Panna)', 'Pearl (Moti)', 'Coral (Moonga)', 'Navratna (9 Gems)', 'Kundan Work', 'None / Plain Gold'];
  const budgetRanges = [
    { value: '₹15,000 - ₹30,000', label: '₹15k - ₹30k', popular: true },
    { value: '₹30,000 - ₹50,000', label: '₹30k - ₹50k', popular: true },
    { value: '₹50,000 - ₹1 Lakh', label: '₹50k - ₹1L', popular: true },
    { value: '₹1 Lakh - ₹2.5 Lakh', label: '₹1L - ₹2.5L', popular: false },
    { value: '₹2.5 Lakh - ₹5 Lakh', label: '₹2.5L - ₹5L', popular: false },
    { value: '₹5 Lakh+', label: '₹5 Lakh+', popular: false },
  ];
  const occasions = ['Wedding / Bridal', 'Engagement / Roka', 'Anniversary', 'Diwali / Dhanteras', 'Akshaya Tritiya', 'Karva Chauth', 'Birthday', 'New Born / Naming Ceremony', 'Daily Wear', 'Investment / Heirloom', 'Festival Gifting', 'Housewarming'];
  const steps = [{ number: 1, title: 'Design Idea', description: 'Describe your vision' }, { number: 2, title: 'Specifications', description: 'Metals & Stones' }, { number: 3, title: 'Preferences', description: 'Timeline & Budget' }, { number: 4, title: 'Review', description: 'Finalize request' }];
  const processStats = [{ number: '48', label: 'Hours Response', icon: <Clock className="w-4 h-4" /> }, { number: '100%', label: 'Handcrafted', icon: <Award className="w-4 h-4" /> }, { number: '5', label: 'Revisions', icon: <TrendingUp className="w-4 h-4" /> }, { number: '35+', label: 'Years Expertise', icon: <Zap className="w-4 h-4" /> }];

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/custom-request', message: 'Please login to submit a custom design request' } });
    }
  }, [user, navigate]);

  const validateStep = (step) => {
    const newErrors = {};
    switch(step) {
      case 1:
        if (!formData.description.trim()) newErrors.description = 'Please describe your design idea';
        if (!formData.jewelryType) newErrors.jewelryType = 'Please select jewelry type';
        break;
      case 2:
        if (!formData.metalType) newErrors.metalType = 'Please select metal type';
        break;
      case 3:
        if (!formData.budgetRange) newErrors.budgetRange = 'Please select budget range';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, referenceImage: 'Please upload an image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, referenceImage: 'Image size should be less than 5MB' }));
        return;
      }
      setSelectedFile(file);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
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
      const data = new FormData();
      // Only append text fields (not the preview base64)
      Object.keys(formData).forEach(key => {
        if (key !== 'referenceImage' && formData[key]) {
             data.append(key, formData[key]);
        }
      });

      // VITAL FIX: Use _id or id properly
      const userId = user._id || user.id; 
      data.append('userId', userId);
      data.append('userName', user.name || 'Anonymous');
      data.append('userEmail', user.email || '');
      data.append('submittedAt', new Date().toISOString());
      data.append('status', 'Submitted');
      data.append('referenceNumber', `CUST${Date.now().toString().slice(-6)}`);

      // Append File
      if (selectedFile) {
        data.append('referenceImage', selectedFile);
      }

      await axios.post('/custom', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowSuccess(true);
      setTimeout(() => { navigate('/user/dashboard'); }, 3000);
      
    } catch (err) {
      console.error('Error submitting request:', err);
      setErrors(prev => ({ ...prev, submit: 'There was an error submitting your request. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => { if (validateStep(activeStep) && activeStep < 4) { setActiveStep(activeStep + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const prevStep = () => { if (activeStep > 1) { setActiveStep(activeStep - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const handleRemoveImage = () => { setPreviewImage(null); setSelectedFile(null); setFormData(prev => ({ ...prev, referenceImage: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; };
  const handleTypeSelect = (type) => { setFormData(prev => ({ ...prev, jewelryType: type })); if (errors.jewelryType) setErrors(prev => ({ ...prev, jewelryType: '' })); };
  const handleBudgetSelect = (range) => { setFormData(prev => ({ ...prev, budgetRange: range })); if (errors.budgetRange) setErrors(prev => ({ ...prev, budgetRange: '' })); };

  // Render content logic
  const renderStepContent = () => {
    switch (activeStep) {
      case 1: return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2"><label className="block text-sm font-medium text-gray-700"><span className="flex items-center gap-2"><Palette size={16} />Select Jewelry Type</span></label><span className="text-xs text-gray-500">Click to select</span></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">{jewelryTypes.filter(type => type.popular).map((type) => (<button key={type.value} type="button" onClick={() => handleTypeSelect(type.value)} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-md ${formData.jewelryType === type.value ? 'border-jewel-gold bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 shadow-sm' : 'border-gray-200 hover:border-jewel-gold'}`}><span className={`${formData.jewelryType === type.value ? 'text-jewel-gold' : 'text-gray-600'}`}>{type.icon}</span><span className={`text-xs font-medium text-center ${formData.jewelryType === type.value ? 'text-jewel-gold' : 'text-gray-700'}`}>{type.label}</span></button>))}</div>
              {errors.jewelryType && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.jewelryType}</p>)}
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="flex items-center gap-2"><MessageSquare size={16} />Describe Your Vision</span></label><textarea name="description" rows="4" value={formData.description} onChange={handleChange} className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'}`} placeholder="Example: 'I want a traditional South Indian temple jewelry necklace...'" required />{errors.description && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.description}</p>)}</div>
          </div>
        );
      case 2: return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="flex items-center gap-2"><Scale size={16} />Metal Preference *</span></label><select name="metalType" value={formData.metalType} onChange={handleChange} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 ${errors.metalType ? 'border-red-300' : 'border-gray-300'}`} required><option value="">Select Preferred Metal</option>{metalTypes.map((metal) => (<option key={metal} value={metal}>{metal}</option>))}</select>{errors.metalType && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.metalType}</p>)}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="flex items-center gap-2"><Gem size={16} />Gemstone / Stone</span></label><select name="gemstoneType" value={formData.gemstoneType} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300"><option value="">Select Gemstone (Optional)</option>{gemstoneTypes.map((gem) => (<option key={gem} value={gem}>{gem}</option>))}</select></div>
            </div>
            {formData.gemstoneType && formData.gemstoneType !== 'None / Plain Gold' && (<div><label className="block text-sm font-medium text-gray-700 mb-2">Stone Details</label><input type="text" name="gemstoneSize" value={formData.gemstoneSize} onChange={handleChange} placeholder="e.g., 1 Carat VVS Diamond" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-jewel-gold" /></div>)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="flex items-center gap-2"><Ruler size={16} />Size</span></label><input type="text" name="size" value={formData.size} onChange={handleChange} placeholder="e.g., Ring Size 12" className="w-full px-4 py-3 border border-gray-300 rounded-xl" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Personalization</label><input type="text" name="personalization" value={formData.personalization} onChange={handleChange} placeholder="Engravings, etc." className="w-full px-4 py-3 border border-gray-300 rounded-xl" /></div></div>
          </div>
        );
      case 3: return (
          <div className="space-y-6">
            <div><div className="flex items-center justify-between mb-2"><label className="block text-sm font-medium text-gray-700"><span className="flex items-center gap-2"><IndianRupee size={16} />Budget Range *</span></label></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">{budgetRanges.map((range) => (<button key={range.value} type="button" onClick={() => handleBudgetSelect(range.value)} className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${formData.budgetRange === range.value ? 'border-jewel-gold bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 shadow-sm' : 'border-gray-200 hover:border-jewel-gold'}`}><span className={`text-sm font-medium ${formData.budgetRange === range.value ? 'text-jewel-gold' : 'text-gray-700'}`}>{range.label}</span></button>))}</div>{errors.budgetRange && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.budgetRange}</p>)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="flex items-center gap-2"><Calendar size={16} />Needed By</span></label><input type="date" name="deadline" value={formData.deadline} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-gray-300 rounded-xl" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="flex items-center gap-2"><Users size={16} />Occasion</span></label><select name="occasion" value={formData.occasion} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl"><option value="">Select Occasion</option>{occasions.map((o) => (<option key={o} value={o}>{o}</option>))}</select></div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="flex items-center gap-2"><ImageIcon size={16} />Reference Image</span></label><div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${previewImage ? 'border-jewel-gold' : 'border-gray-300 hover:border-jewel-gold'}`} onClick={() => fileInputRef.current?.click()}><input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" /><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Upload className="w-8 h-8 text-gray-600" /></div><p>Click to upload image</p></div>{previewImage && (<div className="relative mt-4 w-32 h-32 mx-auto"><img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg" /><button onClick={handleRemoveImage} type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button></div>)}</div>
          </div>
        );
      case 4: return (
          <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold flex items-center gap-2"><CheckCircle className="text-green-500"/> Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 block">Type</span> {jewelryTypes.find(t => t.value === formData.jewelryType)?.label}</div>
                <div><span className="text-gray-500 block">Budget</span> {formData.budgetRange}</div>
                <div><span className="text-gray-500 block">Metal</span> {formData.metalType}</div>
                <div><span className="text-gray-500 block">Gemstone</span> {formData.gemstoneType || 'None'}</div>
            </div>
            <div className="pt-4 border-t border-gray-200"><span className="text-gray-500 block text-xs">Description</span><p className="text-gray-800">{formData.description}</p></div>
          </div>
      );
      default: return null;
    }
  };

  if (showSuccess) return <div className="min-h-screen flex items-center justify-center"><div className="text-center p-8 bg-white rounded-xl shadow-lg"><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /><h2 className="text-2xl font-bold">Request Sent!</h2><p>We will contact you shortly.</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/20 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8"><h1 className="text-3xl font-bold mb-2">Custom Jewelry Design</h1><p className="text-gray-500">Bring your vision to life.</p></div>
        <div className="flex justify-between mb-8 px-4">{steps.map((step) => (<div key={step.number} className={`flex items-center gap-2 ${activeStep >= step.number ? 'text-jewel-gold' : 'text-gray-400'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${activeStep >= step.number ? 'border-jewel-gold bg-jewel-gold text-white' : 'border-gray-300'}`}>{step.number}</div><span className="hidden sm:inline font-medium">{step.title}</span></div>))}</div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            {errors.submit && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">{errors.submit}</div>}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button type="button" onClick={prevStep} disabled={activeStep === 1} className={`px-6 py-2 rounded-lg ${activeStep === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-50'}`}>Back</button>
              {activeStep < 4 ? <button type="button" onClick={nextStep} className="px-8 py-2 bg-gray-900 text-white rounded-lg">Continue</button> : <button type="submit" disabled={isSubmitting} className="px-8 py-2 bg-jewel-gold text-white rounded-lg flex items-center gap-2">{isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Submit Request</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomDesignRequest;