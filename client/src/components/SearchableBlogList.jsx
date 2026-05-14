import React, { useEffect, useState } from 'react';
import { useSearch } from '../contexts/SearchContext';
import BlogCard from './BlogCard';

const SearchableBlogList = ({ posts: initialPosts, loading: initialLoading }) => {
    const { searchTerm } = useSearch();
    const [posts, setPosts] = useState(initialPosts || []);
    const [loading, setLoading] = useState(initialLoading || true);
    const [filteredPosts, setFilteredPosts] = useState([]);


    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };


    useEffect(() => {
        if (initialPosts) {
            setPosts(initialPosts);
            setLoading(false);
        }
    }, [initialPosts]);


    useEffect(() => {
        if (!initialPosts) {
            const fetchPosts = async () => {
                try {
                    const res = await fetch('/api/post/getposts');
                    const data = await res.json();
                    if (res.ok) {
                        setPosts(data.posts || []);
                    } else {
                        setPosts([]);
                    }
                } catch (error) {
                    console.error('Error fetching posts:', error);
                    setPosts([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchPosts();
        }
    }, [initialPosts]);


    useEffect(() => {
        if (!searchTerm || searchTerm.trim() === '') {
            setFilteredPosts(posts);
            return;
        }

        const searchLower = searchTerm.toLowerCase().trim();
        const filtered = posts.filter(post => {
            if (!post) return false;
            
            const titleMatch = post.title && post.title.toLowerCase().includes(searchLower);
            const contentMatch = post.content && stripHtml(post.content).toLowerCase().includes(searchLower);
            const subTitleMatch = post.subTitle && post.subTitle.toLowerCase().includes(searchLower);
            const categoryMatch = post.category && post.category.toLowerCase().includes(searchLower);

            return titleMatch || contentMatch || subTitleMatch || categoryMatch;
        });

        setFilteredPosts(filtered);
    }, [posts, searchTerm]);

    if (loading) {
        return (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">No posts available yet.</p>
            </div>
        );
    }

    return (
        <div>
            {searchTerm && filteredPosts.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">No posts found for "{searchTerm}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(searchTerm ? filteredPosts : posts).map(blog => (
                        <BlogCard key={blog._id} blog={blog} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchableBlogList;