import React, { useState } from 'react';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Replace with your API call
      console.log('Sending email to:', email);
      setMessage('Password reset link has been sent to your email.');
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link.</p>
        <input
          type="email"
          className="forgot-password-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="forgot-password-button"
          onClick={handleForgotPassword}
          disabled={loading || !email}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        {message && <p>{message}</p>}
        <div className="forgot-password-links">
          <a href="/login">Back to Login</a>
          <a href="/register">Create New Account</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;