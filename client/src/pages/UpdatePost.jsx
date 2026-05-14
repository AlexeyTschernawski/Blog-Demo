import { Alert, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useState, useRef, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


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
  const baseClasses = "px-4 py-2 font-semibold rounded-lg transition duration-150 ease-in-out transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-offset-2";
  
  const getColorClasses = () => {
    if (gradientDuoTone === 'purpleToBlue') {
      return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 hover:from-purple-700 hover:to-blue-700 focus:ring-blue-500';
    }
    if (gradientDuoTone === 'purpleToPink') {
      return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/50 hover:from-purple-700 hover:to-pink-700 focus:ring-pink-500';
    }
    
    // Default color classes
    switch(color) {
        case 'failure':
            return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
        case 'success':
            return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
        case 'gray':
        default:
            return 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400';
    }
  };
  
  const colorClasses = getColorClasses();
  const outlineClasses = outline 
    ? 'bg-transparent border border-current' 
    : '';
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


const SuccessAlert = ({ message, onDismiss }) => {
  return (
    <div className="flex items-center p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800" role="alert">
      <div className="ms-3 text-sm font-medium">
        {message}
      </div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
        onClick={onDismiss}
      >
        <span className="sr-only">Close</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
  );
};

export default function UpdatePost() {
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'uncategorized',
    image: '',
    imageFileId: ''
  });
  const [publishError, setPublishError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const filePickerRef = useRef();
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

 
  useEffect(() => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    
    if (!postId || postId === "undefined") {
      setPublishError("Invalid post ID");
      setIsLoading(false);
      return;
    }
  }, [currentUser, postId, navigate]);

 
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/post/getposts?postId=${postId}`, {
          credentials: "include",
        });

        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Server returned non-JSON:", text.substring(0, 200));
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!res.ok) {
          setPublishError(data.message || `Error ${res.status}`);
          setIsLoading(false);
          return;
        }

    
        if (!data.posts || data.posts.length === 0) {
          setPublishError("Post not found");
          setIsLoading(false);
          return;
        }

        const post = data.posts[0];
        console.log('Fetched post:', post);
        
    
        setFormData({
          _id: post._id,
          title: post.title || '',
          content: post.content || '',
          category: post.category || 'uncategorized',
          image: post.image || '',
          imageFileId: post.imageFileId || ''
        });
        
      
        if (post.image) {
          setImageFileUrl(post.image);
        }
        
      } catch (error) {
        console.log('Fetch post error:', error.message);
        setPublishError("Failed to load post: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (postId && postId !== "undefined") {
      fetchPost();
    }
  }, [postId]);

  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
     
      if (file.size > 10 * 1024 * 1024) {
        setImageUploadError('File size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setImageUploadError('Please select an image file');
        return;
      }

      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
      setImageUploadError(null);

      setSuccessMessage(null);
      setPublishError(null);
    }
  };

  
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  
  const uploadImage = async () => {
    setImageUploading(true);
    setImageUploadError(null);
    setImageUploadProgress(0);

    const data = new FormData();
    data.append('image', imageFile);

    try {
     
      const endpoint = imageFile.size > 2 * 1024 * 1024 
        ? '/api/post/upload-compressed'
        : '/api/post/upload';

      console.log('Uploading image to:', endpoint);

 
      const interval = setInterval(() => {
        setImageUploadProgress(prev => prev < 90 ? prev + 10 : 90);
      }, 300);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      clearInterval(interval);

      if (!response.ok) {
   
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to upload images.');
        }
        
        const errorText = await response.text();
        console.error('Upload error:', errorText);
        throw new Error(errorText || 'Upload failed');
      }

      const result = await response.json();
      
   
      if (result.compressionRatio) {
        console.log(`Image compressed: ${result.originalSize}MB → ${result.compressedSize}MB`);
      }
      
      setFormData(prev => ({ 
        ...prev, 
        image: result.url,
        imageFileId: result.fileId
      }));
      setImageUploadProgress(100);
      
      setTimeout(() => {
        setImageUploadProgress(null);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setImageUploadError(error.message || 'Could not upload image. Try again.');
      setImageUploadProgress(null);
      setImageFile(null);
      setImageFileUrl(null);
    } finally {
      setImageUploading(false);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    

    if (!postId || !currentUser?._id) {
      setPublishError('Invalid post or user ID');
      return;
    }

    setIsSubmitting(true);
    setPublishError(null);
    setSuccessMessage(null);

    console.log('🔄 Updating post...');
    console.log('Post ID:', postId);
    console.log('User ID:', currentUser._id);
    console.log('Form data:', formData);

  
    if (!formData.title || !formData.content) {
      setPublishError('Please fill in all required fields: title and content');
      setIsSubmitting(false);
      return;
    }

    if (!formData.image) {
      setPublishError('Please upload an image first');
      setIsSubmitting(false);
      return;
    }

    try {
 
      const res = await fetch(
        `/api/post/updatepost/${postId}/${currentUser._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setPublishError(data.message);
        setIsSubmitting(false);
        return;
      }


      setSuccessMessage('Post updated successfully!');
      setFormData(prev => ({ ...prev, ...data }));
      
      console.log('Post updated successfully:', data);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

    } catch (error) {
      console.error('Network error:', error);
      setPublishError('Network error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleFormChange = () => {
    if (successMessage || publishError) {
      setSuccessMessage(null);
      setPublishError(null);
    }
  };

  
  if (isLoading) {
    return (
      <div className="p-3 max-w-3xl mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-600">Loading post data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Update post</h1>
      
 
      {successMessage && (
        <SuccessAlert 
          message={successMessage} 
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              handleFormChange();
            }}
            value={formData.title}
          />
          <Select
            onChange={(e) => {
              setFormData({ ...formData, category: e.target.value });
              handleFormChange();
            }}
            value={formData.category}
          >
            <option value='uncategorized'>Select a category</option>
            <option value='world'>World</option>
            <option value='politics'>Politics</option>
            <option value='tech'>tech/IT</option>
            <option value='business'>Business</option>
            <option value='health'>Health</option>
            <option value='entertainment'>Entertainment</option>
            <option value='style'>Style</option>
            <option value='travel'>Travel</option>
            <option value='sports'>Sports</option>
            <option value='science'>Science</option>
            <option value='climate'>Climate</option>
          </Select>
        </div>
        
    
        <div className="flex flex-col gap-4">
          <input
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            ref={filePickerRef}
            hidden
          />
          
          <div
            className='relative w-full h-72 self-center cursor-pointer shadow-xl overflow-hidden rounded-lg transition duration-300 hover:opacity-90 border-2 border-dashed border-gray-300 flex items-center justify-center'
            onClick={() => filePickerRef.current.click()}
          >
      
            {imageUploadProgress !== null && imageUploadProgress < 100 && (
              <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10'>
                <div className='w-32 h-32'>
                  <CircularProgressbar
                    value={imageUploadProgress}
                    text={`${imageUploadProgress}%`}
                    strokeWidth={5}
                  />
                </div>
              </div>
            )}

     
            {(imageFileUrl || formData.image) ? (
              <img
                src={imageFileUrl || formData.image}
                alt='Preview'
                className={`w-full h-full object-cover ${
                  imageUploadProgress !== null && imageUploadProgress < 100 ? 'opacity-50' : ''
                }`}
              />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📁</div>
                <p>Click to select an image</p>
              </div>
            )}

         
            {imageUploadProgress === 100 && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                ✓ Uploaded
              </div>
            )}
          </div>

     
          <CustomButton
            type='button'
            gradientDuoTone='purpleToBlue'
            outline
            onClick={() => filePickerRef.current.click()}
            disabled={imageUploading}
          >
            {imageUploading ? 'Uploading...' : 'Select Image'}
          </CustomButton>
        </div>
        
        {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
        
        <ReactQuill
          theme='snow'
          placeholder='Write something...'
          className='h-72 mb-12'
          required
          value={formData.content}
          onChange={(value) => {
            setFormData({ ...formData, content: value });
            handleFormChange();
          }}
        />
        
        <CustomButton 
          type='submit' 
          gradientDuoTone='purpleToPink'
          disabled={imageUploading || !formData.image || !formData.title || !formData.content || isSubmitting}
          className="w-full py-3 text-lg"
        >
          {isSubmitting ? 'Updating...' : 'Update post'}
        </CustomButton>
        
        {publishError && (
          <Alert className='mt-5' color='failure'>
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}