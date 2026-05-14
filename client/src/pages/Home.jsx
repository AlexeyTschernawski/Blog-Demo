import React from 'react'
import Navbar from '../components/Navbar'
import BlogList from '../components/BlogList'
import Newsletter from '../components/Newsletter'
import SEO from '../components/SEO'

const Home = () => {
  return (
    <div>
      <>
   
      <SEO 
        title="IC INFORM | News, Tech & Insights"
        description="Read interesting news and articles. Explore engaging stories and deep-dive insights on technology, lifestyle, and more. Stay informed!"
      />

      <BlogList />
     
      </>
    </div>
  )
}

export default Home
