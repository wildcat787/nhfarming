const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email configuration
const emailConfig = {
  from: 'au.d787@gmail.com',
  subject: 'Welcome to NHFarming',
  // Gmail SMTP settings
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'au.d787@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD // This will be set as environment variable
  }
};

// Create transporter
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.log('⚠️  Email service disabled: GMAIL_APP_PASSWORD not configured');
    return null;
  }
  
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send welcome email with verification link
const sendWelcomeEmail = async (userEmail, username, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    // If email service is not configured, skip sending email
    if (!transporter) {
      console.log('📧 Email service not configured, skipping welcome email');
      return true;
    }
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://nhfarming-frontend.onrender.com'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: emailConfig.from,
      to: userEmail,
      subject: 'Welcome to NHFarming - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🚜 Welcome to NHFarming!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your modern farming management solution</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2e7d32; margin-top: 0;">Hello ${username}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Welcome to NHFarming! We're excited to have you on board. To get started and access all features, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #2e7d32; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.5;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #2e7d32; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <h3 style="color: #2e7d32; margin-top: 0;">What's Next?</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>Verify your email to unlock all features</li>
                <li>Add your vehicles and equipment</li>
                <li>Track your crops and applications</li>
                <li>Manage inputs and maintenance</li>
                <li>Monitor your farming operations</li>
              </ul>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
              This email was sent from NHFarming. If you didn't create an account, please ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to NHFarming!

Hello ${username},

Welcome to NHFarming! We're excited to have you on board. To get started and access all features, 
please verify your email address by visiting this link:

${verificationUrl}

What's Next?
- Verify your email to unlock all features
- Add your vehicles and equipment
- Track your crops and applications
- Manage inputs and maintenance
- Monitor your farming operations

This email was sent from NHFarming. If you didn't create an account, please ignore this email.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, username, resetToken) => {
  try {
    const transporter = createTransporter();
    
    // If email service is not configured, skip sending email
    if (!transporter) {
      console.log('📧 Email service not configured, skipping password reset email');
      return true;
    }
    
    const resetUrl = `${process.env.FRONTEND_URL || 'https://nhfarming-frontend.onrender.com'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: emailConfig.from,
      to: userEmail,
      subject: 'NHFarming - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">NHFarming Account Security</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2e7d32; margin-top: 0;">Hello ${username}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              We received a request to reset your password for your NHFarming account. 
              Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #2e7d32; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.5;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #2e7d32; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, 
                please ignore this email and your password will remain unchanged.
              </p>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
              This email was sent from NHFarming. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `
Password Reset Request

Hello ${username},

We received a request to reset your password for your NHFarming account. 
Click the link below to create a new password:

${resetUrl}

Security Note: This link will expire in 1 hour. If you didn't request a password reset, 
please ignore this email and your password will remain unchanged.

This email was sent from NHFarming. If you didn't request a password reset, please ignore this email.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  generateVerificationToken
}; 