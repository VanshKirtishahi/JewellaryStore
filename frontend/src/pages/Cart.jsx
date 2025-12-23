import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Trash2, CreditCard, ArrowRight, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to checkout");
      navigate('/login');
      return;
    }

    try {
      const orderData = {
        userId: user.id || user._id,
        products: cartItems.map(item => ({
          productId: item._id,
          quantity: item.qty,
          priceAtPurchase: item.price
        })),
        totalAmount: total,
        shippingAddress: user.address || "Address Pending", // Use user address if available
        status: "Pending"
      };

      await axios.post('/orders', orderData);
      alert("Order Placed Successfully!");
      clearCart();
      navigate('/user/orders'); // Redirect to My Orders page
    } catch (err) {
      console.error(err);
      alert("Checkout Failed. Please try again.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't discovered our treasures yet. Browse our collection to find something timeless.</p>
        <button onClick={() => navigate('/collections')} className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition font-medium">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Shopping Bag ({cartItems.length} items)</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="flex-1 space-y-6">
          {cartItems.map((item) => (
            <div key={item._id} className="flex gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">{item.category}</p>
                  <p className="font-serif text-jewel-gold font-bold text-lg">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end justify-between">
                  <button 
                    onClick={() => removeFromCart(item._id)} 
                    className="group p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                  <div className="bg-gray-50 px-4 py-1 rounded-full text-sm font-medium text-gray-600 border border-gray-100">
                    Qty: {item.qty}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 h-fit bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
          <h3 className="text-xl font-bold mb-6 font-serif">Order Summary</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-xl text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group shadow-lg hover:shadow-xl"
          >
            Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs uppercase tracking-widest">
            <CreditCard size={14} /> Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;