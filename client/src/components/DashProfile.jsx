import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/user/userSlice';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const CustomAlert = ({ color, children, className = '' }) => {
  const colorClasses = {
    failure: 'bg-red-100 border-red-500 text-red-700',
    success: 'bg-green-100 border-green-500 text-green-700',
  };
  
  return (
    <div 
      className={`px-4 py-3 rounded-lg border-l-4 shadow-md ${colorClasses[color]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
};

const CustomButton = ({ 
  children, 
  type = 'button', 
  gradientDuoTone, 
  outline, 
  disabled, 
  color = 'gray',
  className = '',
  ...props 
}) => {
  const baseClasses = "w-full px-4 py-2 font-semibold rounded-lg transition duration-150 ease-in-out transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-offset-2";
  
  const getColorClasses = () => {
    if (gradientDuoTone === 'purpleToBlue') {
      return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 hover:from-purple-700 hover:to-blue-700 focus:ring-blue-500';
    }
    if (gradientDuoTone === 'purpleToPink') {
      return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/50 hover:from-purple-700 hover:to-pink-700 focus:ring-pink-500';
    }
    switch(color) {
      case 'failure':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      case 'gray':
      default:
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400';
    }
  };
  
  const colorClasses = getColorClasses();
  const outlineClasses = outline ? 'bg-transparent border border-current' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : '';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${colorClasses} ${outlineClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const CustomTextInput = ({ 
  type = 'text', 
  id, 
  placeholder, 
  defaultValue, 
  onChange,
  className = '',
  disabled = false,
}) => (
  <input
    type={type}
    id={id}
    placeholder={placeholder}
    defaultValue={defaultValue}
    onChange={onChange}
    disabled={disabled}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out ${className}`}
  />
);

const CustomModal = ({ show, onClose, children, size = 'md' }) => {
  if (!show) return null;
  
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/20 to-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full transition-all duration-300 transform scale-100 ${sizeClasses[size]}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const CustomModalBody = ({ children }) => (
  <div className="p-6">
    {children}
  </div>
);

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(currentUser.profilePicture || '');
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccessMsg, setUpdateUserSuccessMsg] = useState(null);
  const [updateUserErrorMsg, setUpdateUserErrorMsg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setImageFileUploadError('File size must be less than 10MB');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        const confirmUpload = window.confirm(
          `This image is ${(file.size / (1024 * 1024)).toFixed(1)}MB. It will be compressed for better performance. Continue?`
        );
        if (!confirmUpload) return;
      }

      if (!file.type.startsWith('image/')) {
        setImageFileUploadError('Please select an image file');
        return;
      }

      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file)); 
      setImageFileUploadError(null);
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    setImageFileUploadProgress(0);

    const data = new FormData();
    data.append('image', imageFile);

    try {
      const interval = setInterval(() => {
        setImageFileUploadProgress(p => p < 90 ? p + 10 : 90);
      }, 300);

      const endpoint = imageFile.size > 2 * 1024 * 1024 
        ? '/api/user/upload-compressed' 
        : '/api/user/upload';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.compressionRatio) {
        console.log(`Image compressed: ${result.originalSize}MB → ${result.compressedSize}MB (${result.compressionRatio} reduction)`);
        setUpdateUserSuccessMsg(`Image uploaded and compressed from ${result.originalSize}MB to ${result.compressedSize}MB`);
      }
      
      setImageFileUrl(result.url);
      setFormData(prev => ({ 
        ...prev, 
        profilePicture: result.url,
        profilePictureFileId: result.fileId
      }));
      setImageFileUploadProgress(100);
      
    } catch (error) {
      setImageFileUploadError(error.message || 'Could not upload image. Try again.');
      setImageFileUploadProgress(0);
      setImageFileUrl(currentUser.profilePicture);
      setImageFile(null);
    } finally {
      setImageFileUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserErrorMsg(null);
    setUpdateUserSuccessMsg(null);
    
    if (Object.keys(formData).length === 0) {
      setUpdateUserErrorMsg('No changes made');
      return;
    }
    
    if (imageFileUploading) {
      setUpdateUserErrorMsg('Please wait for image to upload');
      return;
    }
    
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserErrorMsg(data.message);
      } else {
        dispatch(updateSuccess(data.user)); 
        setUpdateUserSuccessMsg("User's profile updated successfully");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserErrorMsg(error.message);
    }
  };
  
  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    try {
      const res = await fetch(`/api/user/delete-profile-picture/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      dispatch(updateSuccess(data.user));
      setImageFileUrl(data.user.profilePicture);
      setFormData({});
      setUpdateUserSuccessMsg(data.message);
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setUpdateUserErrorMsg(error.message);
    }
  };
  
  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 text-center font-extrabold text-4xl text-gray-800 dark:text-white'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        <input
          type='file'
          accept='image/*'
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />

        <div className='text-red-600 text-center mt-5 font-medium'>
          <span onClick={handleDeleteProfilePicture} className='cursor-pointer hover:underline'>
            Remove Profile Picture
          </span>
        </div>

        <div
          className='relative w-32 h-32 self-center cursor-pointer shadow-xl overflow-hidden rounded-full transition duration-300 hover:opacity-90'
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress !== null && imageFileUploadProgress < 100 && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 },
                path: { stroke: `rgba(139, 92, 246, ${imageFileUploadProgress / 100})` },
                trail: { stroke: '#d6d6d6' },
                text: { fill: '#1f2937', fontSize: '18px', fontWeight: 'bold' }
              }}
            />
          )}

          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt='user'
            className={`rounded-full w-full h-full object-cover border-4 border-gray-300 dark:border-gray-600 ${
              imageFileUploadProgress > 0 && imageFileUploadProgress < 100 && 'opacity-60'
            }`}
          />
        </div>

        {imageFileUploadError && (
          <CustomAlert color='failure'>{imageFileUploadError}</CustomAlert>
        )}
        
        <CustomTextInput
          type='text'
          id='username'
          placeholder='username'
          defaultValue={currentUser.username}
          onChange={handleChange}
          maxLength='20'
        />
        <div className='flex justify-between mt-1 px-1'>
          <p className='text-[10px] text-gray-400 uppercase tracking-wider'>Maximum 20 characters</p>
          <p className={`text-xs font-medium ${
            (formData.username?.length || currentUser.username.length) >= 20 ? 'text-red-500' : 'text-gray-400'
          }`}>
            {formData.username !== undefined ? formData.username.length : currentUser.username.length} / 20
          </p>
        </div>
        
        <CustomTextInput
          type='email'
          id='email'
          placeholder='email'
          defaultValue={currentUser.email}
          onChange={handleChange}
          disabled
          className="bg-gray-100 cursor-not-allowed opacity-70"
        />
        <CustomTextInput
          type='password'
          id='password'
          placeholder='password'
          onChange={handleChange}
        />

        <div className="min-h-[24px] ml-1">
          {formData.password && formData.password.length > 0 && (
            formData.password.length < 8 ? (
              <p className="text-yellow-600 text-sm mt-1">⚠️ Password must be at least 8 characters</p>
            ) : (
              <p className="text-green-500 text-sm mt-1">✓ Password length is good</p>
            )
          )}
        </div>
        
        <CustomButton type='submit' gradientDuoTone='purpleToBlue' disabled={loading || imageFileUploading}>
          {loading ? 'Loading...' : 'Update Profile'}
        </CustomButton>
        
        {currentUser.isAdmin && (
          <Link to={'/create-post'}>
            <CustomButton type='button' gradientDuoTone='purpleToPink'>
              Create a post
            </CustomButton>
          </Link>
        )}
      </form>
      
      <div className='text-red-600 flex justify-between mt-5 font-medium'>
        <span onClick={() => setShowModal(true)} className='cursor-pointer hover:underline'>Delete Account</span>
        <span onClick={handleSignout} className='cursor-pointer hover:underline'>Sign Out</span>
      </div>
      
      {updateUserSuccessMsg && (
        <CustomAlert color='success' className='mt-5'>{updateUserSuccessMsg}</CustomAlert>
      )}
      {updateUserErrorMsg && (
        <CustomAlert color='failure' className='mt-5'>{updateUserErrorMsg}</CustomAlert>
      )}
      {error && (
        <CustomAlert color='failure' className='mt-5'>{error}</CustomAlert>
      )}
      
      <CustomModal show={showModal} onClose={() => setShowModal(false)} size='md'>
        <CustomModalBody>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-6 text-lg font-medium text-gray-500 dark:text-gray-400'>
              Are you sure you want to delete your account? This action cannot be undone.
            </h3>
            <div className='flex justify-center gap-4'>
              <CustomButton color='failure' onClick={handleDeleteUser}>Yes, I'm sure</CustomButton>
              <CustomButton color='gray' onClick={() => setShowModal(false)}>No, cancel</CustomButton>
            </div>
          </div>
        </CustomModalBody>
      </CustomModal>
    </div>
  );
}