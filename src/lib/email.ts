/**
 * Email service using Resend SDK
 * Lightweight and developer-friendly email service
 */

import { Resend } from 'resend';

interface WelcomeEmailData {
  userEmail: string;
  userName: string;
  referralCode: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResponse> {
    if (!this.resend) {
      console.warn('RESEND_API_KEY not configured, skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const emailContent = this.generateWelcomeEmailHTML(data);

      const { data: result, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [data.userEmail],
        subject: '🎉 Welcome to CouponMia - Start Saving Today!',
        html: emailContent,
      });

      if (error) {
        console.error('Email send failed:', error);
        return { success: false, error: error.message || 'Unknown error' };
      }

      console.log('Welcome email sent successfully:', result?.id);
      
      return { 
        success: true, 
        messageId: result?.id 
      };

    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://couponmia.com';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CouponMia</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0a0a0a;
      color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a0a2e 0%, #8b5cf6 100%);
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      text-align: center;
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #fbbf24;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #fff;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
      color: #e5e7eb;
    }
    .benefits {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 24px;
      margin: 30px 0;
    }
    .benefit-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .benefit-icon {
      width: 24px;
      height: 24px;
      margin-right: 12px;
      font-size: 20px;
    }
    .referral-box {
      background: rgba(251, 191, 36, 0.2);
      border: 2px dashed #fbbf24;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .referral-code {
      font-size: 24px;
      font-weight: bold;
      font-family: monospace;
      color: #fbbf24;
      margin: 10px 0;
      letter-spacing: 2px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6, #a78bfa);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: scale(1.05);
    }
    .footer {
      background: rgba(0, 0, 0, 0.3);
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #9ca3af;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #8b5cf6;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎫 CouponMia</div>
      <p style="margin: 0; color: #e5e7eb;">Your Gateway to Amazing Savings</p>
    </div>
    
    <div class="content">
      <div class="greeting">Welcome, ${data.userName}! 🎉</div>
      
      <div class="message">
        Thank you for joining CouponMia! You're now part of a community that saves money while shopping at their favorite stores. We're excited to help you discover amazing deals and earn cashback on every purchase.
      </div>
      
      <div class="benefits">
        <h3 style="margin-top: 0; color: #fff;">What you can do now:</h3>
        
        <div class="benefit-item">
          <span class="benefit-icon">💰</span>
          <span>Earn up to 10% cashback on purchases</span>
        </div>
        
        <div class="benefit-item">
          <span class="benefit-icon">🎁</span>
          <span>Get $5 welcome bonus on your first purchase</span>
        </div>
        
        <div class="benefit-item">
          <span class="benefit-icon">🏪</span>
          <span>Shop at 1,000+ partner stores</span>
        </div>
        
        <div class="benefit-item">
          <span class="benefit-icon">🚀</span>
          <span>Automatic tracking - no codes needed</span>
        </div>
      </div>
      
      <div class="referral-box">
        <h3 style="margin-top: 0; color: #fbbf24;">Your Personal Referral Code</h3>
        <div class="referral-code">${data.referralCode}</div>
        <p style="margin-bottom: 0; font-size: 14px; color: #e5e7eb;">
          Share this code with friends and earn rewards when they join!
        </p>
      </div>
      
      <div style="text-align: center;">
        <a href="${siteUrl}?ref=${data.referralCode}" class="cta-button">
          🛍️ Start Shopping & Earning
        </a>
      </div>
      
      <div class="message">
        <strong>Quick Start Tips:</strong><br>
        1. Browse our featured coupons on the homepage<br>
        2. Click through our links before making purchases<br>
        3. Watch your cashback grow in your dashboard<br>
        4. Share your referral code to earn even more
      </div>
    </div>
    
    <div class="footer">
      <p>Happy shopping and saving!</p>
      <p style="margin: 5px 0;"><strong>The CouponMia Team</strong></p>
      
      <div class="social-links">
        <a href="${siteUrl}">Visit Website</a> | 
        <a href="${siteUrl}/dashboard">Your Dashboard</a> | 
        <a href="${siteUrl}/stores">Browse Stores</a>
      </div>
      
      <p style="font-size: 12px; margin-top: 20px;">
        This email was sent to ${data.userEmail}. You received this because you signed up for CouponMia.
        <br>If you didn't sign up, please ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
  }
}

// Export singleton instance
export const emailService = new EmailService();