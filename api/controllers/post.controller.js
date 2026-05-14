import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';
import { deleteImage } from "../config/imageKit.js";

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
  return next(errorHandler(403, 'You are not allowed to create a post'));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
    
  
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  
  
  
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};


export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {

    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }


    if (post.imageFileId) {
      try {
        await deleteImage(post.imageFileId);
        console.log(`Deleted image from ImageKit for post: ${post._id}`);
      } catch (imageError) {
        console.error('Error deleting image from ImageKit:', imageError);
      }
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};


export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }
  try {
  
    const currentPost = await Post.findById(req.params.postId);
    
    if (!currentPost) {
      return next(errorHandler(404, 'Post not found'));
    }


    if (req.body.image && req.body.image !== currentPost.image && currentPost.imageFileId) {
      try {
        await deleteImage(currentPost.imageFileId);
        console.log(`Deleted old image from ImageKit for post: ${currentPost._id}`);
      } catch (imageError) {
        console.error('Error deleting old image from ImageKit:', imageError);

      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
          imageFileId: req.body.imageFileId, 
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};



export const getAdminPosts = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to get all posts'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    
    const posts = await Post.find()
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};


export const getSitemap = async (req, res) => {
  try {
    const posts = await Post.find({}, 'slug updatedAt');

    const baseUrl = 'https://icinform.com';

    const staticPages = [
      { url: '/', lastmod: new Date().toISOString() },
     
    ];

    
    const xmlItems = [
      ...staticPages.map(page => `
        <url>
          <loc>${baseUrl}${page.url}</loc>
          <lastmod>${page.lastmod}</lastmod>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>`),
      ...posts.map(post => `
        <url>
          <loc>${baseUrl}/post/${post.slug}</loc>
          <lastmod>${post.updatedAt.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`)
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${xmlItems.join('')}
    </urlset>`;


    res.header('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (error) {
    res.status(500).json({ message: "Error generate sitemap" });
  }
};