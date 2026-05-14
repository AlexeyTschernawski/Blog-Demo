import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Navbar from '../components/Navbar'
import Moment from 'moment'
import { FaFacebook, FaTwitter, FaGooglePlusG } from "react-icons/fa"
import Loader from '../components/Loader'
import axios from 'axios'
import CommentsSection from '../components/CommentsSection' 
import SEO from '../components/SEO'
import { stripHtml } from '../utils/stripHtml';

const Blog = () => {

  const { slug } = useParams()

  const [data, setData] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchBlogData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/post/getposts?slug=${slug}`)
      if (response.data.posts && response.data.posts.length > 0) {
        const post = response.data.posts[0]
        setData({
          ...post,
          description: post.content
        })
        
        await fetchAuthor(post.userId)
      }
    } catch (error) {
      console.error('Error fetching blog post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthor = async (userId) => {
    try {
      const response = await axios.get(`/api/user/${userId}`)
      setAuthor(response.data)
    } catch (error) {
      console.error('Error fetching author:', error)
    }
  }

  useEffect(() => {
    fetchBlogData()
  }, [slug])

  if (loading) {
    return <Loader />
  }

  if (!data) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-gray-500'>Post not found</p>
      </div>
    )
  }


  const cleanDescription = data.content 
    ? stripHtml(data.content).slice(0, 160) + '...' 
    : 'Read article on ICInform';

  return (
    <div className='relative'>

 
      <SEO 
        title={data.title}
        description={cleanDescription}
        image={data.image} 
        url={`/post/${data.slug}`} 
        type="article"
      />

      <img src={assets.gradientBackground} alt="" className='absolute -top-50 -z-1 opacity-50' />

      <div className='text-center mt-20 text-gray-600'>
     
        <h1 className='text-2xl sm:text-5xl font-semibold max-w-2xl mx-auto text-gray-800'>{data.title}</h1>
        <h2 className='my-5 max-w-lg truncate mx-auto'>{data.subTitle}</h2>
      </div>

      <div className='mx-5 max-w-5xl md:mx-auto my-10 mt-6'>
        <img src={data.image} alt="" className='rounded-3xl mb-5 w-auto max-w-full max-h-[70vh] mx-auto block' />
        <div className='rich-text max-w-3xl mx-auto' dangerouslySetInnerHTML={{ __html: data.description }}></div>

   
        <div className='max-w-3xl mx-auto mt-8 text-center'>
          <p className='text-gray-700 italic'>
            Published by {author ? author.username : 'Loading...'}
          </p>
          <p className='text-gray-700 italic'>on {Moment.utc(data.createdAt).local().format("DD MMMM YYYY")}</p>
        </div>

 
        <CommentsSection postId={data?._id} />

  
        <div className='my-24 max-w-3xl mx-auto'>
          <p className='font-semibold my-4'>Share this article on social media</p>
          <div className="flex gap-4">
            <FaFacebook className="text-white bg-blue-600 rounded-full p-2 text-4xl" />
            <FaTwitter className="text-white bg-sky-400 rounded-full p-2 text-4xl" />
            <FaGooglePlusG className="text-white bg-red-500 rounded-full p-2 text-4xl" />
          </div>
        </div>

      </div>
    </div>
  )
}

export default Blog
