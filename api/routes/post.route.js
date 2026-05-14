import express from 'express';
import multer from 'multer';
import { create, getposts, deletepost, updatepost, getAdminPosts, getSitemap } from '../controllers/post.controller.js';
import { verifyToken } from '../middlewares/verifyUser.js'; 
import { uploadCompressedPostImage, uploadPostImage } from '../config/imageKit.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50mb
    fieldSize: 50 * 1024 * 1024
  }
});

router.post('/upload', upload.single('image'), uploadPostImage);
router.post('/upload-compressed', upload.single('image'), uploadCompressedPostImage);


router.post('/create', verifyToken, create);
router.get('/getposts', getposts);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);

router.get('/getadminposts', verifyToken, getAdminPosts);
router.get('/sitemap', getSitemap);

export default router;