import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { CartContext } from '../context/CartContext';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  CheckCircle,
  Star,
  Gem,
  Crown,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Package,
  Calendar,
  Award,
  Eye,
  Facebook,
  Twitter,
  Instagram,
  MessageSquare,
  Clock,
  AlertCircle,
  Zap,
  Users,
  Tag,
  CreditCard,
  RefreshCw
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const tabs = [
    { id: 'details', label: 'Product Details', icon: <Gem size={16} /> },
    { id: 'specifications', label: 'Specifications', icon: <Package size={16} /> },
    { id: 'shipping', label: 'Shipping & Returns', icon: <Truck size={16} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={16} /> },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/products/find/${id}`);
        setProduct(res.data);
        
        // Fetch related products
        const relatedRes = await axios.get(`/products/related/${res.data.category}`);
        setRelatedProducts(relatedRes.data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found or an error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product, quantity);
      // Show success notification
      alert(`${quantity} ${product.title} added to cart!`);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out this beautiful ${product.title} from Venkateshwara Jewelers`,
        url: window.location.href,
      });
    }
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    // In a real app, you would make an API call here
    alert(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateDiscount = () => {
    if (!product?.discount) return null;
    const originalPrice = product.price / (1 - product.discount / 100);
    return {
      original: originalPrice,
      saved: originalPrice - product.price,
      percentage: product.discount
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-jewel-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600">Loading exquisite details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/collections')}
            className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-jewel-gold transition-all duration-300"
          >
            Browse Collections
          </button>
        </div>
      </div>
    );
  }

  const discountInfo = calculateDiscount();
  const images = product.images || ['https://via.placeholder.com/800x800?text=Jewelry'];
  const stockStatus = product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : 'in';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-jewel-gold transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <ChevronRight size={16} className="mx-2" />
          <Link to="/collections" className="hover:text-jewel-gold transition-colors duration-300">
            Collections
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <Link to={`/collections/${product.category?.toLowerCase()}`} className="hover:text-jewel-gold transition-colors duration-300">
            {product.category}
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900 font-medium truncate">{product.title}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 cursor-zoom-in"
              onClick={() => setShowZoomModal(true)}
            >
              <img
                src={images[selectedImageIndex]}
                alt={product.title}
                className="w-full h-[500px] object-contain transition-transform duration-300 hover:scale-105"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-jewel-gold to-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Star size={10} />
                    Featured
                  </span>
                )}
                {discountInfo && (
                  <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{discountInfo.percentage}%
                  </span>
                )}
                <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                  stockStatus === 'in' 
                    ? 'bg-green-100 text-green-800' 
                    : stockStatus === 'low' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stockStatus === 'in' ? 'In Stock' : stockStatus === 'low' ? 'Low Stock' : 'Out of Stock'}
                </span>
              </div>
              
              <button 
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist();
                }}
              >
                <Heart size={20} className={isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-700'} />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3 overflow-x-auto py-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImageIndex === index
                      ? 'border-jewel-gold scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Shield size={16} />, text: '2-Year Warranty' },
                { icon: <Truck size={16} />, text: 'Free Shipping' },
                { icon: <CheckCircle size={16} />, text: 'Certified Quality' },
                { icon: <RefreshCw size={16} />, text: '30-Day Returns' },
              ].map((badge, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-jewel-gold/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-jewel-gold">{badge.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category & Title */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {product.category}
                </span>
                {product.material && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {product.material}
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-500">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="font-medium">4.9</span>
                <span className="text-sm">(42 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-serif font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
                {discountInfo && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatCurrency(discountInfo.original)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                      Save {formatCurrency(discountInfo.saved)}
                    </span>
                  </>
                )}
              </div>
              {discountInfo && (
                <p className="text-sm text-green-600">
                  <CheckCircle size={14} className="inline mr-1" />
                  You save {discountInfo.percentage}% ({formatCurrency(discountInfo.saved)})
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "This exquisite piece is crafted with meticulous attention to detail by our master jewelers. Each element is carefully selected and perfectly placed to create a timeless work of art that celebrates elegance and sophistication."}
              </p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              {product.material && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Primary Material</p>
                  <p className="font-medium text-gray-900">{product.material}</p>
                </div>
              )}
              {product.gemstone && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Gemstone</p>
                  <p className="font-medium text-gray-900">{product.gemstone}</p>
                </div>
              )}
              {product.weight && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Weight</p>
                  <p className="font-medium text-gray-900">{product.weight}g</p>
                </div>
              )}
              {product.dimensions && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Dimensions</p>
                  <p className="font-medium text-gray-900">{product.dimensions}</p>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className={`p-4 rounded-xl ${
              stockStatus === 'in' 
                ? 'bg-green-50 border border-green-200' 
                : stockStatus === 'low' 
                ? 'bg-amber-50 border border-amber-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    stockStatus === 'in' ? 'bg-green-500' : stockStatus === 'low' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {stockStatus === 'in' 
                        ? `${product.stock} items available` 
                        : stockStatus === 'low' 
                        ? `Only ${product.stock} left in stock` 
                        : 'Currently unavailable'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {stockStatus === 'in' 
                        ? 'Order now for fast delivery' 
                        : stockStatus === 'low' 
                        ? 'Order soon before it sells out' 
                        : 'Notify me when back in stock'
                      }
                    </p>
                  </div>
                </div>
                {stockStatus === 'out' && (
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors duration-300 text-sm">
                    Notify Me
                  </button>
                )}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Max: {product.stock} units
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    product.stock > 0
                      ? 'bg-gradient-to-r from-jewel-gold to-amber-500 text-white hover:from-amber-500 hover:to-jewel-gold hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag size={20} />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                <button className="py-4 border-2 border-gray-900 text-gray-900 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                  <CreditCard size={20} />
                  Buy Now
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={toggleWishlist}
                  className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-colors duration-300 ${
                    isInWishlist
                      ? 'border-red-500 text-red-500 hover:bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:border-jewel-gold hover:text-jewel-gold'
                  }`}
                >
                  <Heart size={18} className={isInWishlist ? 'fill-red-500' : ''} />
                  {isInWishlist ? 'Saved' : 'Save for Later'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 hover:border-jewel-gold hover:text-jewel-gold transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                    activeTab === tab.id
                      ? 'border-b-2 border-jewel-gold text-jewel-gold'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Craftsmanship Details</h3>
                <p className="text-gray-600 leading-relaxed">
                  This masterpiece is created using traditional jewelry-making techniques combined with modern precision. 
                  Each component is carefully assembled by our master jewelers who have over 20 years of experience. 
                  The attention to detail is evident in every curve and facet, ensuring a piece that will be cherished for generations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Crown size={18} />
                      Materials & Quality
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle size={16} className="text-green-500" />
                        High-polish finish for maximum brilliance
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle size={16} className="text-green-500" />
                        Hypoallergenic materials for sensitive skin
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle size={16} className="text-green-500" />
                        Rhodium plating for tarnish resistance
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles size={18} />
                      Care Instructions
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle size={16} className="text-blue-500" />
                        Clean with mild soap and soft cloth
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle size={16} className="text-blue-500" />
                        Store in original box when not wearing
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle size={16} className="text-blue-500" />
                        Professional cleaning recommended annually
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Shipping & Returns</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                    <Truck className="text-blue-500 mb-4" size={32} />
                    <h4 className="font-bold text-gray-900 mb-2">Standard Shipping</h4>
                    <p className="text-gray-600 text-sm">3-5 business days • Free on orders over $1,000</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <Zap className="text-green-500 mb-4" size={32} />
                    <h4 className="font-bold text-gray-900 mb-2">Express Shipping</h4>
                    <p className="text-gray-600 text-sm">1-2 business days • $29.99</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <RefreshCw className="text-purple-500 mb-4" size={32} />
                    <h4 className="font-bold text-gray-900 mb-2">Easy Returns</h4>
                    <p className="text-gray-600 text-sm">30-day return policy • Free returns</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold text-gray-900">You May Also Like</h2>
              <Link
                to={`/collections/${product.category?.toLowerCase()}`}
                className="text-jewel-gold hover:text-amber-600 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/product/${relatedProduct._id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedProduct.images?.[0] || 'https://via.placeholder.com/400x400?text=Jewelry'}
                        alt={relatedProduct.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-1 mb-2">{relatedProduct.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-gray-900">
                          {formatCurrency(relatedProduct.price)}
                        </span>
                        <span className="text-sm text-gray-500">{relatedProduct.category}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slideDown">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Share this Product</h3>
            <div className="flex justify-center gap-4 mb-6">
              <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300">
                <Facebook size={20} />
              </button>
              <button className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-300">
                <Twitter size={20} />
              </button>
              <button className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors duration-300">
                <Instagram size={20} />
              </button>
              <button className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors duration-300">
                <MessageSquare size={20} />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors duration-200"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showZoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setShowZoomModal(false)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setShowZoomModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300 z-10"
            >
              ✕
            </button>
            <img
              src={images[selectedImageIndex]}
              alt={product.title}
              className="w-full h-full object-contain"
            />
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
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;