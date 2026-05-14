import Comment from '../models/comment.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';


export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body;
    
    if (!content || !postId || !userId) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const newComment = new Comment({
      content,
      postId,
      userId,
      parentId: req.body.parentId || null,
    });

    await newComment.save();
    
 
    const populatedComment = await Comment.findById(newComment._id)
      .populate('userId', 'username profilePicture')
      .populate('replies.userId', 'username profilePicture');

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};


export const addReply = async (req, res, next) => {
  try {
    const { content, userId, replyTo } = req.body;
    const { commentId } = req.params;

    if (!content || !userId || !replyTo) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    const newReply = {
      content,
      userId,
      replyTo,
      createdAt: new Date(),
    };

    comment.replies.push(newReply);
    await comment.save();


    const updatedComment = await Comment.findById(commentId)
      .populate('userId', 'username profilePicture')
      .populate('replies.userId', 'username profilePicture');

    res.status(201).json(updatedComment);
  } catch (error) {
    next(error);
  }
};


export const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePicture')  
      .populate('replies.userId', 'username profilePicture'); 

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};




export const likeComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    const userIndex = comment.likes.indexOf(userId);
    const hasLiked = userIndex !== -1;

    let updateOperation;
    if (hasLiked) {
   
      updateOperation = {
        $pull: { likes: userId },
        $inc: { numberOfLikes: -1 }
      };
    } else {
     
      updateOperation = {
        $push: { likes: userId },
        $inc: { numberOfLikes: 1 }
      };
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      updateOperation,
      { 
        new: true,
        timestamps: false 
      }
    )
    .populate('userId', 'username profilePicture')
    .populate('replies.userId', 'username profilePicture');

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};


export const likeReply = async (req, res, next) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user.id;


    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }


    const reply = comment.replies.id(replyId);
    if (!reply) {
      return next(errorHandler(404, 'Reply not found'));
    }


    const userIndex = reply.likes.indexOf(userId);
    const hasLiked = userIndex !== -1;

    
    if (hasLiked) {
  
      reply.likes.splice(userIndex, 1);
      reply.numberOfLikes = Math.max(0, reply.numberOfLikes - 1);
    } else {
  
      reply.likes.push(userId);
      reply.numberOfLikes += 1;
    }

    await Comment.findOneAndUpdate(
      { _id: commentId },
      { 
        $set: { 
          replies: comment.replies 
        } 
      },
      { 
        timestamps: false 
      }
    );


    const updatedComment = await Comment.findById(commentId)
      .populate('userId', 'username profilePicture')
      .populate('replies.userId', 'username profilePicture');

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};


export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }


    const isOwner = comment.userId.toString() === req.user.id;
    if (!isOwner && !req.user.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to delete this comment'));
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json('Comment has been deleted');
  } catch (error) {
    next(error);
  }
};


export const deleteReply = async (req, res, next) => {
  try {
    const { commentId, replyId } = req.params;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return next(errorHandler(404, 'Reply not found'));
    }

    const isOwner = reply.userId.toString() === req.user.id;
    if (!isOwner && !req.user.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to delete this reply'));
    }

    comment.replies.pull(replyId);
    await comment.save();

    res.status(200).json('Reply has been deleted');
  } catch (error) {
    next(error);
  }
};


export const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to edit this comment'));
    }

 
    const oldContent = comment.content;

    const updateData = {
      content: req.body.content,
    };

  
    if (oldContent !== req.body.content) {
      updateData.wasEdited = true;
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { $set: updateData },
      { new: true }
    )
    .populate('userId', 'username profilePicture')
    .populate('replies.userId', 'username profilePicture');

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};


export const updateReply = async (req, res, next) => {
  try {
    const { commentId, replyId } = req.params;
    

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }


    const replyIndex = comment.replies.findIndex(reply => 
      reply._id.toString() === replyId
    );

    if (replyIndex === -1) {
      return next(errorHandler(404, 'Reply not found'));
    }

    const reply = comment.replies[replyIndex];
    

    if (reply.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to edit this reply'));
    }

   
    const oldContent = reply.content;

   
    comment.replies[replyIndex].content = req.body.content;
    comment.replies[replyIndex].updatedAt = new Date();
    

    if (oldContent !== req.body.content) {
      comment.replies[replyIndex].wasEdited = true;
    }

    
    await Comment.findByIdAndUpdate(
      commentId,
      { 
        $set: { 
          [`replies.${replyIndex}`]: comment.replies[replyIndex] 
        } 
      },
      { 
        timestamps: false 
      }
    );

   
    const updatedComment = await Comment.findById(commentId)
      .populate('userId', 'username profilePicture')
      .populate('replies.userId', 'username profilePicture');

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};


export const getComments = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to get all comments'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'desc' ? 1 : -1;

    const comments = await Comment.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .populate('userId', 'username profilePicture')
      .populate('replies.userId', 'username profilePicture');

    const totalComments = await Comment.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthComments = await Comment.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      comments,
      totalComments,
      lastMonthComments,
    });
  } catch (error) {
    next(error);
  }
};