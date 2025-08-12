import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, referralCode } = await request.json();

    // Validate required fields
    if (!userEmail || !userName || !referralCode) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, userName, referralCode' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send welcome email
    const result = await emailService.sendWelcomeEmail({
      userEmail,
      userName,
      referralCode,
    });

    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Welcome email sent successfully',
          messageId: result.messageId 
        },
        { status: 200 }
      );
    } else {
      console.error('Failed to send welcome email:', result.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: result.error 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Welcome email API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}