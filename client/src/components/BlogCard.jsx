import React from 'react'
import { useNavigate } from 'react-router-dom'

const BlogCard = ({ blog }) => {
  const { title, content, category, image, slug, createdAt } = blog
  const navigate = useNavigate()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <div
      onClick={() => navigate(`/post/${slug}`)}
      className="w-full rounded-lg overflow-hidden shadow hover:scale-102 hover:shadow-primary/25 duration-300 cursor-pointer"
    >
      {/* IMAGE */}
      <div className="relative w-full aspect-[4/3] md:aspect-[3/2] overflow-hidden bg-black">
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-[4px] scale-105"
          aria-hidden
        />
        <img
          src={image}
          alt={title}
          className="relative z-10 w-full h-full object-contain"
        />
      </div>

      <span className="ml-5 mt-4 px-3 py-1 inline-block bg-primary/20 rounded-full text-primary text-xs">
        {category}
      </span>

      <div className="p-4">
        <h5 className="mb-2 font-medium text-gray-900">{title}</h5>
        <p className="mb-3 text-xs text-gray-600">
          {stripHtml(content).slice(0, 80)}
          {stripHtml(content).length > 80 ? '...' : ''}
        </p>
        <div className="text-xs text-gray-500">
          {formatDate(createdAt)}
        </div>
      </div>
    </div>
  )
}

export default BlogCard
