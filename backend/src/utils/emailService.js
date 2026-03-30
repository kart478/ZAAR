
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOTP(email, otp, purpose) {
    const subject = purpose === 'login' ? 'Login OTP Code' : 
                   purpose === 'password-reset' ? 'Password Reset Code' : 
                   'Verification OTP Code';
    
    const title = purpose === 'login' ? 'Login' : 
                  purpose === 'password-reset' ? 'Password Reset' : 
                  'Verification';
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      text: `Your ${title.toLowerCase()} code is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${title} OTP</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
          ${purpose === 'password-reset' ? '<p>If you did not request a password reset, please secure your account immediately.</p>' : ''}
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  }
}

export default new EmailService();
