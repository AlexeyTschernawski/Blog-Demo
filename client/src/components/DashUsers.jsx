import { Modal, Table, Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/user/getusers`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(
        `/api/user/getusers?startIndex=${startIndex}`,
        {
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users]);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(
        `/api/user/delete/${userIdToDelete}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
        setShowModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="w-full px-4 py-6 md:px-8 lg:px-12">
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
            <Table hoverable className="w-full min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Date created</th>
                  <th className="px-4 py-3">User image</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="whitespace-nowrap font-medium text-gray-900 dark:text-white px-4 py-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-10 h-10 object-cover bg-gray-500 rounded-full"
                      />
                    </td>
                    <td className="font-semibold text-lg px-4 py-3">
                      {user.username}
                    </td>
                    <td className="text-gray-600 dark:text-gray-300 px-4 py-3">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      {user.isAdmin ? (
                        <FaCheck className='text-green-500' />
                      ) : (
                        <FaTimes className='text-red-500' />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        onClick={() => {
                          setShowModal(true);
                          setUserIdToDelete(user._id);
                        }}
                        className="text-red-600 hover:underline cursor-pointer font-medium"
                      >
                        Delete
                      </span>
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
        <p className="text-center text-2xl text-gray-500 mt-20">
          {currentUser.isAdmin ? 'You have no users yet!' : 'Access denied!'}
        </p>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <div className="p-6 text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this user?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeleteUser}>
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