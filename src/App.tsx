import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './components/auth/LoginScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
      </Routes>
    </Router>
  );
}

export default App;