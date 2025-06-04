import { MailService } from '@sendgrid/mail';

let mailService: MailService | null = null;

if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!mailService) {
    console.log(`Email would be sent to ${params.to}: ${params.subject}`);
    console.log('SendGrid not configured - email functionality disabled');
    return true; // Return true for development without SendGrid
  }
  
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="background: linear-gradient(135deg, #ff6b9d, #c44569); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">日本語学習 - Japanese Learning</h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Verify Your Email Address</h2>
        
        <p>Welcome to your Japanese learning journey! Please verify your email address to activate your account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: linear-gradient(135deg, #ff6b9d, #c44569); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #ff6b9d;">${verificationUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #888; font-size: 12px; text-align: center;">
          This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      </div>
    </div>
  `;

  const text = `
Welcome to Japanese Learning!

Please verify your email address by visiting: ${verificationUrl}

This verification link will expire in 24 hours.
If you didn't create an account, please ignore this email.
  `;

  return sendEmail({
    to: email,
    from: 'noreply@japaneselearning.com', // You may need to verify this domain with SendGrid
    subject: 'Verify Your Email - Japanese Learning Platform',
    text,
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="background: linear-gradient(135deg, #ff6b9d, #c44569); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">日本語学習 - Japanese Learning</h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Reset Your Password</h2>
        
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #ff6b9d, #c44569); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #ff6b9d;">${resetUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #888; font-size: 12px; text-align: center;">
          This reset link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
  `;

  const text = `
Password Reset - Japanese Learning

You requested to reset your password. Visit this link to set a new password: ${resetUrl}

This reset link will expire in 1 hour.
If you didn't request this, please ignore this email.
  `;

  return sendEmail({
    to: email,
    from: 'noreply@japaneselearning.com',
    subject: 'Reset Your Password - Japanese Learning Platform',
    text,
    html,
  });
}