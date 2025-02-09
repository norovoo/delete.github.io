import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login-lite';
import { jwtDecode } from "jwt-decode";
import './Login.css';
import Logo from '../assets/Logo.png';  
import config from '../config';

const GOOGLE_CLIENT_ID = "151539578939-k6092m5civ46sikpfdbr2o4mlt1iut62.apps.googleusercontent.com"; 
const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID"; // <-- Replace with your Facebook App ID

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('username', response.data.username || 'User');

        onLoginSuccess(response.data.token, response.data.username);
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

  const GOOGLE_LOGIN_URL = 'https://nloce1biof.execute-api.us-east-1.amazonaws.com/default/loginAuth';

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google token to the Lambda backend
      const googleResponse = await axios.post(GOOGLE_LOGIN_URL, {
        token: credentialResponse.credential,
      });
  
      // Handle the response from Lambda
      if (googleResponse.data?.token) {
        localStorage.setItem('authToken', googleResponse.data.token);
        localStorage.setItem('username', googleResponse.data
  
  .username);
  
        // Trigger successful login in your app
        onLoginSuccess(googleResponse.data.token, googleResponse.data.username);
  
        // Navigate to the dashboard
        navigate('/dashboard');
      } else {
        setError('Unexpected response from the server.');
      }
    } catch (error) {
      setError('Google login failed. Please try again.');
      console.error('Google Login Error:', error);
    }
  };

  // ✅ Handle Facebook Login
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-container">
        <img src={Logo} alt="Logo" width={200} className="login-logo" /> 
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}

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

        {/* Google Login */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          redirectUri="https://chipper-caramel-8d3fab.netlify.app/auth/google/callback"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;