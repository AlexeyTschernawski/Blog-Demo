import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// for EMAIL
const createVerificationEmailTemplate = (username, verificationLink, appName = 'IC INFORM') => {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* Container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }
        
        /* Header */
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 48px 32px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1%, transparent 1%);
            background-size: 20px 20px;
            opacity: 0.1;
        }
        
        .app-logo {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 16px;
            display: inline-block;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.3px;
        }
        
        /* Content */
        .email-content {
            padding: 48px 40px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        /* Button */
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none !important;
            padding: 18px 48px;
            border-radius: 12px;
            font-size: 17px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            border: none;
            cursor: pointer;
            min-width: 220px;
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        /* Warning */
        .warning-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 20px;
            margin: 32px 0;
            text-align: center;
        }
        
        .warning-box strong {
            color: #92400e;
            font-size: 15px;
            display: block;
            margin-bottom: 8px;
        }
        
        .warning-box span {
            color: #b45309;
            font-size: 14px;
        }
        
        /* Footer */
        .email-footer {
            background-color: #f9fafb;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .copyright {
            color: #9ca3af;
            font-size: 13px;
            margin-top: 16px;
            line-height: 1.5;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
            .email-container {
                border-radius: 0;
                border: none;
            }
            
            .email-header {
                padding: 40px 24px;
            }
            
            .email-content {
                padding: 40px 24px;
            }
            
            .verify-button {
                padding: 16px 32px;
                width: 100%;
                max-width: 280px;
            }
            
            .email-footer {
                padding: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="app-logo">IC INFORM</div>
            <h1>Verify Your Email</h1>
        </div>
        
        <!-- Content -->
        <div class="email-content">
            <h2 class="greeting">Hi ${username},</h2>
            
            <p class="message">
                Welcome to IC INFORM! To complete your registration and access all features, 
                please verify your email address by clicking the button below.
            </p>
            
            <!-- Verify Button -->
            <div class="button-container">
                <a href="${verificationLink}" class="verify-button">
                    Verify Email Address
                </a>
            </div>
            
            <!-- Warning -->
            <div class="warning-box">
                <strong>⚠️ This link expires in 24 hours</strong>
                <span>For security reasons, please verify your email within 24 hours.</span>
            </div>
            
            <p class="message">
                If you didn't create an account with Info Core, you can safely ignore this email.
                Your account will not be activated without verification.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <div class="copyright">
                © ${currentYear} IC INFORM. All rights reserved.<br>
                This is an automated message, please do not reply directly.
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// For Welcome Email
const createWelcomeEmailTemplate = (username, appName = 'Info Core') => {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${appName}!</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        
        .email-header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 48px 32px;
            text-align: center;
        }
        
        .app-logo {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 16px;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .email-content {
            padding: 48px 40px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 24px;
        }
        
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 24px;
            line-height: 1.7;
        }
        
        .features {
            background: #f0fdf4;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
        }
        
        .features h3 {
            color: #065f46;
            margin-bottom: 16px;
            font-size: 18px;
        }
        
        .features ul {
            list-style: none;
        }
        
        .features li {
            padding: 8px 0;
            color: #047857;
            position: relative;
            padding-left: 28px;
        }
        
        .features li:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        
        .cta-button {
            display: inline-block;
            background: #10b981;
            color: #ffffff !important;
            text-decoration: none !important;
            padding: 16px 40px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            background: #059669;
            transform: translateY(-2px);
        }
        
        .email-footer {
            background: #f9fafb;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .email-content {
                padding: 32px 24px;
            }
            
            .email-header {
                padding: 40px 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="app-logo">IC INFORM</div>
            <h1>Welcome to IC INFORM!</h1>
            <p>Your email has been successfully verified</p>
        </div>
        
        <div class="email-content">
            <h2 class="greeting">Hi ${username},</h2>
            
            <p class="message">
                Congratulations! Your email address has been verified and your account is now active. 
                You're all set to explore everything IC INFORM has to offer.
            </p>
            
            
            <div style="text-align: center;">
                <a href="https://www.icinform.com" class="cta-button" style="color: #ffffff;">
                    Go to the IC INFORM
                </a>
            </div>
            
            <p class="message">
                We value a friendly and respectful environment. Please communicate politely and treat others with courtesy at all times.
            </p>
        </div>
        
        <div class="email-footer">
            <p>© ${currentYear} IC INFORM. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

// functional for sending EMAIL
export const sendVerificationEmail = async (email, username, token) => {
  try {
    const transporter = createTransporter();
    
    const verificationLink = `${process.env.API_URL}/api/auth/verify-email/${token}`;
    
    const mailOptions = {
      from: `"IC INFORM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - IC INFORM',
      html: createVerificationEmailTemplate(username, verificationLink),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email} (Message ID: ${info.messageId})`);
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"IC INFORM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to IC INFORM!',
      html: createWelcomeEmailTemplate(username),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email} (Message ID: ${info.messageId})`);
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};



// for forget password
const createPasswordResetEmailTemplate = (username, resetLink, appName = 'IC INFORM') => {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }
        
        .email-header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 48px 32px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1%, transparent 1%);
            background-size: 20px 20px;
            opacity: 0.1;
        }
        
        .app-logo {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 16px;
            display: inline-block;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.3px;
        }
        
        .email-content {
            padding: 48px 40px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            text-decoration: none;
            padding: 18px 48px;
            border-radius: 12px;
            font-size: 17px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
            border: none;
            cursor: pointer;
            min-width: 220px;
        }
        
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4);
        }
        
        .warning-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 20px;
            margin: 32px 0;
            text-align: center;
        }
        
        .warning-box strong {
            color: #92400e;
            font-size: 15px;
            display: block;
            margin-bottom: 8px;
        }
        
        .warning-box span {
            color: #b45309;
            font-size: 14px;
        }
        
        .email-footer {
            background-color: #f9fafb;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .copyright {
            color: #9ca3af;
            font-size: 13px;
            margin-top: 16px;
            line-height: 1.5;
        }
        
        @media (max-width: 600px) {
            .email-container {
                border-radius: 0;
                border: none;
            }
            
            .email-header {
                padding: 40px 24px;
            }
            
            .email-content {
                padding: 40px 24px;
            }
            
            .reset-button {
                padding: 16px 32px;
                width: 100%;
                max-width: 280px;
            }
            
            .email-footer {
                padding: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="app-logo">IC INFORM</div>
            <h1>Reset Your Password</h1>
        </div>
        
        <div class="email-content">
            <h2 class="greeting">Hi ${username},</h2>
            
            <p class="message">
                We received a request to reset your password for your IC INFORM account. 
                Click the button below to choose a new password.
            </p>
            
            <div class="button-container">
                <a href="${resetLink}" class="reset-button">
                    Reset Password
                </a>
            </div>
            
            <div class="warning-box">
                <strong>⚠️ This link expires in 1 hour</strong>
                <span>For security reasons, this password reset link will expire in 1 hour.</span>
            </div>
            
            <p class="message">
                If you did not request a password reset, please ignore this email.
                Your password will remain unchanged.
            </p>
        </div>
        
        <div class="email-footer">
            <div class="copyright">
                © ${currentYear} Info Core. All rights reserved.<br>
                This is an automated message, please do not reply directly.
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// FUNCTION FOR SENDING PASSWORD RESET EMAIL
export const sendPasswordResetEmail = async (email, username, token) => {
  try {
    const transporter = createTransporter();
    
     // Password reset link points to the frontend
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: `"IC INFORM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - IC INFORM',
      html: createPasswordResetEmailTemplate(username, resetLink),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email} (Message ID: ${info.messageId})`);
    
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};