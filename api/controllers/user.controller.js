import User from "../models/user.model.js";
import { deleteImage } from "../config/imageKit.js";
import bcryptjs from 'bcryptjs';


export const test = (req, res) => {
    res.json({message: 'API is working!'});
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, profilePicture, profilePictureFileId, password } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updateData = {};
    let oldFileIdToDelete = null;

    if (profilePicture && profilePictureFileId) {
      if (user.profilePictureFileId && 
          !user.profilePicture.includes('blank-profile-picture-973460')) {
        oldFileIdToDelete = user.profilePictureFileId;
      }
      
      updateData.profilePicture = profilePicture;
      updateData.profilePictureFileId = profilePictureFileId;
    }

    if (username)
      if (username.length > 20) {
        return res.status(400).json({ success: false, message: 'Username must be maximum 20 characters' });
      }
    updateData.username = username;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      updateData.password = bcryptjs.hashSync(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true }
    ).select('-password');

    if (oldFileIdToDelete) {
      try {
        await deleteImage(oldFileIdToDelete);
        console.log(`Deleted old image with fileId: ${oldFileIdToDelete}`);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!req.user.isAdmin && req.user.id !== id) {
    return res.status(403).json({ 
      success: false, 
      message: 'You are not allowed to delete this user' 
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.profilePictureFileId && 
        !user.profilePicture.includes('blank-profile-picture-973460')) {
      await deleteImage(user.profilePictureFileId);
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProfilePicture = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.profilePictureFileId && !user.profilePicture.includes('blank-profile-picture-973460')) {
      try {
        await deleteImage(user.profilePictureFileId);
        console.log(`Deleted image from ImageKit: ${user.profilePictureFileId}`);
      } catch (error) {
        console.error('Error deleting image from ImageKit:', error);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          profilePicture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
          profilePictureFileId: ''
        }
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Profile picture reset to default'
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie('access_token')
      .status(200)
      .json('User has been signed out');
  } catch (error) {
    next(error);
  }
};


export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};