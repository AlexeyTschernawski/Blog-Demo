import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../assets/assets';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error'

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setLoading(true);

    if (!email || email === '') {
      setMessage('Please enter your email address');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        setMessage('If an account exists with this email, you will receive a password reset link.');
        setMessageType('success');
        setEmail('');
        
     
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

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
          <p className='prata-regular text-3xl font-bold'>Reset Password</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>

        <p className="text-gray-600 text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className='w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-800 focus:ring-1 focus:ring-gray-800'
          placeholder='Enter your email'
          required
        />
        
   
        {message && (
          <div className={`w-full p-4 rounded-lg text-center font-medium ${
            messageType === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <div className="flex items-center justify-center">
              {messageType === 'success' ? '✓' : '⚠️'} {message}
            </div>
            {messageType === 'success' && (
              <p className="text-sm mt-2 text-gray-600">
                Redirecting to login in 5 seconds...
              </p>
            )}
          </div>
        )}

        <div className='w-full flex justify-between text-sm mt-2'>
          <Link to="/login" className='text-gray-600 hover:text-gray-800 transition-colors'>
            ← Back to Login
          </Link>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-black text-white font-semibold px-8 py-3 mt-2 
          rounded-lg transition-all duration-200 text-base
          ${loading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-800 active:scale-[0.98]'}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;