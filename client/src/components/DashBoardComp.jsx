import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiDocumentText,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function DashboardComp() {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/user/getusers?limit=5', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          setTotalUsers(data.totalUsers);
          setLastMonthUsers(data.lastMonthUsers);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/post/getposts?limit=5', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
          setTotalPosts(data.totalPosts);
          setLastMonthPosts(data.lastMonthPosts);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch('/api/comment/getcomments?limit=5', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments);
          setTotalComments(data.totalComments);
          setLastMonthComments(data.lastMonthComments);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser.isAdmin) {
      fetchUsers();
      fetchPosts();
      fetchComments();
    }
  }, [currentUser]);

  return (
    <div className="p-3 md:mx-auto">
      <div className="flex-wrap flex gap-4 justify-center">
        {/* Total Users Card */}
        <div className="flex flex-col p-3 dark:bg-gray-800 gap-4 md:w-72 w-full rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 dark:text-gray-400 text-md uppercase">Total Users</h3>
              <p className="text-2xl dark:text-white">{totalUsers}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 dark:text-green-400 flex items-center">
              <HiArrowNarrowUp />
              {lastMonthUsers}
            </span>
            <div className="text-gray-500 dark:text-gray-400">Last month</div>
          </div>
        </div>

        {/* Total Comments Card */}
        <div className="flex flex-col p-3 dark:bg-gray-800 gap-4 md:w-72 w-full rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 dark:text-gray-400 text-md uppercase">Total Comments</h3>
              <p className="text-2xl dark:text-white">{totalComments}</p>
            </div>
            <HiAnnotation className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 dark:text-green-400 flex items-center">
              <HiArrowNarrowUp />
              {lastMonthComments}
            </span>
            <div className="text-gray-500 dark:text-gray-400">Last month</div>
          </div>
        </div>

        {/* Total Posts Card */}
        <div className="flex flex-col p-3 dark:bg-gray-800 gap-4 md:w-72 w-full rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 dark:text-gray-400 text-md uppercase">Total Posts</h3>
              <p className="text-2xl dark:text-white">{totalPosts}</p>
            </div>
            <HiDocumentText className="bg-lime-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 dark:text-green-400 flex items-center">
              <HiArrowNarrowUp />
              {lastMonthPosts}
            </span>
            <div className="text-gray-500 dark:text-gray-400">Last month</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
        {/* Recent Users Table */}
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2 dark:text-white">Recent users</h1>
            <Link 
              to={'/dashboard?tab=users'}
              className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-700 border border-purple-600 dark:border-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-500"
            >
              See all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 dark:text-gray-300">User image</th>
                  <th className="px-4 py-3 dark:text-gray-300">Username</th>
                </tr>
              </thead>
              <tbody>
                {users && users.map((user) => (
                  <tr key={user._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-4 py-3">
                      <img
                        src={user.profilePicture}
                        alt='user'
                        className='w-10 h-10 rounded-full bg-gray-500 object-cover'
                        onError={(e) => {
                          e.target.src = '/assets/user_icon.jpg';
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 dark:text-white">{user.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Comments Table */}
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2 dark:text-white">Recent comments</h1>
            <Link 
              to={'/dashboard?tab=comments'}
              className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-700 border border-purple-600 dark:border-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-500"
            >
              See all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 dark:text-gray-300">Comment content</th>
                  <th className="px-4 py-3 dark:text-gray-300">Likes</th>
                </tr>
              </thead>
              <tbody>
                {comments && comments.map((comment) => (
                  <tr key={comment._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 dark:text-gray-300">{comment.content}</p>
                    </td>
                    <td className="px-4 py-3 dark:text-white">{comment.numberOfLikes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Posts Table */}
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2 dark:text-white">Recent posts</h1>
            <Link 
              to={'/dashboard?tab=posts'}
              className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-700 border border-purple-600 dark:border-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-500"
            >
              See all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 dark:text-gray-300">Post image</th>
                  <th className="px-4 py-3 dark:text-gray-300">Post Title</th>
                  <th className="px-4 py-3 dark:text-gray-300">Category</th>
                </tr>
              </thead>
              <tbody>
                {posts && posts.map((post) => (
                  <tr key={post._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-4 py-3">
                      <img
                        src={post.image}
                        alt='post'
                        className='w-14 h-10 rounded-md bg-gray-500 object-cover'
                      />
                    </td>
                    <td className="px-4 py-3 max-w-xs dark:text-white">{post.title}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{post.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}