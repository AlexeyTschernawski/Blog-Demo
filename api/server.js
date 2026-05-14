// server.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import axios from 'axios';

import Post from './models/post.model.js'

import userRoutes from './routes/user.route.js'
import authRoutes from './routes/auth.route.js'
import postRoutes from './routes/post.route.js'
import commentRouter from './routes/comment.route.js'
import contactRoutes from './routes/contact.route.js'

// App Config
const app = express()
const port = process.env.PORT || 3000

// connect DB
connectDB()

// Middlewares
app.use(express.json())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

// Cookie middleware
app.use((req, res, next) => {
  if (req.headers.cookie) {
    req.cookies = Object.fromEntries(
      req.headers.cookie.split(';').map(c => c.trim().split('='))
    )
  } else {
    req.cookies = {}
  }
  next()
})


// FOR SOCIAL MEDIA PREVIEW

app.get('/post/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findOne({ slug });

        if (!post) return res.status(404).send("Post not found");

        const response = await axios.get('https://icinform.com/index.html');
        let html = response.data;

        const metaTags = `
    <title>${post.title} | IC INFORM</title>
    <meta name="description" content="Read interesting news and articles on IC INFORM" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://icinform.com/post/${post.slug}" />
    <meta property="og:title" content="${post.title}" />
    <meta property="og:description" content="Read interesting news and articles on IC INFORM" />
    <meta property="og:image" content="${post.image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${post.title}" />
    <meta name="twitter:description" content="Read interesting news and articles on IC INFORM" />
    <meta name="twitter:image" content="${post.image}" />`;

        
        if (html.includes('<title>')) {
            html = html.replace('<title>', `${metaTags}<title style="display:none;">`);
        } else {
        
            html = html.replace('<head>', `<head>${metaTags}`);
        }

        res.set('Content-Type', 'text/html');
        res.send(html);

    } catch (e) {
        console.error("Error in preview route:", e.message);
        res.status(500).send("Server Error: Preview failed");
    }
});



// Routes
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/post', postRoutes)
app.use('/api/comment', commentRouter)
app.use('/api/contact', contactRoutes)

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    clientUrl: process.env.CLIENT_URL,
    nodeEnv: process.env.NODE_ENV
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

app.get('/', (req, res) => {
  res.send('API is running!')
})

// Export for Vercel
export default app

// Local development
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`http://localhost:${port}`)
  })
}