# Email Service Setup Guide

This guide explains how to set up the welcome email system for new users.

## Option 1: Resend (Recommended - Lightweight & Free)

### 1. Sign up for Resend
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Get your API key from the dashboard

### 2. Add Environment Variables
Add these to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Email Configuration
SEND_WELCOME_EMAILS=true  # Set to true to enable in development
```

### 3. Domain Setup (Optional)
- For production, verify your domain in Resend dashboard
- For development, you can use the default Resend domain

## Option 2: Gmail SMTP (Alternative)

If you prefer Gmail SMTP, here's the alternative implementation:

```typescript
// Alternative Gmail SMTP implementation
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
  },
});
```

Add to `.env.local`:
```bash
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

## How It Works

### 1. Trigger
Welcome emails are automatically sent when:
- A new user signs up with Google OAuth
- User profile is successfully created in the database

### 2. Email Content
The welcome email includes:
- Personalized greeting with user's name
- Benefits overview (cashback, welcome bonus, etc.)
- User's referral code
- Call-to-action buttons
- Quick start tips

### 3. Environment Controls
```bash
# Development: Only sends if explicitly enabled
SEND_WELCOME_EMAILS=true

# Production: Always sends welcome emails
NODE_ENV=production
```

## Testing

### 1. Test Email API Directly
```bash
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "test@example.com",
    "userName": "Test User",
    "referralCode": "TESTUSER1234"
  }'
```

### 2. Test with User Registration
1. Enable welcome emails: `SEND_WELCOME_EMAILS=true`
2. Sign up with a new Google account
3. Check console logs for email sending status

## Email Template Features

### Responsive Design
- Mobile-friendly HTML email template
- Dark theme matching CouponMia branding
- Professional gradient design

### Content Sections
- **Header**: Logo and tagline
- **Greeting**: Personalized welcome message
- **Benefits**: Key features and advantages
- **Referral Code**: Prominent display with sharing encouragement
- **Call-to-Action**: Direct link to start shopping
- **Quick Tips**: Getting started guide
- **Footer**: Links and unsubscribe info

### Branding
- Purple gradient theme matching website
- CouponMia logo and colors
- Professional typography
- Consistent with site design

## Security & Best Practices

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables only
- Rotate keys regularly

### 2. Rate Limiting
- Resend provides built-in rate limiting
- Free tier: 100 emails/day, 3,000/month
- Paid plans available for higher volume

### 3. Error Handling
- Graceful fallback if email service fails
- Detailed logging for debugging
- User registration continues even if email fails

### 4. Spam Prevention
- Only sends to verified email addresses
- Includes unsubscribe information
- Professional content and design

## Monitoring

### 1. Logs
Check application logs for:
```
New user created: user@example.com with referral code: TESTUSER1234
Welcome email sent to user@example.com: msg_xxxxxxxxxxxxxxxx
```

### 2. Resend Dashboard
- Email delivery status
- Open rates and engagement
- Bounce and complaint rates

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify key is correct in Resend dashboard
   - Check environment variable is loaded

2. **Emails Not Sending**
   - Check `SEND_WELCOME_EMAILS=true` in development
   - Verify `NEXT_PUBLIC_SITE_URL` is set correctly

3. **Domain Verification**
   - For production, verify domain in Resend
   - Use default domain for testing

4. **Rate Limits**
   - Check Resend dashboard for quota usage
   - Upgrade plan if needed

## Cost Analysis

### Resend Pricing
- **Free**: 3,000 emails/month, 100/day
- **Pro**: $20/month for 50,000 emails
- **Business**: $85/month for 100,000 emails

### Gmail SMTP
- **Free**: 500 emails/day limit
- **Google Workspace**: Higher limits available

For most applications, Resend free tier is sufficient for welcome emails.