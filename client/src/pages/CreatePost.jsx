import { Alert, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useState, useRef, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


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
    switch(color) {
        case 'failure': return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
        case 'gray':
        default: return 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400';
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

export default function CreatePost() {
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'uncategorized',
    content: '',
    image: '',
  });
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(null); 
  
  const filePickerRef = useRef();

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
    }
  };

  useEffect(() => {
    if (imageFile) uploadImage();
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

      const interval = setInterval(() => {
        setImageUploadProgress(prev => prev < 90 ? prev + 10 : 90);
      }, 300);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      clearInterval(interval);
      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setFormData(prev => ({ ...prev, image: result.url, imageFileId: result.fileId }));
      setImageUploadProgress(100);
      setTimeout(() => setImageUploadProgress(null), 1000);
    } catch (error) {
      setImageUploadError(error.message);
      setImageUploadProgress(null);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message || 'Failed to create post');
        return;
      }

    
      setPublishSuccess('Post created successfully!');
      setFormData({ title: '', category: 'uncategorized', content: '', image: '' });
      setImageFile(null);
      setImageFileUrl(null);

     
      setTimeout(() => setPublishSuccess(null), 5000);

    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Create a post</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select
            value={formData.category} 
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
          <input type='file' accept='image/*' onChange={handleImageChange} ref={filePickerRef} hidden />
          <div
            className='relative w-full h-72 self-center cursor-pointer shadow-xl overflow-hidden rounded-lg transition duration-300 hover:opacity-90 border-2 border-dashed border-gray-300 flex items-center justify-center'
            onClick={() => filePickerRef.current.click()}
          >
            {imageUploadProgress !== null && imageUploadProgress < 100 && (
              <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10'>
                <div className='w-32 h-32'>
                  <CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress}%`} strokeWidth={5} />
                </div>
              </div>
            )}
            {(imageFileUrl || formData.image) ? (
              <img src={formData.image || imageFileUrl} alt='Preview' className='w-full h-full object-cover' />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📁</div>
                <p>Click to select an image</p>
              </div>
            )}
            {imageUploadProgress === 100 && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">✓ Uploaded</div>
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
          value={formData.content} 
          placeholder='Write something...'
          className='h-72 mb-12'
          required
          onChange={(value) => setFormData({ ...formData, content: value })}
        />
        
        <CustomButton 
          type='submit' 
          gradientDuoTone='purpleToPink'
          disabled={imageUploading || !formData.image || !formData.title || !formData.content}
          className="w-full py-3 text-lg"
        >
          Publish
        </CustomButton>
        
      
        {publishSuccess && (
          <Alert color='success' className='mt-5'>
            {publishSuccess}
          </Alert>
        )}

        {publishError && (
          <Alert className='mt-5' color='failure'>
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}