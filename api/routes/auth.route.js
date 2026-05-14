import express from 'express';
import { 
    signup, 
    signin, 
    google, 
    verifyEmail, 
    resendVerificationEmail,
    forgotPassword,
    validateResetToken,
    resetPassword 
 } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

router.post('/forgot-password', forgotPassword);
router.get('/validate-reset-token/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

export default router;