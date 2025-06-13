import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './components/auth/LoginScreen';
import DashboardLayout from './components/dashboard/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashboardLayout currentUser={''} onLogout={function (): void {
          throw new Error('Function not implemented.');
        } } />} />
      </Routes>
    </Router>
  );
}

export default App;