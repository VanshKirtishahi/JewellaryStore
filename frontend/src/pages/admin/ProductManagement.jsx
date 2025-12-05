import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Tag,
  BarChart3,
  TrendingUp,
  Sparkles,
  Gem,
  X,
  Image as ImageIcon,
  DollarSign,
  Hash,
  Grid,
  List,
  RefreshCw,
  Shield,
  Zap,
  TrendingDown,
  ArrowUpRight,
  Layers,
  ShoppingBag,
  Sparkle,
  Target,
  Crown,
  Award,
  Camera,
  ImagePlus,
  Loader2,
  CloudUpload,
  Check
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [statsVisible, setStatsVisible] = useState([false, false, false, false]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cloudinaryWidget, setCloudinaryWidget] = useState(null);

  // Stats state
  const [newProductsThisMonth, setNewProductsThisMonth] = useState(0);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '', material: '',
    gemstone: '', weight: '', dimensions: '', image: '', stock: '',
    sku: '', tags: '', featured: false, discount: ''
  });

  const categories = [
    'All Categories', 'Rings', 'Necklaces', 'Earrings', 'Bracelets',
    'Wedding', 'Engagement', 'Diamond', 'Gold', 'Silver', 'Platinum'
  ];

  const stockOptions = [
    { value: 'all', label: 'All Stock' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock (< 5)' },
    { value: 'out-of-stock', label: 'Out of Stock' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'stock-high', label: 'Stock: High to Low' },
  ];

  const materials = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold', 'Sterling Silver'];
  const gemstones = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Pearl', 'Opal', 'Amethyst', 'None'];

  // Cloudinary configuration
  const cloudinaryConfig = {
    cloudName: 'duworkvay', // Replace with your Cloudinary cloud name
    uploadPreset: 'JewellaryStore', // Create this in Cloudinary settings
    apiKey: 'QcAs7Nowa-JiAp-ImgE_Gzt5tSQ', // Your Cloudinary API key
    apiSecret: '521242554892816', // Your Cloudinary API secret
  };

  // Initialize Cloudinary Widget
  // Inside ProductManagement.jsx

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.cloudinary) {
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

          // DEBUG CHECK
          if (!cloudName || !uploadPreset) {
            console.error("❌ Cloudinary Env Vars Missing! Check .env file.");
            return;
          }

          const widget = window.cloudinary.createUploadWidget(
            {
              cloudName: cloudName, 
              uploadPreset: uploadPreset, 
              sources: ['local', 'url', 'camera'],
              multiple: false,
              folder: 'jewelry-store'
            },
            (error, result) => {
              if (!error && result && result.event === 'success') {
                handleCloudinarySuccess(result);
              }
            }
          );
          setCloudinaryWidget(widget);
        }
      };
    }
  }, []);

  const handleCloudinarySuccess = (result) => {
    const imageUrl = result.info.secure_url;
    setFormData(prev => ({ ...prev, image: imageUrl }));
    setImagePreview(imageUrl);
    setUploadingImage(false);
    setUploadProgress(100);

    // Reset progress after success
    setTimeout(() => {
      setUploadProgress(0);
    }, 1000);
  };

  const openCloudinaryWidget = () => {
    if (cloudinaryWidget) {
      cloudinaryWidget.open();
    } else {
      alert('Cloudinary uploader is not ready. Please try again.');
    }
  };

  // Alternative: Direct upload to Cloudinary using fetch API
  const uploadImageToCloudinary = async (file) => {
    setUploadingImage(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('cloud_name', cloudinaryConfig.cloudName);
    formData.append('folder', 'jewelry_products');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // Handle file input change
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, categoryFilter, stockFilter, sortBy]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setStatsVisible([true, false, false, false]), 100);
      setTimeout(() => setStatsVisible([true, true, false, false]), 200);
      setTimeout(() => setStatsVisible([true, true, true, false]), 300);
      setTimeout(() => setStatsVisible([true, true, true, true]), 400);
    }
  }, [loading]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/products');
      const data = res.data;
      setProducts(data);

      // Calculate "New Products This Month"
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const newCount = data.filter(p => {
        const d = new Date(p.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;

      setNewProductsThisMonth(newCount);

    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    switch (stockFilter) {
      case 'in-stock': filtered = filtered.filter(product => product.stock > 0); break;
      case 'low-stock': filtered = filtered.filter(product => product.stock > 0 && product.stock < 5); break;
      case 'out-of-stock': filtered = filtered.filter(product => product.stock === 0); break;
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'price-high': return (b.price || 0) - (a.price || 0);
        case 'price-low': return (a.price || 0) - (b.price || 0);
        case 'name-asc': return (a.title || '').localeCompare(b.title || '');
        case 'name-desc': return (b.title || '').localeCompare(a.title || '');
        case 'stock-high': return (b.stock || 0) - (a.stock || 0);
        default: return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'image' && !value.startsWith('data:')) {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate image
    if (!formData.image) {
      alert('Please upload an image for the product');
      return;
    }

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        discount: formData.discount ? Number(formData.discount) : 0,
        weight: formData.weight ? Number(formData.weight) : null,
        images: [formData.image],
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      if (editingProduct) {
        await axios.put(`/products/${editingProduct._id}`, payload);
        alert('Product updated successfully!');
      } else {
        await axios.post('/products', payload);
        alert('Product added successfully!');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(`Error ${editingProduct ? 'updating' : 'adding'} product`);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/products/${id}`);
      fetchProducts();
      setShowDeleteConfirm(null);
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsAddingProduct(true);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      material: product.material || '',
      gemstone: product.gemstone || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      image: product.images?.[0] || '',
      stock: product.stock || '',
      sku: product.sku || '',
      tags: product.tags?.join(', ') || '',
      featured: product.featured || false,
      discount: product.discount || ''
    });
    setImagePreview(product.images?.[0] || '');
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', price: '', category: '', material: '',
      gemstone: '', weight: '', dimensions: '', image: '', stock: '',
      sku: '', tags: '', featured: false, discount: ''
    });
    setImagePreview(null);
    setEditingProduct(null);
    setIsAddingProduct(false);
    setUploadingImage(false);
    setUploadProgress(0);
  };

  const toggleProductSelection = (id) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) setSelectedProducts([]);
    else setSelectedProducts(filteredProducts.map(p => p._id));
  };

  const bulkDelete = async () => {
    if (!selectedProducts.length) return;
    if (!window.confirm(`Delete ${selectedProducts.length} selected products?`)) return;
    try {
      await Promise.all(selectedProducts.map(id => axios.delete(`/products/${id}`)));
      setSelectedProducts([]);
      fetchProducts();
    } catch (err) {
      alert('Error deleting products');
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'red' };
    if (stock < 5) return { label: 'Low Stock', color: 'orange' };
    return { label: 'In Stock', color: 'green' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const statsCards = [
    {
      label: 'Total Products',
      value: products.length,
      subtext: `+${newProductsThisMonth} new this month`,
      icon: Package,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      iconColor: 'text-white',
      trend: 'up'
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0)),
      subtext: 'Total store value',
      icon: Crown,
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
      iconColor: 'text-white',
      trend: 'up'
    },
    {
      label: 'Out of Stock',
      value: products.filter(p => p.stock === 0).length,
      subtext: 'Needs restocking',
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
      iconBg: 'bg-gradient-to-br from-red-500 to-rose-500',
      iconColor: 'text-white',
      trend: products.filter(p => p.stock === 0).length > 5 ? 'up' : 'down'
    },
    {
      label: 'Featured Items',
      value: products.filter(p => p.featured).length,
      subtext: 'Premium collection',
      icon: Award,
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      iconColor: 'text-white',
      trend: 'up'
    },
  ];

  // Cloudinary Upload UI Component - Fixed
  const CloudinaryUploader = () => (
    <div className="space-y-4">
      {/* Main Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Camera className="w-4 h-4 text-jewel-gold" />
          Main Image *
        </label>

        {/* Upload Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Method 1: Cloudinary Widget */}
          <div
            onClick={openCloudinaryWidget}
            className={`
              border-2 border-dashed rounded-xl p-6 text-center cursor-pointer 
              transition-all duration-300 group hover:border-jewel-gold hover:shadow-lg
              ${imagePreview ? 'border-jewel-gold bg-gradient-to-br from-jewel-gold/5 to-amber-500/5' : 'border-gray-300 hover:bg-gray-50'}
              ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {uploadingImage ? (
              <div className="space-y-4">
                <div className="relative mx-auto w-16 h-16">
                  <Loader2 className="w-16 h-16 text-jewel-gold animate-spin" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium mb-2">Uploading Image...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-jewel-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{uploadProgress}% uploaded</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CloudUpload className="w-8 h-8 text-jewel-gold" />
                </div>
                <p className="text-gray-700 font-medium mb-2">Upload with Cloudinary</p>
                <p className="text-sm text-gray-500">Advanced upload with cropping</p>
              </>
            )}
          </div>

          {/* Method 2: File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-jewel-gold hover:bg-gray-50 transition-all duration-300">
            <label className="cursor-pointer block">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-gray-700 font-medium mb-2">Upload from Computer</p>
              <p className="text-sm text-gray-500">Simple file upload</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Image Preview:</p>
            <div className="relative rounded-lg overflow-hidden border-2 border-jewel-gold/30 w-full max-w-xs mx-auto">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full">
                <Check className="w-4 h-4" />
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Uploaded Successfully
              </div>
            </div>
          </div>
        )}

        {/* Manual URL Input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter image URL
          </label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/product-image.jpg"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Paste a direct image URL from any source
          </p>
        </div>
      </div>

      {/* Additional Images Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Images (Optional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              onClick={openCloudinaryWidget}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-jewel-gold hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group"
            >
              <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-jewel-gold mb-2" />
              <span className="text-xs text-gray-500">Add Image {index}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Add multiple images to showcase different angles
        </p>
      </div>

      {/* Image Guidelines */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-xl p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Image Guidelines
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>Use high-quality images (minimum 800x800px)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>White background recommended for better visibility</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>Show multiple angles and close-ups of details</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>Ensure proper lighting without harsh shadows</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-jewel-gold/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-30 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-200/50 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">Product Management</h1>
                <Sparkles className="w-6 h-6 text-jewel-gold animate-pulse" />
              </div>
              <p className="text-gray-600 lg:text-lg">Manage your premium jewelry inventory with precision</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-jewel-gold to-amber-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
              >
                {isAddingProduct ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden group bg-white rounded-2xl shadow-lg border border-gray-200/50
              hover:shadow-2xl hover:border-gray-300/50 transition-all duration-500
              transform ${statsVisible[index] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
              hover:scale-[1.02]
            `}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="relative p-5 lg:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 tracking-wide">{stat.label}</p>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                    {stat.value}
                  </h3>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg} shadow-md transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-bold">Live</span>
                  </div>
                  <span className="text-xs text-gray-500">Updated just now</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
              </div>
            </div>
            <div className={`h-1 ${stat.iconBg} transition-all duration-500 group-hover:h-1.5`}></div>
          </div>
        ))}
      </div>

      {/* Add/Edit Product Form */}
      {isAddingProduct && (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-jewel-gold/10 via-purple-500/10 to-cyan-500/10 blur-xl rounded-3xl opacity-0 animate-pulse"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 animate-slideDown overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-jewel-gold/5 via-purple-500/5 to-cyan-500/5 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-jewel-gold to-amber-500 flex items-center justify-center shadow-lg">
                    {editingProduct ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-gray-900">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {editingProduct ? 'Update your product details' : 'Add a new product to your collection'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Main Product Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-jewel-gold" />
                      Product Title *
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Diamond Solitaire Ring"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-jewel-gold" />
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the product features, quality, and unique selling points..."
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none resize-none transition-all duration-300 focus:shadow-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        Price (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-500" />
                        SKU *
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          placeholder="JWL-001"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        Stock Quantity *
                      </label>
                      <input
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="100"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-rose-500" />
                        Discount (%)
                      </label>
                      <input
                        name="discount"
                        type="number"
                        value={formData.discount}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Middle Column - Specifications */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-500" />
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.slice(1).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-600" />
                      Material *
                    </label>
                    <select
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                      required
                    >
                      <option value="">Select Material</option>
                      {materials.map((mat) => (
                        <option key={mat} value={mat}>{mat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Gem className="w-4 h-4 text-indigo-500" />
                      Gemstone
                    </label>
                    <select
                      name="gemstone"
                      value={formData.gemstone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                    >
                      <option value="">Select Gemstone</option>
                      {gemstones.map((gem) => (
                        <option key={gem} value={gem}>{gem}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column - Additional Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (g)
                      </label>
                      <input
                        name="weight"
                        type="number"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="0.0"
                        step="0.1"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions
                      </label>
                      <input
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleChange}
                        placeholder="e.g., 10x5x2 mm"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="diamond, gold, wedding, premium"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-xl border border-amber-200">
                    <input
                      id="featured"
                      name="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold focus:ring-offset-2"
                    />
                    <label htmlFor="featured" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Mark as Featured Product
                    </label>
                  </div>
                </div>
              </div>

              {/* Cloudinary Upload Section */}
              <div className="mb-8">
                <CloudinaryUploader />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Your data is securely stored and protected</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-jewel-gold to-amber-500 text-white font-medium shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading Image...
                      </>
                    ) : editingProduct ? (
                      <>
                        <Check className="w-5 h-5" />
                        Update Product
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Add Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left side: Search and View Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name, SKU, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all duration-300 ${viewMode === 'grid' ? 'bg-jewel-gold text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all duration-300 ${viewMode === 'list' ? 'bg-jewel-gold text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right side: Filters and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchProducts}
              className="p-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:rotate-180"
              title="Refresh Products"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-6 border border-gray-200 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat === 'All Categories' ? 'all' : cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${categoryFilter === (cat === 'All Categories' ? 'all' : cat)
                        ? 'bg-jewel-gold text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Stock Status
                </label>
                <div className="space-y-2">
                  {stockOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStockFilter(option.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 ${stockFilter === option.value
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <div className={`w-3 h-3 rounded-full ${stockFilter === option.value ? 'bg-jewel-gold' : 'bg-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none transition-all duration-300 bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Selected Products Actions */}
                {selectedProducts.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                          </p>
                          <p className="text-sm text-gray-600">Bulk actions available</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={bulkDelete}
                          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid/List View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-jewel-gold rounded-full animate-spin"></div>
            <Gem className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-jewel-gold" />
          </div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Loading your premium collection...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Start by adding your first product to the collection'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setStockFilter('all');
              setIsAddingProduct(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Add Your First Product
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const discountedPrice = product.discount
              ? product.price * (1 - product.discount / 100)
              : null;

            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-2xl hover:border-gray-300/50 transition-all duration-500 animate-fadeIn"
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/300x300?text=Jewelry'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.featured && (
                      <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-white" />
                        Featured
                      </div>
                    )}
                    {product.discount > 0 && (
                      <div className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Stock Status Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${stockStatus.color === 'green' ? 'bg-emerald-500 text-white' : stockStatus.color === 'orange' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {stockStatus.label}
                    </div>
                  </div>

                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => toggleProductSelection(product._id)}
                      className="w-5 h-5 rounded border-gray-300 text-jewel-gold focus:ring-jewel-gold focus:ring-offset-2"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-3 bg-white rounded-full shadow-lg hover:bg-jewel-gold hover:text-white transition-all duration-300 transform hover:scale-110"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(product._id)}
                        className="p-3 bg-white rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-3 bg-white rounded-full shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif font-bold text-gray-900 text-lg leading-tight line-clamp-2">
                      {product.title}
                    </h3>
                    {product.gemstone && product.gemstone !== 'None' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <Gem className="w-3 h-3 text-indigo-500" />
                        <span className="text-xs font-medium text-indigo-700">{product.gemstone}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-3">
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(discountedPrice || product.price)}
                        </span>
                        {discountedPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Package className="w-4 h-4" />
                        <span>{product.stock} units</span>
                      </div>
                    </div>

                    {/* Category & Material */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                          {product.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
                          {product.material}
                        </span>
                      </div>
                      <span className="text-gray-500 font-mono text-xs">
                        {product.sku}
                      </span>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                        {product.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {product.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                            +{product.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                <tr>
                  <th className="py-4 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={selectAllProducts}
                      className="w-4 h-4 rounded border-gray-300 text-jewel-gold focus:ring-jewel-gold focus:ring-offset-2"
                    />
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  const discountedPrice = product.discount
                    ? product.price * (1 - product.discount / 100)
                    : null;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => toggleProductSelection(product._id)}
                          className="w-4 h-4 rounded border-gray-300 text-jewel-gold focus:ring-jewel-gold focus:ring-offset-2"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            <img
                              src={product.images?.[0] || 'https://via.placeholder.com/300x300?text=Jewelry'}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{product.title}</h4>
                              {product.featured && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1 max-w-md">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {product.material}
                              </span>
                              {product.gemstone && product.gemstone !== 'None' && (
                                <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
                                  {product.gemstone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <code className="font-mono text-sm text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {product.sku}
                        </code>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">
                            {formatCurrency(discountedPrice || product.price)}
                          </span>
                          {discountedPrice && (
                            <span className="text-xs text-gray-500 line-through">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 min-w-[2.5rem]">
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${stockStatus.color === 'green' ? 'bg-emerald-50 text-emerald-700' : stockStatus.color === 'orange' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                          <div className={`w-2 h-2 rounded-full ${stockStatus.color === 'green' ? 'bg-emerald-500' : stockStatus.color === 'orange' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                          <span className="text-sm font-medium">{stockStatus.label}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(product._id)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <div className="text-sm text-gray-600">
            Showing <span className="font-bold">{filteredProducts.length}</span> of{' '}
            <span className="font-bold">{products.length}</span> products
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300">
              Previous
            </button>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-jewel-gold to-amber-500 text-white font-medium">
              1
            </button>
            <button className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300">
              2
            </button>
            <button className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300">
              3
            </button>
            <span className="px-2 text-gray-400">...</span>
            <button className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                Delete Product
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-medium hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAddingProduct(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-jewel-gold to-amber-500 text-white shadow-2xl shadow-amber-500/30 hover:shadow-3xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ProductManagement;