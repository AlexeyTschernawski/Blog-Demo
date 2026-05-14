import { Button, Modal, Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/post/getposts`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          setUserPosts(data.posts);
          if (data.posts.length < 9) setShowMore(false);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) fetchPosts();
  }, [currentUser]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const res = await fetch(`/api/post/getposts?startIndex=${startIndex}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 9) setShowMore(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="w-full px-4 py-6 md:px-8 lg:px-12">
      {currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
            <Table hoverable className="w-full min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Date updated</th>
                  <th className="px-4 py-3">Post image</th>
                  <th className="px-4 py-3">Post title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Delete</th>
                  <th className="px-4 py-3">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {userPosts.map((post) => (
                  <tr
                    key={post._id}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="whitespace-nowrap font-medium text-gray-900 dark:text-white px-4 py-3">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/post/${post.slug}`}>
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-24 h-16 object-cover rounded-md shadow-md"
                        />
                      </Link>
                    </td>
                    <td className="font-semibold text-lg px-4 py-3">
                      <Link
                        className="text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400"
                        to={`/post/${post.slug}`}
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="text-gray-600 dark:text-gray-300 px-4 py-3">
                      {post.category}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        onClick={() => {
                          setShowModal(true);
                          setPostIdToDelete(post._id);
                        }}
                        className="text-red-600 hover:underline cursor-pointer font-medium"
                      >
                        Delete
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/update-post/${post._id}`}
                        className="text-teal-600 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
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
        <p className="text-center text-2xl text-gray-500 mt-20">You have no posts yet!</p>
      )}

      {/* Modal window */}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <div className="p-6 text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this post?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeletePost}>
              Yes, I'm sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No, cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
