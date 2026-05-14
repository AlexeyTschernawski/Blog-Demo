import React, { useState, useEffect } from 'react'
import Moment from 'moment'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'

const UserAvatar = React.memo(({ user, size = 'w-6 h-6' }) => {
  const [imgSrc, setImgSrc] = useState(user?.profilePicture || '/assets/user_icon.jpg')
  
  const handleError = () => {
    setImgSrc('/assets/user_icon.jpg')
  }

  return (
    <img 
      src={imgSrc} 
      alt="User avatar" 
      className={`${size} rounded-full object-cover`}
      onError={handleError}
    />
  )
})

const TimeWithEdit = React.memo(({ createdAt, updatedAt, prefix = "", wasEdited = false }) => {
  const showEdited = wasEdited && updatedAt && 
                   new Date(updatedAt).getTime() > new Date(createdAt).getTime() + 5000;

  return (
    <span className="text-xs text-gray-500">
      {prefix && `${prefix} • `}
      {Moment(createdAt).fromNow()}
      {showEdited && ` • edited ${Moment(updatedAt).fromNow()}`}
    </span>
  )
})

const CommentActions = React.memo(({ onEdit, onDelete, isOwner, size = 'text-xs' }) => {
  if (!isOwner) return null;

  return (
    <div className={`flex gap-2 ${size}`}>
      <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 transition-colors">
        Edit
      </button>
      <button onClick={onDelete} className="text-red-600 hover:text-red-800 transition-colors">
        Delete
      </button>
    </div>
  )
})

const EditForm = React.memo(({ initialContent, onSave, onCancel, maxChars = 500, placeholder = "Edit your comment..." }) => {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  
  const charsLeft = maxChars - content.length

  const getCounterColor = () => {
    if (charsLeft < 50) return 'text-red-500'
    if (charsLeft < 100) return 'text-orange-500'
    return 'text-gray-500'
  }

  const handleContentChange = (e) => {
    const value = e.target.value
    if (value.length <= maxChars) setContent(value)
  }

  const handleSave = async () => {
    if (!content.trim() || content.length > maxChars) return
    setSaving(true)
    await onSave(content)
    setSaving(false)
  }

  const handleCancel = () => {
    setContent(initialContent)
    onCancel()
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
        rows="3"
        maxLength={maxChars}
      />
      <div className="flex justify-between items-center">
        <div className={`text-xs ${getCounterColor()} transition-colors`}>
          {charsLeft} characters remaining
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !content.trim() || content.length > maxChars}
            className="bg-primary text-white text-sm px-3 py-1 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleCancel} className="bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
})

const checkOwnership = (currentUser, resourceUserId) => {
  if (!currentUser) return false;
  if (resourceUserId && typeof resourceUserId === 'object') {
    return currentUser._id === resourceUserId._id || currentUser.isAdmin;
  }
  return currentUser._id === resourceUserId || currentUser.isAdmin;
};

const CommentHeader = React.memo(({ user, createdAt, updatedAt, wasEdited }) => (
  <div className="flex items-center gap-2 mb-2">
    <UserAvatar user={user} />
    <div>
      <p className="font-medium text-sm">{user?.username || 'Unknown User'}</p>
      <TimeWithEdit createdAt={createdAt} updatedAt={updatedAt} wasEdited={wasEdited} />
    </div>
  </div>
))

const ReplyHeader = React.memo(({ user, replyTo, createdAt, updatedAt, wasEdited }) => (
  <div className="flex items-center gap-2 mb-1">
    <UserAvatar user={user} size="w-5 h-5" />
    <div>
      <p className="font-medium text-xs">{user?.username || 'Unknown User'}</p>
      <TimeWithEdit createdAt={createdAt} updatedAt={updatedAt} prefix={`Reply to @${replyTo}`} wasEdited={wasEdited} />
    </div>
  </div>
))

const ReplyItem = React.memo(({ reply, commentId, onLikeReply, onUpdateReply, onDeleteReply }) => {
  const { currentUser } = useSelector((state) => state.user)
  const [isEditing, setIsEditing] = useState(false)

  const isOwner = checkOwnership(currentUser, reply.userId)

  const handleUpdateReply = async (newContent) => {
    await onUpdateReply(commentId, reply._id, newContent)
    setIsEditing(false)
  }

  const handleDeleteReply = () => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      onDeleteReply(commentId, reply._id)
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-2">
      <ReplyHeader 
        user={reply.userId} 
        replyTo={reply.replyTo} 
        createdAt={reply.createdAt} 
        updatedAt={reply.updatedAt}
        wasEdited={reply.wasEdited}
      />
      
      {isEditing ? (
        <EditForm
          initialContent={reply.content}
          onSave={handleUpdateReply}
          onCancel={() => setIsEditing(false)}
          maxChars={300}
          placeholder="Edit your reply..."
        />
      ) : (
        <>
          <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onLikeReply(commentId, reply._id)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary"
              >
                <span>👍</span>
                <span>{reply.numberOfLikes || 0}</span>
              </button>
            </div>
            <CommentActions
              onEdit={() => setIsEditing(true)}
              onDelete={handleDeleteReply}
              isOwner={isOwner}
              size="text-xs"
            />
          </div>
        </>
      )}
    </div>
  )
})

const ReplyForm = React.memo(({ commentId, replyToUsername, onCancel, onSubmit }) => {
  const [replyContent, setReplyContent] = useState('')
  const [replying, setReplying] = useState(false)
  
  const MAX_REPLY_CHARS = 300
  const replyCharsLeft = MAX_REPLY_CHARS - replyContent.length

  const getReplyCounterColor = () => {
    if (replyCharsLeft < 30) return 'text-red-500'
    if (replyCharsLeft < 60) return 'text-orange-500'
    return 'text-gray-500'
  }

  const handleReplyChange = (e) => {
    const value = e.target.value
    if (value.length <= MAX_REPLY_CHARS) setReplyContent(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    setReplying(true)
    await onSubmit(commentId, replyContent, replyToUsername)
    setReplyContent('')
    setReplying(false)
  }

  return (
    <div className="mt-3 ml-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={replyContent}
          onChange={handleReplyChange}
          placeholder={`Reply to ${replyToUsername}... (max ${MAX_REPLY_CHARS} characters)`}
          className="w-full p-2 border border-gray-300 rounded text-sm resize-none h-20"
          maxLength={MAX_REPLY_CHARS}
        />
        <div className="flex justify-between items-center">
          <div className={`text-xs ${getReplyCounterColor()} transition-colors`}>
            {replyCharsLeft} characters remaining
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={replying || !replyContent.trim() || replyContent.length > MAX_REPLY_CHARS}
              className="bg-primary text-white text-sm px-4 py-1 rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {replying ? 'Replying...' : 'Reply'}
            </button>
            <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-700 text-sm px-4 py-1 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
})

const CommentItem = React.memo(({ comment, onAddReply, onLikeComment, onLikeReply, onUpdateComment, onDeleteComment, onUpdateReply, onDeleteReply }) => {
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showAllReplies, setShowAllReplies] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { currentUser } = useSelector((state) => state.user)

  const displayedReplies = showAllReplies ? comment.replies : comment.replies.slice(0, 2)
  const isOwner = checkOwnership(currentUser, comment.userId)

  const handleUpdateComment = async (newContent) => {
    await onUpdateComment(comment._id, newContent)
    setIsEditing(false)
  }

  const handleDeleteComment = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDeleteComment(comment._id)
    }
  }

  return (
    <div className='relative mb-4'>
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg">
        <CommentHeader 
          user={comment.userId} 
          createdAt={comment.createdAt} 
          updatedAt={comment.updatedAt}
          wasEdited={comment.wasEdited}
        />

        {isEditing ? (
          <EditForm
            initialContent={comment.content}
            onSave={handleUpdateComment}
            onCancel={() => setIsEditing(false)}
            maxChars={500}
            placeholder="Edit your comment..."
          />
        ) : (
          <p className="text-sm text-gray-700 mb-3">{comment.content}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <button 
              onClick={() => onLikeComment(comment._id)}
              className="flex items-center gap-1 text-gray-600 hover:text-primary"
            >
              <span>👍</span>
              <span>{comment.numberOfLikes || 0}</span>
            </button>
            
            <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-gray-600 hover:text-primary">
              {showReplyForm ? 'Cancel Reply' : 'Reply'}
            </button>

            {comment.replies && comment.replies.length > 0 && (
              <button onClick={() => setShowReplies(!showReplies)} className="text-gray-600 hover:text-primary">
                {showReplies ? 'Hide replies' : `Show replies (${comment.replies.length})`}
              </button>
            )}
          </div>

          <CommentActions
            onEdit={() => setIsEditing(true)}
            onDelete={handleDeleteComment}
            isOwner={isOwner && !isEditing}
          />
        </div>

        {showReplyForm && (
          <ReplyForm
            commentId={comment._id}
            replyToUsername={comment.userId?.username}
            onCancel={() => setShowReplyForm(false)}
            onSubmit={onAddReply}
          />
        )}
      </div>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 ml-12 border-l-2 border-primary/20 pl-4">
          {displayedReplies.map((reply, index) => (
            <ReplyItem 
              key={reply._id || index} 
              reply={reply} 
              commentId={comment._id}
              onLikeReply={onLikeReply}
              onUpdateReply={onUpdateReply}
              onDeleteReply={onDeleteReply}
            />
          ))}

          {comment.replies.length > 2 && !showAllReplies && (
            <button onClick={() => setShowAllReplies(true)} className="text-sm text-primary hover:underline mt-2">
              Show all {comment.replies.length} replies
            </button>
          )}

          {showAllReplies && comment.replies.length > 2 && (
            <button onClick={() => setShowAllReplies(false)} className="text-sm text-primary hover:underline mt-2">
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  )
})

const AddCommentForm = React.memo(({ postId, currentUser, onCommentAdded }) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  
  const MAX_CHARS = 500
  const charsLeft = MAX_CHARS - content.length

  const getCounterColor = () => {
    if (charsLeft < 50) return 'text-red-500'
    if (charsLeft < 100) return 'text-orange-500'
    return 'text-gray-500'
  }

  const handleContentChange = (e) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) setContent(value)
  }

  const addComment = async (e) => {
    e.preventDefault()
    if (!content.trim() || content.length > MAX_CHARS) return

    try {
      setLoading(true)
      const response = await axios.post('/api/comment/create', {
        content,
        postId,
        userId: currentUser._id
      }, {
        headers: { 'Content-Type': 'application/json' }
      })

      onCommentAdded(response.data)
      setContent('')
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-3xl mx-auto'>
      <div className='mb-4 flex items-center justify-center gap-2'>
        <span className='text-gray-600 text-sm'>Commenting as:</span>
        <Link to="/dashboard?tab=profile" className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
          <UserAvatar user={currentUser} />
          <span className='font-medium text-gray-800 hover:text-primary transition-colors'>
            {currentUser.username}
          </span>
        </Link>
      </div>

      <p className='font-semibold mb-4'>Add your comment</p>
      <form onSubmit={addComment} className='flex flex-col items-start gap-4 max-w-lg'>
        <textarea 
          onChange={handleContentChange}
          value={content}
          placeholder='Share your thoughts... (max 500 characters)' 
          className='w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all h-48 resize-none'
          maxLength={MAX_CHARS}
          disabled={loading}
        ></textarea>
        
        <div className='w-full flex justify-between items-center'>
          <div className={`text-sm ${getCounterColor()} transition-colors`}>
            {charsLeft} characters remaining
          </div>
          <button 
            type="submit" 
            disabled={!content.trim() || content.length > MAX_CHARS || loading}
            className='bg-primary text-white rounded-lg p-2 px-8 hover:scale-102 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          >
            {loading ? 'Posting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
})

const CommentsSection = ({ postId }) => {
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  
  const { currentUser } = useSelector((state) => state.user)

  const fetchComments = async () => {
    try {
      setCommentsLoading(true)
      const response = await axios.get(`/api/comment/getPostComments/${postId}`)
      setComments(response.data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const addReply = async (commentId, replyContent, replyToUsername) => {
    if (!replyContent.trim()) return

    try {
      const response = await axios.post(`/api/comment/${commentId}/reply`, {
        content: replyContent,
        userId: currentUser._id,
        replyTo: replyToUsername
      }, {
        headers: { 'Content-Type': 'application/json' }
      })

      const updatedComment = response.data
      setComments(prevComments => 
        prevComments.map(comment => comment._id === commentId ? updatedComment : comment)
      )
    } catch (error) {
      console.error('Error adding reply:', error)
      alert('Failed to add reply. Please try again.')
    }
  }

  const likeComment = async (commentId) => {
    try {
      const response = await axios.put(`/api/comment/likeComment/${commentId}`, {}, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...response.data,
              userId: comment.userId,
              replies: response.data.replies.map((reply, index) => ({
                ...reply,
                userId: comment.replies[index]?.userId || reply.userId
              }))
            }
          }
          return comment
        })
      )
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const likeReply = async (commentId, replyId) => {
    try {
      const response = await axios.put(`/api/comment/${commentId}/likeReply/${replyId}`, {}, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...response.data,
              userId: comment.userId,
              replies: response.data.replies.map((reply, index) => ({
                ...reply,
                userId: comment.replies[index]?.userId || reply.userId
              }))
            }
          }
          return comment
        })
      )
    } catch (error) {
      console.error('Error liking reply:', error)
    }
  }

  const updateComment = async (commentId, newContent) => {
    try {
      const response = await axios.put(`/api/comment/updateComment/${commentId}`, {
        content: newContent
      }, {
        headers: { 'Content-Type': 'application/json' }
      })

      setComments(prevComments => 
        prevComments.map(comment => comment._id === commentId ? response.data : comment)
      )
    } catch (error) {
      console.error('Error updating comment:', error)
      alert('Failed to update comment. Please try again.')
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/comment/deleteComment/${commentId}`, {
        headers: { 'Content-Type': 'application/json' }
      })

      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment. Please try again.')
    }
  }

  const updateReply = async (commentId, replyId, newContent) => {
    try {
      const response = await axios.put(`/api/comment/${commentId}/updateReply/${replyId}`, {
        content: newContent
      }, {
        headers: { 'Content-Type': 'application/json' }
      })

      setComments(prevComments => 
        prevComments.map(comment => comment._id === commentId ? response.data : comment)
      )
    } catch (error) {
      console.error('Error updating reply:', error)
      alert('Failed to update reply. Please try again.')
    }
  }

  const deleteReply = async (commentId, replyId) => {
    try {
      await axios.delete(`/api/comment/${commentId}/deleteReply/${replyId}`, {
        headers: { 'Content-Type': 'application/json' }
      })

      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply._id !== replyId)
            }
          }
          return comment
        })
      )
    } catch (error) {
      console.error('Error deleting reply:', error)
      alert('Failed to delete reply. Please try again.')
    }
  }

  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments])
  }

  useEffect(() => {
    if (postId) fetchComments()
  }, [postId])

  return (
    <>
      <div className='mt-14 mb-10 max-w-3xl mx-auto'>
        <p className='font-semibold mb-4'>Comments ({comments.length})</p>
        
        {commentsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {comments.map((comment) => (
              <CommentItem 
                key={comment._id} 
                comment={comment} 
                onAddReply={addReply}
                onLikeComment={likeComment}
                onLikeReply={likeReply}
                onUpdateComment={updateComment}
                onDeleteComment={deleteComment}
                onUpdateReply={updateReply}
                onDeleteReply={deleteReply}
              />
            ))}
          </div>
        )}
      </div>

      {currentUser ? (
        <AddCommentForm 
          postId={postId}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded}
        />
      ) : (
        <div className='max-w-3xl mx-auto text-center py-8'>
          <p className='text-gray-600 mb-4'>Please log in to leave a comment</p>
          <Link 
            to="/login" 
            className='bg-primary text-white rounded-lg p-2 px-8 hover:scale-102 transition-all inline-block'
          >
            Log In
          </Link>
        </div>
      )}
    </>
  )
}

export default CommentsSection