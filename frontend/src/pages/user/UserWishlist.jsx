import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, Star, ArrowRight, Gem } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios'; // Ensure you have this configured

const UserWishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Wishlist (Simulated or Real)
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // NOTE: If you haven't created a backend /wishlist endpoint yet,
        // this will fail. For now, I'll check localStorage or return empty.
        const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        
        if (storedWishlist.length > 0) {
           // If storing IDs, you might need to fetch product details here
           // For now, we assume storedWishlist has full product objects
           setWishlistItems(storedWishlist);
        } else {
           // Optional: Try fetching from API if you implement it later
           // const res = await axios.get('/wishlist');
           // setWishlistItems(res.data);
        }
      } catch (err) {
        console.error("Error fetching wishlist", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeFromWishlist = (id) => {
    const updatedList = wishlistItems.filter(item => item._id !== id);
    setWishlistItems(updatedList);
    localStorage.setItem('wishlist', JSON.stringify(updatedList));
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
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-jewel-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-3">
            My Wishlist
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </h1>
          <p className="text-gray-500 mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        <button 
          onClick={() => navigate('/collections')}
          className="text-sm font-medium text-jewel-gold hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          Browse Collections <ArrowRight size={16} />
        </button>
      </div>

      {/* Content */}
      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Your wishlist is empty</h3>
          <p className="text-gray-500 mt-2 mb-8 max-w-md mx-auto">
            Save your favorite pieces here to keep track of them or share with friends.
          </p>
          <button 
            onClick={() => navigate('/collections')}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img 
                  src={product.images?.[0] || 'https://via.placeholder.com/400?text=Jewelry'} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <button 
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <Trash2 size={18} />
                </button>
                {product.stock < 5 && product.stock > 0 && (
                  <span className="absolute bottom-3 left-3 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                    Low Stock
                  </span>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{product.category}</p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={12} className="fill-current" />
                    <span className="text-xs font-bold">4.9</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{product.title}</h3>
                <p className="text-lg font-serif font-bold text-jewel-gold mb-4">
                  {formatCurrency(product.price)}
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                  <button className="p-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center">
                    <ShoppingBag size={20} />
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