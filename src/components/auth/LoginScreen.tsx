import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoCecyte from '../../assets/LogoCecyte.png';
import './LoginScreen.css';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newErrors = {
      email: !email.trim() || !validateEmail(email.trim()),
      password: !password.trim()
    };
    
    setErrors(newErrors);
    setErrorMessage('');
    
    if (!newErrors.email && !newErrors.password) {
      try {
        setLoading(true);
        
        const response = await api.post('/login', {
          email: email.trim(),
          password
        });

        const { user, access_token } = response.data;

        // Usar el método login del contexto de autenticación
        login(user, access_token);
        
        // Redirigir al dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error en el login:', error);
        setErrorMessage(
          error instanceof Error ? 
          error.message : 
          'Error desconocido al iniciar sesión'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-screen">
      <div className="login-content">
        <div className="login-box">
          <div className="login-header">
            <img src={LogoCecyte} alt="Logo Cecyte" />
            <h1>COSII</h1>
            <p>Control de órdenes y servicios e inventario interno</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className={errors.email ? 'error' : ''}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {errors.email && (
                <p className="error-message">
                  {!email.trim() ? 'Por favor ingrese un correo electrónico' : 'Ingrese un correo electrónico válido'}
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className={errors.password ? 'error' : ''}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {errors.password && <p className="error-message">Por favor ingrese una contraseña</p>}
            </div>
            
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            
            <div className="form-group">
              <button 
                type="submit" 
                className="orange-button"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;