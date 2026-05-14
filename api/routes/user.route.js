import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middlewares/verifyUser.js';
import { test, updateUser, deleteProfilePicture, signout, getUsers, getUser } from '../controllers/user.controller.js';
import { getImageKitAuth, uploadImage, uploadCompressedImage, uploadSmartCompressedImage } from '../config/imageKit.js';

import { deleteUser } from '../controllers/user.controller.js';
import { extendTimeout } from '../middlewares/timeout.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50mb
    fieldSize: 50 * 1024 * 1024 // 50 mb
  }
});

router.get('/test', test);
router.get('/auth/ik', getImageKitAuth);
router.post('/upload', extendTimeout, upload.single('image'), uploadImage);
router.put('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.post('/signout', signout);

router.get('/getusers', verifyToken, getUsers);
router.get('/:userId', getUser);

router.post('/upload-compressed',extendTimeout, upload.single('image'), (req, res, next) => {
  // timeout 60 sec
  req.setTimeout(60 * 1000, () => {
    res.status(408).send('Request Timeout');
  });
  next();
}, uploadCompressedImage);
router.post('/upload-smart', uploadSmartCompressedImage);

router.delete('/delete-profile-picture/:id', deleteProfilePicture);


export default router;