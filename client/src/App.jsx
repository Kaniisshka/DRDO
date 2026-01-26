import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Redirect root to dashboard (or login if not auth) handled by dashboard protection or specific landing */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Fallback for unauthorized/404 */}
          <Route path="/unauthorized" element={<div className="p-10 text-center text-red-500">Unauthorized Access</div>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
