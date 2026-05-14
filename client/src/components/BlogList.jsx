import React, { useEffect, useState } from 'react';
import BlogCard from './BlogCard';
import { useLocation } from 'react-router-dom';
import { useSearchContext } from '../contexts/SearchContext';
import axios from 'axios';
import Loader from './Loader';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMore, setShowMore] = useState(true);
    const location = useLocation();
    const { searchTerm } = useSearchContext();

    const POSTS_PER_PAGE = 9;

    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');

    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const fetchPosts = async (isInitial = true) => {
        try {
            if (isInitial) {
                setLoading(true);
            }
            setError(null);
            
            let url = '/api/post/getposts?';
            const params = new URLSearchParams();
            
            if (categoryParam) {
                params.append('category', categoryParam);
            }
            
            if (!isInitial && posts.length > 0) {
                params.append('startIndex', posts.length);
            }
            
            url += params.toString();
            
            const response = await axios.get(url);
            
            if (response.data && response.data.posts) {
                if (isInitial) {
                    setPosts(response.data.posts);
                } else {
                    setPosts(prev => [...prev, ...response.data.posts]);
                }
                
                if (response.data.posts.length < POSTS_PER_PAGE) {
                    setShowMore(false);
                } else {
                    setShowMore(true);
                }
            } else {
                if (isInitial) {
                    setPosts([]);
                }
                setShowMore(false);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to load posts. Please try again later.');
            if (isInitial) {
                setPosts([]);
            }
        } finally {
            if (isInitial) {
                setLoading(false);
            }
        }
    };

    const handleLoadMore = async () => {
        await fetchPosts(false);
    };

    useEffect(() => {
        fetchPosts(true);
    }, [location.search]);

    const filteredPosts = React.useMemo(() => {
        if (!searchTerm.trim()) {
            return posts;
        }

        const searchLower = searchTerm.toLowerCase();
        
        return posts.filter(post => {
            const titleMatch = post.title?.toLowerCase().includes(searchLower) || false;
            const contentText = stripHtml(post.content || '');
            const contentMatch = contentText.toLowerCase().includes(searchLower);
            const subTitleMatch = post.subTitle?.toLowerCase().includes(searchLower) || false;
            return titleMatch || contentMatch || subTitleMatch;
        });
    }, [posts, searchTerm]);

    if (loading && posts.length === 0) {
        return <Loader />;
    }

    if (error && posts.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-500">
                    <p>{error}</p>
                    <button 
                        onClick={() => fetchPosts(true)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-20 py-12">
            {categoryParam && (
                <h1 className="text-3xl font-bold text-gray-800 mb-8 capitalize">
                    {categoryParam}
                </h1>
            )}

            {searchTerm && (
                <div className="mb-6 text-gray-600">
                    Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} for "{searchTerm}"
                </div>
            )}

            {filteredPosts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => (
                            <BlogCard key={post._id} blog={post} />
                        ))}
                    </div>
                    
                    {!searchTerm && (
                        <div className="mt-8 text-center">
                            <div className="mb-4 text-gray-600">
                                Showing {posts.length} post{posts.length !== 1 ? 's' : ''}
                                {posts.length < 9 && ' (all posts)'}
                            </div>
                            
                            {showMore && (
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    Load More Posts
                                </button>
                            )}
                            
                            {!showMore && posts.length > 9 && (
                                <p className="text-green-600 font-medium">
                                    ✓ All posts loaded
                                </p>
                            )}
                        </div>
                    )}
                    
                    {searchTerm && (
                        <div className="mt-8 text-center text-gray-500">
                            Showing {filteredPosts.length} of {posts.length} loaded post{posts.length !== 1 ? 's' : ''}
                            {showMore && (
                                <p className="mt-2 text-sm">
                                    <button
                                        onClick={handleLoadMore}
                                        className="text-indigo-600 hover:text-indigo-800 underline"
                                    >
                                        Load more posts
                                    </button> to search through more content
                                </p>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                        <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                            {searchTerm ? 'No posts found' : 'No posts available'}
                        </h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {searchTerm 
                                ? `No posts match "${searchTerm}". Try different keywords.`
                                : categoryParam 
                                    ? `No posts available in the ${categoryParam} category yet.`
                                    : 'No blog posts have been published yet.'}
                        </p>
                        {searchTerm && posts.length > 0 && (
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                </div>
            )}
            
            {loading && posts.length > 0 && (
                <div className="mt-8 text-center">
                    <Loader />
                </div>
            )}
        </div>
    );
};

export default BlogList;