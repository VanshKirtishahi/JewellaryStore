import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Gem, 
  Crown, 
  Heart, 
  Star, 
  Truck, 
  Shield, 
  Award,
  ArrowRight,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Filter,
  X
} from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categories = [
    { id: 'all', label: 'All Collections', icon: <Sparkles size={16} /> },
    { id: 'rings', label: 'Rings', icon: <Gem size={16} /> },
    { id: 'necklaces', label: 'Necklaces', icon: <Crown size={16} /> },
    { id: 'earrings', label: 'Earrings', icon: <Star size={16} /> },
    { id: 'bracelets', label: 'Bracelets', icon: <Heart size={16} /> },
    { id: 'engagement', label: 'Engagement', icon: <Award size={16} /> },
  ];

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Diamond Collection',
      subtitle: 'Eternal Brilliance, Timeless Beauty',
      cta: 'Explore Diamonds',
      link: '/collections/diamonds'
    },
    {
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Custom Designs',
      subtitle: 'Your Vision, Masterfully Crafted',
      cta: 'Create Your Design',
      link: '/custom-request'
    },
    {
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Gold Elegance',
      subtitle: 'Pure Luxury, Handcrafted Excellence',
      cta: 'View Gold Collection',
      link: '/collections/gold'
    }
  ];

  const benefits = [
    { icon: <Shield size={24} />, title: 'Certified Quality', description: 'All diamonds GIA certified' },
    { icon: <Truck size={24} />, title: 'Free Shipping', description: 'On orders over $1,000' },
    { icon: <Clock size={24} />, title: 'Lifetime Warranty', description: 'On all craftsmanship' },
    { icon: <Users size={24} />, title: 'Expert Guidance', description: 'Personal consultations' },
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Engaged', text: 'The custom engagement ring exceeded all expectations. Truly magical!', rating: 5 },
    { name: 'Michael T.', role: 'Anniversary Gift', text: 'Exceptional craftsmanship and outstanding customer service.', rating: 5 },
    { name: 'Emma R.', role: 'Wedding Bands', text: 'Perfect timing and exquisite quality. Highly recommended!', rating: 5 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/products');
        const allProducts = res.data;
        setProducts(allProducts);
        // Featured products are those marked as featured or high price
        setFeaturedProducts(allProducts.filter(p => p.featured || p.price > 1000).slice(0, 4));
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || 
      product.category.toLowerCase() === activeCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Search logic already handled by filteredProducts
  };

  const scrollToCollection = () => {
    document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={16} className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-white">
      {/* Hero Carousel */}
      <div className="relative h-screen max-h-[800px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-6 lg:px-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-jewel-gold to-amber-500 rounded-xl flex items-center justify-center">
                      <Crown className="text-white" size={24} />
                    </div>
                    <span className="text-jewel-gold font-serif font-bold tracking-widest">SINCE 1985</span>
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl lg:text-2xl text-gray-300 mb-10 max-w-lg">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to={slide.link}
                      className="px-8 py-4 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl font-bold hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 flex items-center gap-2 group"
                    >
                      {slide.cta}
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                      onClick={scrollToCollection}
                      className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
                    >
                      Browse All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-jewel-gold w-8' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-8 z-30 animate-bounce hidden lg:block">
          <div className="text-white text-xs rotate-90 tracking-widest flex items-center gap-2">
            <ChevronRight size={16} />
            SCROLL
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-6 lg:px-8 -mt-16 relative z-40">
        <form 
          onSubmit={handleSearch}
          className={`max-w-4xl mx-auto transition-all duration-500 ${
            isSearchFocused ? 'scale-105' : ''
          }`}
        >
          <div className="relative">
            <Search className={`absolute left-6 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
              isSearchFocused ? 'text-jewel-gold' : 'text-gray-400'
            }`} size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search diamonds, rings, gold, sapphire..."
              className="w-full pl-16 pr-6 py-5 bg-white rounded-2xl shadow-2xl border border-gray-200 focus:border-jewel-gold focus:ring-4 focus:ring-jewel-gold/20 outline-none transition-all duration-300 text-lg"
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-jewel-gold transition-colors duration-300 flex items-center gap-2"
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filter Collections</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-jewel-gold to-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon}
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Benefits Bar */}
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-jewel-gold/20 to-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-jewel-gold">{benefit.icon}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gradient-to-b from-white via-blue-50/30 to-white py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-3">
                Featured Masterpieces
              </h2>
              <p className="text-gray-600">Hand-selected by our master jewelers</p>
            </div>
            <Link
              to="/collections"
              className="text-jewel-gold hover:text-amber-600 font-bold flex items-center gap-2 group"
            >
              View All Collections
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-96"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product._id} className="group relative">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500">
                    {/* Product Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=Jewelry'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.featured && (
                          <span className="px-3 py-1 bg-gradient-to-r from-jewel-gold to-amber-500 text-white text-xs font-bold rounded-full">
                            <Star size={10} className="inline mr-1" />
                            Featured
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">
                          {product.category}
                        </span>
                        {product.material && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {product.material}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description?.substring(0, 80)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-serif font-bold text-gray-900">
                            ${product.price.toLocaleString()}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-sm text-red-500 line-through ml-2">
                              ${(product.price / (1 - product.discount/100)).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/product/${product._id}`}
                          className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-jewel-gold hover:to-amber-500 hover:text-white transition-all duration-300 group"
                        >
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Collection */}
      <div id="collection" className="container mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-3">
              Our Exquisite Collection
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} stunning piece{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-jewel-gold to-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-jewel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exquisite pieces...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Gem className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No pieces found</h3>
            <p className="text-gray-500 mb-6">Try a different search or category</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product._id} className="group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=Jewelry'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200">
                        <Heart size={18} className="text-gray-700" />
                      </button>
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200">
                        <ShoppingBag size={18} className="text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">
                          {product.category}
                        </span>
                        {product.stock < 5 && product.stock > 0 && (
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description?.substring(0, 100)}...
                      </p>
                      
                      {/* Specifications */}
                      <div className="space-y-2 mb-4">
                        {product.material && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Material:</span>
                            <span className="text-gray-700">{product.material}</span>
                          </div>
                        )}
                        {product.gemstone && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Gemstone:</span>
                            <span className="text-gray-700">{product.gemstone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-serif font-bold text-gray-900">
                            ${product.price.toLocaleString()}
                          </span>
                          {product.discount > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-red-500 line-through">
                                ${(product.price / (1 - product.discount/100)).toLocaleString()}
                              </span>
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                -{product.discount}%
                              </span>
                            </div>
                          )}
                        </div>
                        <Link
                          to={`/product/${product._id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-jewel-gold hover:to-amber-500 hover:text-white transition-all duration-300 text-sm font-medium flex items-center gap-1 group"
                        >
                          Details
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
              Stories of Elegance
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover what our clients say about their experience with Venkateshwara Fine Jewelry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-jewel-gold/20 to-amber-500/20 rounded-full flex items-center justify-center">
                    <span className="text-jewel-gold font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Sparkles className="absolute top-10 left-10" size={60} />
          <Gem className="absolute bottom-10 right-10" size={60} />
          <Crown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={80} />
        </div>
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-6">
              Ready to Find Your Perfect Piece?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Schedule a personal consultation with our master jewelers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/custom-request"
                className="px-8 py-4 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl font-bold hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                Book Consultation
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
              >
                Contact Us
              </Link>
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Home;