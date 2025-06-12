import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LogoCecyte from '../../assets/LogoCecyte.png';
import './LoginScreen.css';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: false, password: false });
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newErrors = {
      username: !username.trim(),
      password: !password.trim()
    };
    
    setErrors(newErrors);
    
    if (!newErrors.username && !newErrors.password) {
      login(username);
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
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                className={errors.username ? 'error' : ''}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && <p className="error-message">Por favor ingrese un usuario</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className={errors.password ? 'error' : ''}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="error-message">Por favor ingrese una contraseña</p>}
            </div>
            
            <div className="form-group">
              <button type="submit" className="submit-button">
                Iniciar Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
