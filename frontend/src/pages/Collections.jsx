import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ShoppingCart, 
  Heart, 
  Eye,
  Gem
} from 'lucide-react';

const Collections = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all'); // all, under-500, 500-1000, 1000-plus
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Wedding', 'Diamond'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/products');
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...products];

    // 1. Search
    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Category
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // 3. Price
    if (priceRange === 'under-500') {
      result = result.filter(p => p.price < 500);
    } else if (priceRange === '500-1000') {
      result = result.filter(p => p.price >= 500 && p.price <= 1000);
    } else if (priceRange === '1000-plus') {
      result = result.filter(p => p.price > 1000);
    }

    // 4. Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      // Newest
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(result);
  }, [products, searchQuery, activeCategory, priceRange, sortBy]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-jewel-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Collections</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated selection of fine jewelry, crafted with precision and passion. 
            From timeless classics to modern masterpieces.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for rings, diamonds, gold..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-jewel-gold focus:border-transparent outline-none shadow-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 lg:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all ${
                  activeCategory === cat 
                    ? 'bg-jewel-gold text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Filter Dropdowns */}
          <div className="flex gap-3">
            <div className="relative group">
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-jewel-gold cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="under-500">Under ₹500</option>
                <option value="500-1000">₹500 - ₹1,000</option>
                <option value="1000-plus">₹1,000+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-jewel-gold cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Gem className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
            <button 
              onClick={() => {setSearchQuery(''); setActiveCategory('All'); setPriceRange('all');}}
              className="mt-4 text-jewel-gold font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={product.images?.[0] || 'https://via.placeholder.com/400'} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link 
                      to={`/product/${product._id}`}
                      className="p-3 bg-white text-gray-900 rounded-full hover:bg-jewel-gold hover:text-white transition-colors transform hover:scale-110"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </Link>
                    <button 
                      className="p-3 bg-white text-gray-900 rounded-full hover:bg-jewel-gold hover:text-white transition-colors transform hover:scale-110"
                      title="Add to Wishlist"
                    >
                      <Heart size={20} />
                    </button>
                  </div>

                  {/* Badges */}
                  {product.stock < 5 && product.stock > 0 && (
                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="font-bold text-gray-900 mb-2 truncate">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-serif font-bold text-jewel-gold">
                      {formatCurrency(product.price)}
                    </span>
                    <Link 
                      to={`/product/${product._id}`}
                      className="text-sm font-medium text-gray-600 hover:text-jewel-gold transition-colors"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;