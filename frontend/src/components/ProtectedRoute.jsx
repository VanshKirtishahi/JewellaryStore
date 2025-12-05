import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // 1. If not logged in, go to Login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. If role is specified (e.g., 'admin') and user doesn't have it, go Home
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;