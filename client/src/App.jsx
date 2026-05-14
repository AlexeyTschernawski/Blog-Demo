import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Login from './pages/Login'
import MyNavbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute copy'
import CreatePost from './pages/CreatePost'
import UpdatePost from './pages/UpdatePost'
import ScrollToTop from './components/ScrollToTop'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import { SearchProvider } from './contexts/SearchContext' 

const App = () => {
  return (
   
    <SearchProvider>
      <div>
        <ScrollToTop />
    
        <MyNavbar />
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/post/:slug' element={<Blog/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route element={<PrivateRoute />}>
            <Route path='/dashboard' element={<Dashboard />} />
          </Route>
          <Route element={<OnlyAdminPrivateRoute />}>
            <Route path='/create-post' element={<CreatePost />} />
            <Route path='/update-post/:postId' element={<UpdatePost />} />
          </Route>

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
        </Routes>

        <Footer />
        <Analytics />
      </div>
    </SearchProvider>
  )
}

export default App
