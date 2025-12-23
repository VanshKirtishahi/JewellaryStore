import { useState, useEffect, useContext } from 'react';
import { Heart, ShoppingBag, Trash2, Star, ArrowRight, Gem, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext'; // Assuming you have a CartContext

const UserWishlist = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  // Optional: Context for adding to cart directly
  // const { addToCart } = useContext(CartContext); 
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH WISHLIST ---
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        // 1. Try fetching from API first (if backend supports it)
        if (user) {
          try {
            // Adjust endpoint as per your backend
            // const res = await axios.get(`/users/${user._id}/wishlist`);
            // setWishlistItems(res.data);
            
            // For now, simulating API fetch with localStorage fallback
            throw new Error("API not implemented yet"); 
          } catch (apiErr) {
            // 2. Fallback to LocalStorage
            const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            setWishlistItems(storedWishlist);
          }
        } else {
          // Guest user: use localStorage
          const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
          setWishlistItems(storedWishlist);
        }
      } catch (err) {
        console.error("Error fetching wishlist", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  // --- ACTIONS ---
  const removeFromWishlist = (id) => {
    const updatedList = wishlistItems.filter(item => item._id !== id);
    setWishlistItems(updatedList);
    localStorage.setItem('wishlist', JSON.stringify(updatedList));
    // Optional: Call API to remove
  };

  const handleMoveToCart = (product) => {
    // addToCart(product); // Add to cart context
    // removeFromWishlist(product._id); // Optional: Remove from wishlist after adding
    alert("Added to cart! (Implement CartContext logic here)");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-jewel-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            My Wishlist
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </h1>
          <p className="text-gray-500 mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        <button 
          onClick={() => navigate('/collections')}
          className="text-sm font-medium text-jewel-gold hover:text-amber-700 flex items-center gap-1 transition-colors px-4 py-2 rounded-lg hover:bg-amber-50"
        >
          Browse Collections <ArrowRight size={16} />
        </button>
      </div>

      {/* Content */}
      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-16 text-center shadow-sm">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Heart size={40} className="text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Explore our exquisite collection and save your favorite pieces here.
          </p>
          <button 
            onClick={() => navigate('/collections')}
            className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
              
              {/* Image Area */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop'} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Remove Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(product._id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                  title="Remove from wishlist"
                >
                  <Trash2 size={18} />
                </button>

                {/* Stock Badge */}
                {product.stock < 5 && product.stock > 0 && (
                  <span className="absolute bottom-3 left-3 px-3 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide rounded-full shadow-sm">
                    Low Stock
                  </span>
                )}
                 {product.stock === 0 && (
                  <span className="absolute bottom-3 left-3 px-3 py-1 bg-gray-800/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide rounded-full shadow-sm">
                    Out of Stock
                  </span>
                )}
              </div>
              
              {/* Details Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={12} className="fill-current" />
                    <span className="text-xs font-bold">4.9</span>
                  </div>
                </div>
                
                <h3 
                  className="font-bold text-gray-900 mb-2 line-clamp-1 hover:text-jewel-gold transition-colors cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {product.title}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <p className="text-lg font-serif font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </p>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </p>
                  )}
                </div>
                
                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => handleMoveToCart(product)}
                    className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                    disabled={product.stock === 0}
                  >
                    <ShoppingBag size={16} />
                    {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserWishlist;