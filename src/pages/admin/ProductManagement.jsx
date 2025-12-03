import { useState, useEffect } from 'react';
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
  TrendingDown,
  Sparkles,
  Gem,
  Camera,
  X,
  Image as ImageIcon,
  DollarSign,
  Hash,
  Grid,
  List,
  RefreshCw,
  Shield
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Enhanced form data structure
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    material: '',
    gemstone: '',
    weight: '',
    dimensions: '',
    image: '',
    stock: '',
    sku: '',
    tags: '',
    featured: false,
    discount: ''
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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, categoryFilter, stockFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Apply stock filter
    switch (stockFilter) {
      case 'in-stock':
        filtered = filtered.filter(product => product.stock > 0);
        break;
      case 'low-stock':
        filtered = filtered.filter(product => product.stock > 0 && product.stock < 5);
        break;
      case 'out-of-stock':
        filtered = filtered.filter(product => product.stock === 0);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'name-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'name-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'stock-high':
          return (b.stock || 0) - (a.stock || 0);
        default:
          return 0;
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

    // Update image preview
    if (name === 'image') {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      title: '',
      description: '',
      price: '',
      category: '',
      material: '',
      gemstone: '',
      weight: '',
      dimensions: '',
      image: '',
      stock: '',
      sku: '',
      tags: '',
      featured: false,
      discount: ''
    });
    setImagePreview(null);
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const toggleProductSelection = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id)
        ? prev.filter(productId => productId !== id)
        : [...prev, id]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product._id));
    }
  };

  const bulkDelete = async () => {
    if (!selectedProducts.length) return;
    if (!window.confirm(`Delete ${selectedProducts.length} selected products?`)) return;
    
    try {
      await Promise.all(
        selectedProducts.map(id => axios.delete(`/products/${id}`))
      );
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-jewel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your jewelry inventory with precision</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2">
            <Upload size={16} />
            Import
          </button>
          <button 
            onClick={() => setIsAddingProduct(!isAddingProduct)}
            className="px-4 py-2 bg-jewel-gold text-white rounded-lg hover:bg-amber-600 transition-colors duration-300 flex items-center gap-2"
          >
            {isAddingProduct ? <X size={16} /> : <Plus size={16} />}
            {isAddingProduct ? 'Cancel' : 'Add Product'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Products', 
            value: products.length, 
            change: '+5', 
            color: 'blue', 
            icon: Package,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          { 
            label: 'Total Value', 
            value: formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0)), 
            change: '+12%', 
            color: 'green', 
            icon: DollarSign,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
          },
          { 
            label: 'Out of Stock', 
            value: products.filter(p => p.stock === 0).length, 
            change: '-2', 
            color: 'red', 
            icon: AlertCircle,
            bgColor: 'bg-red-50',
            textColor: 'text-red-600'
          },
          { 
            label: 'Featured Items', 
            value: products.filter(p => p.featured).length, 
            change: '+3', 
            color: 'purple', 
            icon: Star,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">this month</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={stat.textColor} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Product Form */}
      {isAddingProduct && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 animate-slideDown">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Diamond Solitaire Ring"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the product in detail..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.filter(c => c !== 'All Categories').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                    </label>
                    <select
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                    >
                      <option value="">Select Material</option>
                      {materials.map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gemstone
                    </label>
                    <select
                      name="gemstone"
                      value={formData.gemstone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                    >
                      <option value="">Select Gemstone</option>
                      {gemstones.map(gemstone => (
                        <option key={gemstone} value={gemstone}>{gemstone}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g., JWL-DIA-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="diamond, ring, engagement, gold"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    id="featured"
                    className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Mark as Featured Product
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 flex items-center gap-2"
              >
                {editingProduct ? <Edit size={16} /> : <Plus size={16} />}
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'} transition-colors duration-200`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'} transition-colors duration-200`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
              />
            </div>

            {/* Quick Filters */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <button 
              onClick={fetchProducts}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {filteredProducts.length} products found
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 animate-slideDown">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== 'All Categories').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
              >
                {stockOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-gradient-to-r from-jewel-gold/10 to-amber-500/10 border border-jewel-gold/20 rounded-xl p-4 animate-slideDown">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="text-jewel-gold" size={20} />
              <span className="font-medium">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none bg-white">
                <option>Bulk Actions</option>
                <option>Update Category</option>
                <option>Update Price</option>
                <option>Update Stock</option>
                <option>Mark as Featured</option>
                <option>Export Selected</option>
              </select>
              <button 
                onClick={bulkDelete}
                className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete Selected
              </button>
              <button 
                onClick={() => setSelectedProducts([])}
                className="px-4 py-1.5 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Display */}
      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <Gem className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'Try changing your filters' 
                  : 'No products in inventory'}
              </p>
              <button
                onClick={() => setIsAddingProduct(true)}
                className="mt-4 px-4 py-2 bg-jewel-gold text-white rounded-lg hover:bg-amber-600 transition-colors duration-200"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const finalPrice = product.discount 
                ? product.price * (1 - product.discount / 100)
                : product.price;

              return (
                <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.featured && (
                        <span className="px-2 py-1 bg-gradient-to-r from-jewel-gold to-amber-500 text-white text-xs font-bold rounded-full">
                          <Star size={10} className="inline mr-1" />
                          Featured
                        </span>
                      )}
                      {product.discount > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                      <span className={`px-2 py-1 bg-${stockStatus.color}-500 text-white text-xs font-bold rounded-full`}>
                        {stockStatus.label}
                      </span>
                    </div>

                    {/* Selection Checkbox */}
                    <div className="absolute top-3 right-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                        className="w-5 h-5 text-jewel-gold rounded focus:ring-jewel-gold"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{product.category}</p>
                      </div>
                      {product.featured && (
                        <Sparkles size={16} className="text-jewel-gold" />
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(finalPrice)}
                      </span>
                      {product.discount > 0 && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-xs text-red-500 font-bold">
                            Save {formatCurrency(product.price - finalPrice)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">SKU:</span>
                        <span className="font-mono text-gray-700">{product.sku || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Stock:</span>
                        <span className={`font-bold text-${stockStatus.color}-600`}>
                          {product.stock} units
                        </span>
                      </div>
                      {product.material && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Material:</span>
                          <span className="text-gray-700">{product.material}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-1 text-sm"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(product._id)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-1 text-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={selectAllProducts}
                    className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold"
                  />
                </th>
                <th className="p-4 text-left font-semibold text-gray-600">Product</th>
                <th className="p-4 text-left font-semibold text-gray-600">Category</th>
                <th className="p-4 text-left font-semibold text-gray-600">Price</th>
                <th className="p-4 text-left font-semibold text-gray-600">Stock</th>
                <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                <th className="p-4 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const finalPrice = product.discount 
                  ? product.price * (1 - product.discount / 100)
                  : product.price;

                return (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                        className="w-4 h-4 text-jewel-gold rounded focus:ring-jewel-gold"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'} 
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500">{product.sku || 'No SKU'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-gray-900">{formatCurrency(finalPrice)}</div>
                        {product.discount > 0 && (
                          <div className="text-xs text-red-500">-{product.discount}% off</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{product.stock}</div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-${stockStatus.color}-100 text-${stockStatus.color}-800`}>
                        <div className={`w-2 h-2 rounded-full bg-${stockStatus.color}-500`}></div>
                        {stockStatus.label}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-gray-600 hover:text-jewel-gold transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(product._id)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slideDown">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductManagement;