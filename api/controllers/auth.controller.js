import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../utils/email.js";

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    // length password 
    if (password && password.length < 8) {
        return next(errorHandler(400, 'Password must be at least 8 characters long'));
    }

    if (
        !username ||
        !email ||
        !password ||
        username === '' ||
        email === '' ||
        password === ''
    ) {
        return next(errorHandler(400, 'All fields are required'));
    }

    if (username.length > 20) {
        return next(errorHandler(400, 'Username must be maximum 20 characters long'));
    }

 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(errorHandler(400, 'Please enter a valid email address'));
    }

    try {
    
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return next(errorHandler(400, 'User with this email or username already exists'));
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);
        
     
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            emailVerificationToken,
            emailVerificationExpires,
            isEmailVerified: false,
        });

        await newUser.save();

   
        await sendVerificationEmail(email, username, emailVerificationToken);

        res.json({ 
            success: true, 
            message: 'Registration successful! Please check your email to verify your account.' 
        });
    } catch (error) {
        next(errorHandler(400, 'Error during registration'));
    }
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || email === '' || password === '') {
        return next(errorHandler(400, 'All fields are required'));
    }

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(404, 'User not found'));
        }

        
        if (!validUser.isEmailVerified) {
            return next(errorHandler(403, 'Please verify your email address before logging in. Check your email for the verification link.'));
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(400, 'Invalid password'));
        }

        const token = jwt.sign(
            { id: validUser._id, isAdmin: validUser.isAdmin },
            process.env.JWT_SECRET
        );

        const { password: pass, ...rest } = validUser._doc;

        res
            .status(200)
            .cookie('access_token', token, {
                httpOnly: true,
            })
            .json(rest);
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        console.log('Processing email verification for token:', token);

 
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
        
            const alreadyVerified = await User.findOne({ emailVerificationToken: token });
            if (alreadyVerified && alreadyVerified.isEmailVerified) {
                console.log('User already verified:', alreadyVerified.email);
                return res.redirect(`${process.env.CLIENT_URL}/login?message=${encodeURIComponent('Your email is already verified. Please log in.')}&type=info&email=${encodeURIComponent(alreadyVerified.email)}`);
            }
            
            console.log('Invalid or expired verification token');
            return res.redirect(`${process.env.CLIENT_URL}/login?message=${encodeURIComponent('This verification link has expired or is invalid. Please request a new one.')}&type=error`);
        }


        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        
        await user.save();

        console.log(`Email verified for: ${user.email}`);

 
        try {
            await sendWelcomeEmail(user.email, user.username);
        } catch (emailError) {
            console.error('Could not send welcome email:', emailError);
        }

    
        return res.redirect(`${process.env.CLIENT_URL}/login?message=${encodeURIComponent('Your email has been verified successfully! You can now log in.')}&type=success&email=${encodeURIComponent(user.email)}`);

    } catch (error) {
        console.error('Error in verifyEmail:', error);
        return res.redirect(`${process.env.CLIENT_URL}/login?message=${encodeURIComponent('An error occurred during verification. Please try again or contact support.')}&type=error`);
    }
};



export const resendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email || email === '') {
            return next(errorHandler(400, 'Email is required'));
        }

        const user = await User.findOne({ email });

        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }

        if (user.isEmailVerified) {
            return next(errorHandler(400, 'Email is already verified'));
        }


        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpires = emailVerificationExpires;
        await user.save();


        await sendVerificationEmail(email, user.username, emailVerificationToken);

        res.json({
            success: true,
            message: 'Verification email sent successfully! Please check your email.'
        });

    } catch (error) {
        next(errorHandler(500, 'Error resending verification email'));
    }
};


export const google = async (req, res, next) => {
    const { email, name, googlePhotoUrl, given_name, family_name } = req.body;
    
    try {
        const user = await User.findOne({ email });
        
        if (user) {
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                await user.save();
            }
            
            const token = jwt.sign(
                { id: user._id, isAdmin: user.isAdmin },
                process.env.JWT_SECRET
            );
            
            const { password: pass, ...rest } = user._doc;
            
            res
                .status(200)
                .cookie('access_token', token, {
                    httpOnly: true,
                })
                .json(rest);
        } else {
     
            let firstName;
            
            if (given_name) {
                firstName = given_name.toLowerCase();
            } else if (name) {
                firstName = name.split(' ')[0].toLowerCase();
            } else {
                firstName = email.split('@')[0].toLowerCase();
            }
            
            firstName = firstName.replace(/[^a-z0-9]/g, '');
            
            if (!firstName) {
                firstName = 'user';
            }
            
            let username = firstName;
            let counter = 1;
            
            while (await User.findOne({ username })) {
                username = `${firstName}${counter}`;
                counter++;
                
                if (counter > 100) {
                    username = `${firstName}${Date.now().toString().slice(-4)}`;
                    break;
                }
            }

            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            
         
            const newUser = new User({
                username: username,
                email,
                password: hashedPassword,
                profilePicture: googlePhotoUrl,
                isEmailVerified: true, 
            });
            
            await newUser.save();
            
            const token = jwt.sign(
                { id: newUser._id, isAdmin: newUser.isAdmin },
                process.env.JWT_SECRET
            );
            
            const { password, ...rest } = newUser._doc;
            
            res
                .status(200)
                .cookie('access_token', token, {
                    httpOnly: true,
                })
                .json(rest);
        }
    } catch (error) {
        next(error);
    }
};




export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || email === '') {
      return next(errorHandler(400, 'Email is required'));
    }


    const user = await User.findOne({ email });
    
    
    if (!user) {
      console.log('Password reset requested for non-existent email:', email);
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }


    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 h

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    
    await user.save();


    try {
      await sendPasswordResetEmail(email, user.username, passwordResetToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    next(errorHandler(500, 'Error processing password reset request'));
  }
};

export const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });

  } catch (error) {
    next(errorHandler(500, 'Error validating reset token'));
  }
};


export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;


    if (password !== confirmPassword) {
      return next(errorHandler(400, 'Passwords do not match'));
    }


    if (password.length < 8) {
      return next(errorHandler(400, 'Password must be at least 8 characters long'));
    }


    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(errorHandler(400, 'Password reset link is invalid or has expired'));
    }


    const hashedPassword = bcryptjs.hashSync(password, 10);


    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in with your new password.',
      redirectUrl: `${process.env.CLIENT_URL}/login?message=${encodeURIComponent('Password reset successful! You can now log in.')}&type=success&email=${encodeURIComponent(user.email)}`
    });

  } catch (error) {
    console.error('Reset password error:', error);
    next(errorHandler(500, 'Error resetting password'));
  }
};