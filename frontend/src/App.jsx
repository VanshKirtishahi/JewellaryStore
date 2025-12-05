import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './pages/admin/AdminLayout';
import UserLayout from './pages/user/UserLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import CustomDesignRequest from './pages/CustomDesignRequest';
import TrackCustomRequest from './pages/user/TrackCustomRequest';
import Collections from './pages/Collections';
// import Contact from './pages/Contact';
import About from './pages/About';
// import Gallery from './pages/Gallery';
import TrackOrder from './pages/user/TrackOrder';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import MyOrders from './pages/user/MyOrders';
// import UserRequests from './pages/user/UserRequests';
import UserWishlist from './pages/user/UserWishlist';
import UserSettings from './pages/user/UserSettings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomRequestsAdmin from './pages/admin/CustomRequestsAdmin';
import CustomerManagement from './pages/admin/CustomerManagement';
import Analytics from './pages/admin/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC ROUTES WITH MAIN LAYOUT */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/custom-request" element={<CustomDesignRequest />} />
          {/* <Route path="/gallery" element={<Gallery />} /> */}
          <Route path="/about" element={<About />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
          {/* <Route path="/track-order" element={<TrackOrder />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* PROTECTED USER ROUTES WITH USER LAYOUT */}
        <Route path="/user" element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="requests" element={<TrackCustomRequest />} />
          <Route path="wishlist" element={<UserWishlist />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="settings" element={<UserSettings />} />
          <Route index element={<UserDashboard />} />
        </Route>

        {/* PROTECTED ADMIN ROUTES WITH ADMIN LAYOUT */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="requests" element={<CustomRequestsAdmin />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Redirect old dashboard route to new user dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route index element={<UserDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;