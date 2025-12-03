import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
// If you want the fancy sidebar, change this to: import AdminLayout from './layouts/AdminLayout';
import AdminLayout from './pages/admin/AdminLayout'; 

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import CustomDesignRequest from './pages/user/CustomDesignRequest'; 

// User Pages
import UserDashboard from './pages/user/UserDashboard';

// Admin Pages
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomRequestsAdmin from './pages/admin/CustomRequestsAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC & USER ROUTES */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/custom-request" element={<CustomDesignRequest />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected User Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<h2 className="text-2xl font-bold">Dashboard Overview</h2>} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          
          {/* FIX: Changed path from "requests" to "custom-requests" to match your sidebar link */}
          <Route path="custom-requests" element={<CustomRequestsAdmin />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;