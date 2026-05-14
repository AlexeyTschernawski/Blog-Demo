import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../assets/assets';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error'

  const navigate = useNavigate();

  
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axios.get(`/api/auth/validate-reset-token/${token}`);
        if (response.data.success) {
          setTokenValid(true);
        }
      } catch (error) {
        setMessage('This password reset link is invalid or has expired.');
        setMessageType('error');
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setMessage('Invalid reset link');
      setMessageType('error');
      setValidating(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // Валидация
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setMessageType('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, {
        password,
        confirmPassword
      });
      
      if (response.data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setMessageType('success');
        
    
        setTimeout(() => {
          if (response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl;
          } else {
            navigate('/login');
          }
        }, 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
      setMessageType('error');
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex items-center justify-center w-[90%] sm:max-w-4xl m-auto mt-14 gap-10">
        <img
          src={assets.logoShort}
          alt="Logo"
          className="hidden sm:block object-contain h-full max-h-[350px]"
        />

        <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 mb-10'>
          <div className='inline-flex items-center gap-2 mb-6 mt-6'>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
            <p className='prata-regular text-3xl font-bold'>Invalid Link</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
          </div>

          <div className="w-full p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
            {message || 'This password reset link is invalid or has expired.'}
          </div>

          <Link 
            to="/forgot-password"
            className="w-full bg-black text-white font-semibold px-8 py-3 mt-2 rounded-lg text-center hover:bg-gray-800"
          >
            Request New Link
          </Link>

          <Link 
            to="/login"
            className="w-full bg-gray-200 text-gray-800 font-semibold px-8 py-3 rounded-lg text-center hover:bg-gray-300"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-[90%] sm:max-w-4xl m-auto mt-14 gap-10">
      <img
        src={assets.logoShort}
        alt="Logo"
        className="hidden sm:block object-contain h-full max-h-[350px]"
      />

      <form onSubmit={handleSubmit} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 mb-10'>
        <div className='inline-flex items-center gap-2 mb-6 mt-6'>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
          <p className='prata-regular text-3xl font-bold'>New Password</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>

        <p className="text-gray-600 text-center mb-6">
          Please enter your new password below.
        </p>

        <div className="w-full space-y-4">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className='w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-800 focus:ring-1 focus:ring-gray-800'
            placeholder='New password (min 8 characters)'
            required
          />
          
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            className='w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-800 focus:ring-1 focus:ring-gray-800'
            placeholder='Confirm new password'
            required
          />
          
          {password.length > 0 && password.length < 8 && (
            <p className="text-red-500 text-sm font-medium">
              ⚠️ Password must be at least 8 characters
            </p>
          )}
          
          {password.length >= 8 && password !== confirmPassword && confirmPassword.length > 0 && (
            <p className="text-red-500 text-sm font-medium">
              ⚠️ Passwords do not match
            </p>
          )}
          
          {password.length >= 8 && password === confirmPassword && confirmPassword.length > 0 && (
            <p className="text-green-600 text-sm font-medium">
              ✓ Passwords match
            </p>
          )}
        </div>
        
   
        {message && (
          <div className={`w-full p-4 rounded-lg text-center font-medium ${
            messageType === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <div className="flex items-center justify-center">
              {messageType === 'success' ? '✓' : '⚠️'} {message}
            </div>
          </div>
        )}

        <div className='w-full flex justify-between text-sm mt-2'>
          <Link to="/login" className='text-gray-600 hover:text-gray-800 transition-colors'>
            ← Back to Login
          </Link>
        </div>
        
        <button
          type="submit"
          disabled={loading || password.length < 8 || password !== confirmPassword}
          className={`w-full bg-black text-white font-semibold px-8 py-3 mt-2 
          rounded-lg transition-all duration-200 text-base
          ${loading || password.length < 8 || password !== confirmPassword
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-800 active:scale-[0.98]'}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting...
            </span>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;