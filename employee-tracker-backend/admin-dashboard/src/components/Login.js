import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login';
import './Login.css';
import Logo from '../assets/Logo.png';  
import config from '../config';

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; 
const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID"; 

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState(false); 

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogout = (message) => {
    localStorage.clear();
    onLoginSuccess(null, null);
    navigate('/login', { state: { message } });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.BASE_URL}/api/auth/login`, { email, password });

      if (response.data?.token) {
        const token = response.data.token;
        const username = response.data.username || 'User';

        localStorage.setItem('authToken', token);
        localStorage.setItem('username', username);

        onLoginSuccess(token, username);
        navigate('/dashboard');
      } else {
        setError('Unexpected response from the server.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Google Login Success
  const handleGoogleSuccess = async (response) => {
    try {
      const { tokenId } = response;
      const googleResponse = await axios.post(`${config.BASE_URL}/api/auth/google-login`, { tokenId });

      if (googleResponse.data?.token) {
        localStorage.setItem('authToken', googleResponse.data.token);
        localStorage.setItem('username', googleResponse.data.username || 'Google User');

        onLoginSuccess(googleResponse.data.token, googleResponse.data.username);
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Google login failed. Please try again.');
    }
  };

  // ✅ Handle Facebook Login Success
  const handleFacebookSuccess = async (response) => {
    try {
      const { accessToken, userID } = response;
      const fbResponse = await axios.post(`${config.BASE_URL}/api/auth/facebook-login`, { accessToken, userID });

      if (fbResponse.data?.token) {
        localStorage.setItem('authToken', fbResponse.data.token);
        localStorage.setItem('username', fbResponse.data.username || 'Facebook User');

        onLoginSuccess(fbResponse.data.token, fbResponse.data.username);
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Facebook login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <img src={Logo} alt="Logo" width={200} className="login-logo" /> 
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      {warning && <p className="warning-message">You will be logged out due to inactivity in 1 minute.</p>}
      
      <div className="login-form">
        <input
          type="email"
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} className="login-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      {/* ✅ Google Login Button */}
      <GoogleLogin
        clientId={GOOGLE_CLIENT_ID}
        buttonText="Sign in with Google"
        onSuccess={handleGoogleSuccess}
        onFailure={() => setError('Google login failed')}
        cookiePolicy={'single_host_origin'}
        render={(renderProps) => (
          <button onClick={renderProps.onClick} className="google-button">
            Sign in with Google
          </button>
        )}
      />

      {/* ✅ Facebook Login Button */}
      <FacebookLogin
        appId={FACEBOOK_APP_ID}
        autoLoad={false}
        fields="name,email,picture"
        callback={handleFacebookSuccess}
        render={(renderProps) => (
          <button onClick={renderProps.onClick} className="facebook-button">
            Sign in with Facebook
          </button>
        )}
      />

      <div className="login-links">
        <Link to="/forgot-password">Forgot Password?</Link>
        <Link to="/register">Create New Account</Link>
      </div>
    </div>
  );
};

export default Login;