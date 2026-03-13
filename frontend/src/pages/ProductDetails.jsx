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
  ChevronRight,
  Package,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Sparkles
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

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
        setProduct(res?.data);
        
        // Reset state on new product load
        setSelectedImageIndex(0);
        setQuantity(1);

        // Fetch related products
        if (res?.data?.category) {
          try {
            const relatedRes = await axios.get(`/products/related/${res.data.category}`);
            setRelatedProducts(relatedRes?.data?.filter(p => p._id !== id).slice(0, 4) || []);
          } catch (relatedErr) {
            console.warn("Could not fetch related products", relatedErr);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found or an error occurred');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // --- ADD TO CART HANDLER ---
  const handleAddToCart = () => {
    if (product?.stock > 0) {
      addToCart(product, quantity);
      alert(`${quantity} ${product?.title} added to cart!`);
    }
  };

  // --- BUY NOW HANDLER ---
  const handleBuyNow = () => {
    if (product?.stock > 0) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: `Check out this beautiful ${product?.title}`,
        url: window.location.href,
      }).catch(console.error);
    }
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    alert(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const calculateDiscount = () => {
    if (!product?.discount) return null;
    const originalPrice = product?.price / (1 - product?.discount / 100);
    return {
      original: originalPrice,
      saved: originalPrice - product?.price,
      percentage: product?.discount
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600">Loading exquisite details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white flex items-center justify-center pt-20">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/collections')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Browse Collections
          </button>
        </div>
      </div>
    );
  }

  const discountInfo = calculateDiscount();
  const images = product?.images?.length > 0 ? product.images : [product?.img || product?.image || 'https://via.placeholder.com/800x800?text=Jewelry'];
  const stockStatus = product?.stock === 0 ? 'out' : product?.stock < 5 ? 'low' : 'in';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <Link to="/collections" className="hover:text-blue-600 transition-colors">
              Collections
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">{product?.title}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left: Images */}
            <div className="p-6 lg:p-8 bg-gray-50/50 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div
                className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-zoom-in group mb-4 aspect-square flex items-center justify-center"
                onClick={() => setShowZoomModal(true)}
              >
                <img
                  src={images[selectedImageIndex]}
                  alt={product?.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Badges overlaid on image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product?.featured && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                      <Star size={10} className="fill-white" /> Featured
                    </span>
                  )}
                  {discountInfo && (
                    <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                      -{discountInfo.percentage}%
                    </span>
                  )}
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${stockStatus === 'in' ? 'bg-green-500 text-white' : stockStatus === 'low' ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {stockStatus === 'in' ? 'In Stock' : stockStatus === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <button
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all hover:scale-110"
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
                >
                  <Heart size={20} className={isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto py-2 hide-scrollbar">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImageIndex === index ? 'border-blue-600 scale-105' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Details */}
            <div className="p-6 lg:p-10 flex flex-col justify-center">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {product?.category && <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider rounded border border-gray-200">{product.category}</span>}
                  {(product?.material || product?.metal) && <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded border border-amber-100">{product.material || product.metal}</span>}
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-3 leading-tight">{product?.title}</h1>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={16} className="fill-yellow-400" />
                    <Star size={16} className="fill-yellow-400" />
                    <Star size={16} className="fill-yellow-400" />
                    <Star size={16} className="fill-yellow-400" />
                    <Star size={16} className="fill-yellow-400 opacity-50" />
                    <span className="text-gray-700 font-medium ml-1">4.8</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <button className="text-blue-600 hover:underline font-medium">Read Reviews</button>
                </div>
              </div>

              {/* Price & Weight Block */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Product Weight</p>
                  <div className="flex items-end gap-4 flex-wrap">
                    
                    {/* Weight is the main highlighted text */}
                    <span className="text-4xl font-bold text-gray-900 tracking-tight">
                      {product?.weight ? `${product.weight}g` : 'Weight N/A'}
                    </span>
                    
                    {/* Price displayed alongside */}
                    <div className="flex flex-col pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-medium text-blue-700">{formatCurrency(product?.price)}</span>
                        {discountInfo && (
                          <span className="text-sm text-gray-400 line-through decoration-gray-300">{formatCurrency(discountInfo.original)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {discountInfo && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded w-fit">
                      <CheckCircle size={12} /> You save {discountInfo.percentage}% ({formatCurrency(discountInfo.saved)})
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                  {product?.description || "This exquisite piece is crafted with meticulous attention to detail, ensuring timeless elegance and superior quality."}
                </p>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors text-gray-600">-</button>
                    <span className="w-12 text-center text-base font-bold text-gray-900">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product?.stock} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors text-gray-600">+</button>
                  </div>
                  <div className="text-sm text-gray-500 flex flex-col">
                    <span>Available</span>
                    <span className="font-bold text-gray-900">{product?.stock} units</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product?.stock === 0}
                  className={`py-3.5 rounded-xl font-bold text-sm lg:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                    product?.stock > 0
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  <ShoppingBag size={18} />
                  {product?.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product?.stock === 0}
                  className={`py-3.5 rounded-xl font-bold text-sm lg:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                    product?.stock > 0 
                      ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg' 
                      : 'opacity-50 cursor-not-allowed bg-gray-800 text-white'
                  }`}
                >
                  <CreditCard size={18} />
                  Buy Now
                </button>
              </div>

              {/* Utility Links */}
              <div className="flex items-center justify-center sm:justify-start gap-6 border-t border-gray-100 pt-6">
                <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  <Share2 size={16} /> Share
                </button>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Shield size={16} className="text-green-600" /> Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: <Shield size={20} />, title: 'Authenticity', sub: '100% Certified' },
            { icon: <Truck size={20} />, title: 'Free Shipping', sub: 'Fully Insured' },
            { icon: <RefreshCw size={20} />, title: 'Easy Returns', sub: '30-Day Policy' },
            { icon: <Gem size={20} />, title: 'Lifetime Care', sub: 'Free Cleaning' },
          ].map((badge, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center gap-2 group hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                {badge.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{badge.title}</h4>
                <p className="text-xs text-gray-500">{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Full Details Tabs Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id ? 'text-blue-700 bg-blue-50/30' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
          
          <div className="p-6 md:p-8">
            {activeTab === 'details' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About this Masterpiece</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {product?.description || 'No detailed description available for this item. Please refer to the specifications tab for exact measurements and material details.'}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Every piece in our collection is subject to rigorous quality control and is crafted using ethically sourced materials. The unique design ensures that you receive a piece that stands out with its brilliance and elegance.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0 border-t border-gray-200">
                  <div className="flex justify-between py-4 border-b border-gray-200">
                    <span className="text-gray-500">Category</span>
                    <span className="font-bold text-gray-900">{product?.category || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-gray-200">
                    <span className="text-gray-500">Material/Metal</span>
                    <span className="font-bold text-gray-900">{product?.material || product?.metal || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-gray-200 bg-blue-50/50 -mx-2 px-2 sm:mx-0 sm:px-0 sm:bg-transparent">
                    <span className="text-gray-800 font-medium">Weight</span>
                    <span className="font-bold text-blue-700">{product?.weight ? `${product.weight}g` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-gray-200">
                    <span className="text-gray-500">Gemstone</span>
                    <span className="font-bold text-gray-900">{product?.gemstone || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-gray-200">
                    <span className="text-gray-500">Purity</span>
                    <span className="font-bold text-gray-900">{product?.purity || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-gray-200">
                    <span className="text-gray-500">Size/Dimensions</span>
                    <span className="font-bold text-gray-900">{product?.size || 'Standard'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-blue-600">
                    <Truck size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Shipping Information</h4>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> Free insured express shipping.</li>
                    <li className="flex items-start gap-2"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> Dispatch within 24-48 hours.</li>
                    <li className="flex items-start gap-2"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> Signature required upon delivery.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-blue-600">
                    <RefreshCw size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Return Policy</h4>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> 30-Day money-back guarantee.</li>
                    <li className="flex items-start gap-2"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> Item must be in original unworn condition.</li>
                    <li className="flex items-start gap-2"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> Custom engraved items are non-refundable.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <Star className="text-yellow-400 fill-yellow-400 mb-3" size={40} />
                <h4 className="font-bold text-gray-900 text-xl mb-1">Customer Reviews</h4>
                <p className="text-gray-500 text-center max-w-md">Our review system is currently being upgraded. Please check back later to read verified customer experiences for this piece.</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Related Products Section */}
        {relatedProducts?.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={24} /> 
                Similar Pieces You Might Love
              </h2>
              <Link to="/collections" className="text-sm font-bold text-blue-600 hover:text-blue-800 hidden sm:block">
                View Collection →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link to={`/product/${relProduct?._id}`} key={relProduct?._id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img 
                      src={relProduct?.images?.[0] || 'https://via.placeholder.com/400'} 
                      alt={relProduct?.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {relProduct?.discount > 0 && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-sm">
                        -{relProduct.discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{relProduct?.category}</p>
                    <h3 className="font-bold text-gray-900 mb-2 truncate text-sm">{relProduct?.title}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        {relProduct?.weight ? `${relProduct.weight}g` : 'N/A'}
                      </span>
                      <span className="text-sm font-bold text-gray-500">
                        {formatCurrency(relProduct?.price)}
                      </span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 p-1 rounded-full"><X size={16}/></button>
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Share this Piece</h3>
            <div className="flex justify-center gap-4 mb-6">
              <button className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"><Facebook size={20}/></button>
              <button className="w-12 h-12 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors"><Twitter size={20}/></button>
              <button className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors"><Instagram size={20}/></button>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500 truncate">{window.location.href}</span>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }} className="text-xs font-bold text-blue-600 uppercase">Copy</button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {showZoomModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={() => setShowZoomModal(false)}>
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            <button 
              onClick={() => setShowZoomModal(false)} 
              className="absolute -top-10 right-0 md:top-4 md:-right-12 text-white/70 hover:text-white p-2"
            >
              <X size={32} />
            </button>
            <img 
              src={images[selectedImageIndex]} 
              alt={product?.title} 
              className="w-full h-full object-contain max-h-[85vh] rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;