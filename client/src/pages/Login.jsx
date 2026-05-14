import React, { useEffect, useState} from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [setPasswordError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [hasUrlMessage, setHasUrlMessage] = useState(false);

  const { loading } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlMessage = params.get('message');
    const type = params.get('type');
    const emailParam = params.get('email');
    

    if (urlMessage && !hasUrlMessage) {
      const decodedMessage = decodeURIComponent(urlMessage);
      setMessage({ 
        text: decodedMessage, 
        type: type || (decodedMessage.includes('successfully') ? 'success' : 'error') 
      });
      setHasUrlMessage(true);
      
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
      
  
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search, hasUrlMessage]);


  useEffect(() => {
    if (message.text && message.type === 'success') {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 8000);
      
      return () => clearTimeout(timer);
    } else if (message.text && message.type === 'error') {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ text: '', type: '' });
    setPasswordError('');


    if (currentState === 'Sign Up' && password.length < 8) {
      setMessage({ 
        text: 'Password must be at least 8 characters long', 
        type: 'error' 
      });
      return;
    }

    try {
      if (currentState === 'Sign Up') {
   
        const response = await axios.post('/api/auth/signup', { 
          username: name, 
          email, 
          password 
        });
        
        if (response.data.success) {
          setMessage({ 
            text: '🎉 Registration successful! Please check your email to verify your account before logging in.', 
            type: 'success' 
          });
          setCurrentState('Login');
          setName('');
          setEmail('');
          setPassword('');
        }
      } else {
      
        dispatch(signInStart());
        const response = await axios.post('/api/auth/signin', 
          { email, password }, 
          { withCredentials: true }
        );
        
        dispatch(signInSuccess(response.data));
        navigate('/');
      }
    } catch (error) {
      let errorMsg = '';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
        
 
        if (errorMsg.includes('verify your email')) {
          errorMsg = 'Please verify your email address before logging in. Check your email for the verification link.';
        } else if (errorMsg.includes('User with this email')) {
          errorMsg = 'User with this email or username already exists.';
        }
      } else if (currentState === 'Login') {
        errorMsg = 'Incorrect email or password';
      } else {
        errorMsg = 'An unexpected error occurred. Please try again.';
      }
      
      setMessage({ text: errorMsg, type: 'error' });
      
      if (currentState === 'Login') {
        dispatch(signInFailure(errorMsg));
      }
    }
  };

  const toggleFormState = () => {
    const newState = currentState === 'Login' ? 'Sign Up' : 'Login';
    setCurrentState(newState);
    setMessage({ text: '', type: '' });
    setPasswordError('');
    

    if (newState === 'Login') {
      setName('');
    } else {
  
      setName('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="flex items-center justify-center w-[90%] sm:max-w-4xl m-auto mt-14 gap-10">
      <img
        src={assets.imageLogin}
        alt="Logo"
        className="hidden sm:block object-contain h-full max-h-[350px]"
      />

      <form onSubmit={handleSubmit} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 mb-10'>
        <div className='inline-flex items-center gap-2 mb-3 mt-10'>
          <hr className='border-none h-[1.5px] w-4 bg-gray-800' />
          <p className='prata-regular text-3xl'>{currentState}</p>
          <hr className='border-none h-[1.5px] w-4 bg-gray-800' />
        </div>

        {currentState === 'Sign Up' && (
          <div className='w-full'>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              maxLength={20}
              className='w-full px-3 py-2 rounded border border-gray-800 placeholder-gray-500'
              placeholder='Name'
              required
            />
            <div className='flex justify-between mt-1 px-1'>
              <p className='text-[10px] text-gray-400 uppercase tracking-wider'>
                Max 20 characters
              </p>
              <p className={`text-xs font-medium ${name.length >= 20 ? 'text-red-500' : 'text-gray-400'}`}>
                {name.length} / 20
              </p>
            </div>
          </div>
)}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className='w-full px-3 py-2 rounded border border-gray-800 placeholder-gray-500'
          placeholder='Email'
          required
        />
        
        <div className='w-full'>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className='w-full px-3 py-2 rounded border border-gray-800 placeholder-gray-500'
            placeholder={currentState === 'Sign Up' ? 'Password (min 8 characters)' : 'Password'}
            required
          />
          {currentState === 'Sign Up' && password.length > 0 && password.length < 8 && (
            <p className="text-yellow-600 text-sm mt-1">
              ⚠️ Password must be at least 8 characters
            </p>
          )}
          {currentState === 'Sign Up' && password.length >= 8 && (
            <p className="text-green-500 text-sm mt-1">
              ✓ Password length is good
            </p>
          )}
        </div>

       
        {message.text && (
          <div className={`w-full p-4 rounded-lg text-sm text-center font-medium animate-fadeIn shadow-md ${
            message.type === 'error' 
              ? 'bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 text-red-800' 
              : message.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-800'
              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 text-blue-800'
          }`}>
            <div className="flex items-start">
              {message.type === 'success' && (
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {message.type === 'error' && (
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <div className="text-left flex-1">
                <p className="font-semibold">{message.text}</p>
                {message.type === 'success' && (
                  <p className="text-xs mt-1 opacity-80">
                    
                  </p>
                )}
              </div>
              <button 
                onClick={() => setMessage({ text: '', type: '' })}
                className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className='w-full flex justify-between text-sm mt-[-1px]'>
          <p
            onClick={() => navigate('/forgot-password')}
            className='cursor-pointer text-gray-600 hover:text-gray-800 transition-colors'
          >
            Forgot your password?
          </p>
          <p 
            onClick={toggleFormState} 
            className='cursor-pointer text-blue-600 hover:text-blue-800 font-medium transition-colors'
          >
            {currentState === 'Login' ? 'Create account' : 'Login Here'}
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading || (currentState === 'Sign Up' && password.length < 8)}
          className={`w-full bg-gradient-to-r from-black to-gray-800 text-white font-medium px-8 py-3 mt-4 
          rounded-lg transition-all duration-200 text-lg
          ${loading || (currentState === 'Sign Up' && password.length < 8) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:opacity-90 active:scale-[0.98] hover:shadow-lg transform'}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            currentState
          )}
        </button>
        
        <div className="w-full relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <OAuth />
        
        {currentState === 'Sign Up' && (
          <div className="text-xs text-gray-500 text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;