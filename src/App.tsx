import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './components/auth/LoginScreen';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
  const { user, logout } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout 
              currentUser={user?.name || 'Usuario'} 
              onLogout={logout} 
            />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;