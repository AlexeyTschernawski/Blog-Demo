import express from 'express';
import { 
  createComment, 
  getPostComments, 
  likeComment, 
  deleteComment,
  addReply,
  likeReply,
  deleteReply,
  updateComment,
  updateReply,
  getComments
} from '../controllers/comment.controller.js';
import { verifyToken } from '../middlewares/verifyUser.js';

const router = express.Router();


router.post('/create', verifyToken, createComment);
router.get('/getPostComments/:postId', getPostComments);
router.put('/likeComment/:commentId', verifyToken, likeComment);
router.delete('/deleteComment/:commentId', verifyToken, deleteComment);


router.post('/:commentId/reply', verifyToken, addReply);
router.put('/:commentId/likeReply/:replyId', verifyToken, likeReply);
router.delete('/:commentId/deleteReply/:replyId', verifyToken, deleteReply);

router.put('/updateComment/:commentId', verifyToken, updateComment);
router.put('/:commentId/updateReply/:replyId', verifyToken, updateReply);

router.get('/getcomments', verifyToken, getComments);

export default router;