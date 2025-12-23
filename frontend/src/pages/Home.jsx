import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Search, 
  Sparkles, 
  Gem, 
  Heart, 
  Star, 
  Truck, 
  Shield, 
  Award,
  ArrowRight,
  ChevronRight,
  ShoppingBag,
  Clock,
  Users,
  Filter,
  X,
  Phone,
  Mail,
  MapPin,
  Diamond,
  Zap,
  Crown,
  CheckCircle,
  TrendingUp
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
    { id: 'all', label: 'All Collections', icon: <Sparkles size={18} />, color: 'from-jewel-gold to-amber-500' },
    { id: 'rings', label: 'Rings', icon: <Gem size={18} />, color: 'from-blue-500 to-cyan-500' },
    { id: 'necklaces', label: 'Necklaces', icon: <Crown size={18} />, color: 'from-emerald-500 to-teal-500' },
    { id: 'earrings', label: 'Earrings', icon: <Star size={18} />, color: 'from-amber-500 to-orange-500' },
    { id: 'bracelets', label: 'Bracelets', icon: <Award size={18} />, color: 'from-rose-500 to-pink-500' },
    { id: 'engagement', label: 'Engagement', icon: <Heart size={18} />, color: 'from-red-500 to-rose-500' },
  ];

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Diamond Collection',
      subtitle: 'Eternal Brilliance, Timeless Beauty',
      cta: 'Explore Diamonds',
      link: '/collections/diamonds',
      gradient: 'from-jewel-dark/80 via-jewel-dark/60 to-transparent'
    },
    {
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Custom Designs',
      subtitle: 'Your Vision, Masterfully Crafted',
      cta: 'Create Your Design',
      link: '/custom-request',
      gradient: 'from-jewel-dark/80 via-jewel-dark/60 to-transparent'
    },
    {
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Gold Elegance',
      subtitle: 'Pure Luxury, Handcrafted Excellence',
      cta: 'View Gold Collection',
      link: '/collections/gold',
      gradient: 'from-jewel-dark/80 via-jewel-dark/60 to-transparent'
    }
  ];

  const benefits = [
    { 
      icon: <Shield size={24} />, 
      title: 'Certified Quality', 
      description: 'All diamonds GIA certified',
      color: 'text-jewel-gold',
      bgColor: 'bg-gradient-to-br from-jewel-gold/10 to-amber-500/5'
    },
    { 
      icon: <Truck size={24} />, 
      title: 'Free Shipping', 
      description: 'On orders over $1,000',
      color: 'text-jewel-gold',
      bgColor: 'bg-gradient-to-br from-jewel-gold/10 to-amber-500/5'
    },
    { 
      icon: <Clock size={24} />, 
      title: 'Lifetime Warranty', 
      description: 'On all craftsmanship',
      color: 'text-jewel-gold',
      bgColor: 'bg-gradient-to-br from-jewel-gold/10 to-amber-500/5'
    },
    { 
      icon: <Users size={24} />, 
      title: 'Expert Guidance', 
      description: 'Personal consultations',
      color: 'text-jewel-gold',
      bgColor: 'bg-gradient-to-br from-jewel-gold/10 to-amber-500/5'
    },
  ];

  const testimonials = [
    { 
      name: 'Sarah M.', 
      role: 'Engaged', 
      text: 'The custom engagement ring exceeded all expectations. Truly magical!', 
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
    },
    { 
      name: 'Michael T.', 
      role: 'Anniversary Gift', 
      text: 'Exceptional craftsmanship and outstanding customer service.', 
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
    },
    { 
      name: 'Emma R.', 
      role: 'Wedding Bands', 
      text: 'Perfect timing and exquisite quality. Highly recommended!', 
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
    },
  ];

  const stats = [
    { value: '35+', label: 'Years Experience', icon: <Award className="w-6 h-6" /> },
    { value: '10K+', label: 'Happy Customers', icon: <Users className="w-6 h-6" /> },
    { value: '500+', label: 'Unique Designs', icon: <Gem className="w-6 h-6" /> },
    { value: '24/7', label: 'Support', icon: <Zap className="w-6 h-6" /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        // Fallback to empty array so the page still renders
        setProducts([]); 
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
      <Star 
        key={i} 
        size={16} 
        className={i < rating ? "text-jewel-gold fill-jewel-gold" : "text-gray-300"} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-jewel-cream">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Carousel */}
      <div className="relative h-screen max-h-[800px] overflow-hidden pt-20">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} z-10`} />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-10 max-w-lg">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to={slide.link}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      {slide.cta}
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                      onClick={scrollToCollection}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
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
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-jewel-gold w-8' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-4 sm:right-8 z-30 animate-bounce hidden lg:block">
          <div className="text-white text-xs rotate-90 tracking-widest flex items-center gap-2">
            <ChevronRight size={16} />
            SCROLL
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-40">
        <form 
          onSubmit={handleSearch}
          className={`max-w-4xl mx-auto transition-all duration-500 ${
            isSearchFocused ? 'scale-105' : ''
          }`}
        >
          <div className="relative">
            <Search className={`absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
              isSearchFocused ? 'text-jewel-gold' : 'text-gray-400'
            }`} size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search diamonds, rings, gold, sapphire..."
              className="w-full pl-12 sm:pl-16 pr-6 py-4 sm:py-5 bg-white rounded-2xl shadow-2xl border border-gray-200 focus:border-jewel-gold focus:ring-4 focus:ring-jewel-gold/20 outline-none transition-all duration-300 text-base sm:text-lg"
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-jewel-gold transition-colors duration-300 flex items-center gap-2"
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filter Collections</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon}
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Main Collection */}
      <div id="collection" className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
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
                  className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap ${
                    activeCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.label}</span>
                  <span className="sm:hidden">{category.label.split(' ')[0]}</span>
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
                className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <div key={product._id} className="group">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      
                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200">
                          <Heart size={16} className="text-gray-700 hover:text-red-500" />
                        </button>
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200">
                          <ShoppingBag size={16} className="text-gray-700 hover:text-jewel-gold" />
                        </button>
                      </div>
                      
                      {/* Discount Badge */}
                      {product.discount > 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                            -{product.discount}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 sm:p-6 flex-1 flex flex-col">
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
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description?.substring(0, 100)}...
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl sm:text-2xl font-bold text-gray-900">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.discount > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-red-500 line-through">
                                  ₹{(product.price / (1 - product.discount/100)).toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>
                          <Link
                            to={`/product/${product._id}`}
                            className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-jewel-gold hover:to-amber-500 hover:text-white transition-all duration-300 text-sm font-medium flex items-center gap-1 group"
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
      </div>

      {/* Contact Info */}
      <div className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-jewel-gold to-amber-500 rounded-xl mb-4">
                <Phone className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <p className="text-gray-600 text-sm">Mon-Sat: 9AM-6PM</p>
            </div>
            
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-jewel-gold to-amber-500 rounded-xl mb-4">
                <Mail className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600">contact@venkateshwarajewelry.com</p>
              <p className="text-gray-600 text-sm">Response within 24 hours</p>
            </div>
            
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-jewel-gold to-amber-500 rounded-xl mb-4">
                <MapPin className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600">123 Jewelry Street</p>
              <p className="text-gray-600 text-sm">New York, NY 10001</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-jewel-dark via-black to-jewel-dark py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Sparkles className="absolute top-10 left-4 sm:left-10" size={40} />
          <Gem className="absolute bottom-10 right-4 sm:right-10" size={40} />
          <Crown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={80} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Piece?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-10">
              Schedule a personal consultation with our master jewelers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/custom-request"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                Book Consultation
              </Link>
              <Link
                to="/contact"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-jewel-dark text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-jewel-gold to-amber-500 rounded-xl flex items-center justify-center">
                  <Crown size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Venkateshwara</h2>
                  <p className="text-xs text-gray-400">Fine Jewelry</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Crafting elegance since 1985</p>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>© {new Date().getFullYear()} Venkateshwara Fine Jewelry</p>
              <p className="mt-1">All rights reserved</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Add CSS animations */}
      <style>{`
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