import React, { useState, useRef, useEffect } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Navbar,
    NavbarBrand,
    NavbarToggle,
} from 'flowbite-react';
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';
import { useSelector, useDispatch } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';
import CategoryMenu from './CategoryMenu';
import { useSearchContext } from '../contexts/SearchContext';

const DEFAULT_AVATAR_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M16 16C19.3137 16 22 13.3137 22 10C22 6.68629 19.3137 4 16 4C12.6863 4 10 6.68629 10 10C10 13.3137 12.6863 16 16 16Z' fill='%239CA3AF'/%3E%3Cpath d='M16 18C11.0492 18 7 21.134 7 25.5C7 26.3284 7.67157 27 8.5 27H23.5C24.3284 27 25 26.3284 25 25.5C25 21.134 20.9508 18 16 18Z' fill='%239CA3AF'/%3E%3C/svg%3E";

const MyNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { searchTerm, setSearchTerm } = useSearchContext();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [hasImageError, setHasImageError] = useState(false);

    const UserIcon = (props) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );

    const LogoutIcon = (props) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );

    const handleSignOut = async () => {
        try {
            const res = await fetch('/api/user/signout', { method: 'POST' });
            if (res.ok) {
                dispatch(signoutSuccess());
                navigate('/');
            }
        } catch (error) {}
    };

    const handleAvatarError = () => setHasImageError(true);

    useEffect(() => setHasImageError(false), [currentUser?.profilePicture]);


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileSearchOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); 

        return () => window.removeEventListener('resize', handleResize);
    }, []);

  
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };


    const handleSearchSubmit = (e) => {
        e.preventDefault();
   
        if (location.pathname !== '/') {
            navigate('/');
        }
    };


    const handleLogoClick = () => {
        setSearchTerm('');
        navigate('/');
    };


    const closeMobileSearch = () => {
        setIsMobileSearchOpen(false);
    };

    const getCurrentAvatarSrc = () => {
        if (hasImageError || !currentUser?.profilePicture) return DEFAULT_AVATAR_URL;
        let photoUrl = currentUser.profilePicture;
        if (photoUrl.startsWith('http://')) photoUrl = photoUrl.replace('http://', 'https://');
        return photoUrl;
    };

    const avatarSrc = getCurrentAvatarSrc();

    return (
        <>
            <Navbar
                fluid
                rounded
                className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 px-4 sm:px-8 lg:px-20 relative z-40"
            >
                <NavbarBrand onClick={handleLogoClick} className="cursor-pointer">
                    <img src={assets.logo} alt="logo" className="w-32 sm:w-44" />
                </NavbarBrand>

             
                <div className="hidden md:flex flex-1 justify-center px-4">
                    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md lg:max-w-lg">
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full border rounded-md px-5 py-2 pr-10 border-gray-300 text-gray-900 bg-white 
                                       dark:border-gray-600 dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 
                                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <AiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 w-5 h-5" />
                    </form>
                </div>

       
                <div className="flex items-center gap-4">
                    <NavbarToggle />

               
                    <button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        aria-label="Open search"
                    >
                        <AiOutlineSearch className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    </button>

             
                    {!currentUser ? (
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-black text-white rounded-full px-4 py-2 text-sm hover:bg-gray-800 transition"
                        >
                            Login
                        </button>
                    ) : (
                        <div className="relative flex flex-col items-center z-50" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex flex-col items-center focus:outline-none"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-300 hover:ring-indigo-400 transition-all">
                                    <img
                                        src={avatarSrc}
                                        alt="User avatar"
                                        className="w-full h-full object-cover"
                                        onError={handleAvatarError}
                                    />
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 max-w-20 truncate">
                                    {currentUser.username}
                                </p>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                                    <div className="py-1">
                                        <div className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                            <div className="font-medium truncate">{currentUser.username}</div>
                                            <div className="text-gray-500 truncate text-xs">{currentUser.email}</div>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                navigate('/dashboard?tab=profile');
                                            }}
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                        >
                                            <UserIcon className="mr-3 h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                            <span>Profile</span>
                                        </button>

                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition"
                                        >
                                            <LogoutIcon className="mr-3 h-5 w-5 text-red-500 dark:text-red-400" />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Navbar>

          
            {isMobileSearchOpen && (
                <div className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 px-4 pt-4 pb-5 shadow-lg">
                    <div className="flex items-center gap-3 max-w-5xl mx-auto">
                        <button onClick={closeMobileSearch} className="p-2">
                            <AiOutlineClose className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                        <form onSubmit={handleSearchSubmit} className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search posts..."
                                autoFocus
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full px-5 py-2.5 pr-12 rounded-md border border-gray-300 dark:border-gray-600 
                                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <AiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                        </form>
                    </div>
                </div>
            )}

            <CategoryMenu />
        </>
    );
};

export default MyNavbar;