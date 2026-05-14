import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const CategoryMenu = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [categories, setCategories] = useState(["All"])

    const queryParams = new URLSearchParams(location.search)
    const selectedCategory = queryParams.get('category') || 'All'
    const isHomeActive = location.pathname === '/' && !location.search

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/post/getposts')
                const unique = [...new Set(res.data.posts.map(p => p.category))]
                setCategories(["All", ...unique])
            } catch (err) {
                console.error(err)
            }
        }
        fetchCategories()
    }, [])

    const handleClick = (type) => {
        if (type === 'home') {
            navigate('/')
        } else if (type === 'All') {
            navigate('/')
        } else {
            navigate(`/?category=${type}`)
        }
    }

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-4 py-1 overflow-x-auto scrollbar-hide">
                    
                  
                    <button
                        onClick={() => handleClick('home')}
                        className={`
                            relative px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                            ${isHomeActive 
                                ? 'text-white' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }
                        `}
                    >
                        Home
                        {isHomeActive && (
                            <motion.div
                                layoutId="categoryBubble"
                                className="absolute inset-0 bg-indigo-600 rounded-full -z-10"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>

                  
                    {categories.map((cat) => {
                        const isActive = location.pathname === '/' && selectedCategory === cat

                        return (
                            <button
                                key={cat}
                                onClick={() => handleClick(cat)}
                                className={`
                                    relative px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    }
                                `}
                            >
                                {cat}
                                {isActive && (
                                    <motion.div
                                        layoutId="categoryBubble"
                                        className="absolute inset-0 bg-indigo-600 rounded-full -z-10"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default CategoryMenu