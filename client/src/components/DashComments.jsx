import React, { useEffect, useState } from 'react';
import { Button, Modal, Table } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function DashComments() {
  const { currentUser } = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState('');
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [replyIdToDelete, setReplyIdToDelete] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comment/getcomments`, { 
          credentials: 'include' 
        });
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments || []);
          if (data.comments.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser?.isAdmin) {
      fetchComments();
    }
  }, [currentUser?._id]);

  const handleShowMore = async () => {
    const startIndex = comments.length;
    try {
      const res = await fetch(
        `/api/comment/getcomments?startIndex=${startIndex}`,
        {
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, ...(data.comments || [])]);
        if (data.comments.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const toggleCommentExpansion = (commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const handleDeleteComment = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/comment/deleteComment/${commentIdToDelete}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentIdToDelete)
        );
        setShowModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteReply = async () => {
    setShowReplyModal(false);
    if (!replyIdToDelete.commentId || !replyIdToDelete.replyId) return;
    
    try {
      const res = await fetch(
        `/api/comment/${replyIdToDelete.commentId}/deleteReply/${replyIdToDelete.replyId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments(prev => 
          prev.map(comment => {
            if (comment._id === replyIdToDelete.commentId) {
              return {
                ...comment,
                replies: comment.replies?.filter(reply => reply._id !== replyIdToDelete.replyId) || []
              };
            }
            return comment;
          })
        );
        setShowReplyModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const formatContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full px-4 py-6 md:px-8 lg:px-12">
      {currentUser?.isAdmin && comments.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
            <Table hoverable className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Actions</th>
                  <th className="whitespace-nowrap px-4 py-3">Date updated</th>
                  <th className="px-4 py-3">Comment content</th>
                  <th className="px-4 py-3">Likes</th>
                  <th className="px-4 py-3">Replies</th>
                  <th className="px-4 py-3">Post ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comments.map((comment) => (
                  <React.Fragment key={comment._id}>
                    <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        {comment.replies && comment.replies.length > 0 && (
                          <button
                            onClick={() => toggleCommentExpansion(comment._id)}
                            className="flex items-center text-gray-600 hover:text-blue-600"
                          >
                            {expandedComments.has(comment._id) ? (
                              <>
                                <FaChevronUp className="mr-1" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <FaChevronDown className="mr-1" />
                                <span>Show</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="whitespace-nowrap font-medium text-gray-900 dark:text-white px-4 py-3">
                        {new Date(comment.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="truncate" title={comment.content}>
                          {formatContent(comment.content)}
                        </div>
                      </td>
                      <td className="text-gray-600 dark:text-gray-300 px-4 py-3 text-center">
                        {comment.numberOfLikes || 0}
                      </td>
                      <td className="text-gray-600 dark:text-gray-300 px-4 py-3 text-center">
                        {comment.replies?.length || 0}
                      </td>
                      <td className="text-gray-600 dark:text-gray-300 px-4 py-3">
                        <div className="truncate max-w-xs" title={comment.postId}>
                          {formatContent(comment.postId, 20)}
                        </div>
                      </td>
                      <td className="text-gray-600 dark:text-gray-300 px-4 py-3">
                        <div 
                          className="truncate max-w-xs" 
                          title={comment.userId?.username || 'Unknown User'}
                        >
                          {comment.userId?.username || 'Unknown User'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          onClick={() => {
                            setShowModal(true);
                            setCommentIdToDelete(comment._id);
                          }}
                          className="text-red-600 hover:underline cursor-pointer font-medium"
                        >
                          Delete
                        </span>
                      </td>
                    </tr>
                    
                    {expandedComments.has(comment._id) && comment.replies && comment.replies.length > 0 && (
                      <tr className="bg-gray-50 dark:bg-gray-900">
                        <td colSpan="8" className="px-4 py-3">
                          <div className="ml-8 border-l-2 border-blue-200 pl-4">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Replies ({comment.replies.length})
                            </h4>
                            <div className="space-y-3">
                              {comment.replies.map((reply) => (
                                <div 
                                  key={reply._id}
                                  className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {reply.userId?.username || 'Unknown User'}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(reply.updatedAt).toLocaleDateString()}
                                          </span>
                                          {reply.wasEdited && (
                                            <span className="text-xs text-gray-400">(edited)</span>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          Likes: {reply.numberOfLikes || 0}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {formatContent(reply.content, 150)}
                                      </p>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Reply to: {reply.replyTo || 'N/A'}
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <button
                                        onClick={() => {
                                          setShowReplyModal(true);
                                          setReplyIdToDelete({
                                            commentId: comment._id,
                                            replyId: reply._id
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </div>

          {showMore && (
            <div className="text-center mt-4">
              <Button
                onClick={handleShowMore}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                Show More
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-2xl text-gray-500 mt-20">
          {currentUser?.isAdmin ? 'You have no comments yet!' : 'Access Denied'}
        </p>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <div className="p-6 text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this comment?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeleteComment}>
              Yes, I'm sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No, cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal show={showReplyModal} onClose={() => setShowReplyModal(false)} popup size="md">
        <div className="p-6 text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this reply?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeleteReply}>
              Yes, I'm sure
            </Button>
            <Button color="gray" onClick={() => setShowReplyModal(false)}>
              No, cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}