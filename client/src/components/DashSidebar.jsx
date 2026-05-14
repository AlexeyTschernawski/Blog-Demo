import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
} from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signoutSuccess } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) setTab(tabFromUrl);
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', { method: 'POST' });
      const data = await res.json();
      if (res.ok) dispatch(signoutSuccess());
      else console.log(data.message);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="w-full md:w-56 bg-gray-50 p-4">
      <div className="flex flex-col gap-2">
        {currentUser?.isAdmin && (
          <Link 
            to="/dashboard?tab=dash" 
            className={`flex items-center gap-3 p-2 rounded ${
              tab === 'dash' || !tab ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <HiChartPie className="w-5 h-5" />
            Dashboard
          </Link>
        )}
        
        <Link 
          to="/dashboard?tab=profile" 
          className={`flex items-center gap-3 p-2 rounded ${
            tab === 'profile' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <HiUser className="w-5 h-5" />
          <span className="flex-1">Profile</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            currentUser?.isAdmin ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
          }`}>
            {currentUser?.isAdmin ? 'Admin' : 'User'}
          </span>
        </Link>

        {currentUser?.isAdmin && (
          <>
            <Link 
              to="/dashboard?tab=posts" 
              className={`flex items-center gap-3 p-2 rounded ${
                tab === 'posts' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
              }`}
            >
              <HiDocumentText className="w-5 h-5" />
              Posts
            </Link>
            <Link 
              to="/dashboard?tab=users" 
              className={`flex items-center gap-3 p-2 rounded ${
                tab === 'users' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
              }`}
            >
              <HiOutlineUserGroup className="w-5 h-5" />
              Users
            </Link>
            <Link 
              to="/dashboard?tab=comments" 
              className={`flex items-center gap-3 p-2 rounded ${
                tab === 'comments' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
              }`}
            >
              <HiAnnotation className="w-5 h-5" />
              Comments
            </Link>
          </>
        )}

        <button 
          onClick={handleSignout}
          className="flex items-center gap-3 p-2 rounded bg-white text-left hover:bg-gray-100"
        >
          <HiArrowSmRight className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}