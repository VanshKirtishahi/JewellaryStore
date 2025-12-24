import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomRequestsAdmin from './pages/admin/CustomRequestsAdmin';
import CustomerManagement from './pages/admin/CustomerManagement';
import Analytics from './pages/admin/Analytics';

function App() {
  return (
    <BrowserRouter>
      {/* 1. Wrap everything in AuthProvider so useContext works */}
      <AuthProvider>
        <Routes>
          {/* Default Redirect to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute roleRequired="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="requests" element={<CustomRequestsAdmin />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Route>

          {/* Catch all: Redirect to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;