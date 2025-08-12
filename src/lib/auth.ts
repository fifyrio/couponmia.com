import { createClient } from '@supabase/supabase-js'

// Supabase client for authentication
export const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Generate referral code for new users
export function generateReferralCode(email: string): string {
  const username = email.split('@')[0].slice(0, 8)
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${username.toUpperCase()}${randomSuffix}`
}

// Handle user profile creation after Google sign in
export async function handleGoogleSignIn(user: { 
  id: string; 
  email: string; 
  user_metadata?: { full_name?: string } 
}) {
  try {
    // Check if user exists in our custom users table
    const { data: existingUser, error } = await supabaseAuth
      .from('users')
      .select('id, name, referral_code')
      .eq('email', user.email)
      .single()

    if (!existingUser && error?.code === 'PGRST116') {
      // New user - create profile and send welcome email
      const userName = user.user_metadata?.full_name || user.email.split('@')[0];
      const referralCode = generateReferralCode(user.email);
      
      const { error: insertError } = await supabaseAuth
        .from('users')
        .insert({
          id: user.id, // Use Supabase Auth user ID
          email: user.email,
          name: userName,
          is_verified: true,
          referral_code: referralCode,
        })

      if (insertError) {
        console.error('Error creating user profile:', insertError)
        return;
      }

      // Send welcome email for new users
      await sendWelcomeEmail({
        userEmail: user.email,
        userName,
        referralCode,
      });
      
      console.log(`New user created: ${user.email} with referral code: ${referralCode}`);
    }
  } catch (error) {
    console.error('Error in handleGoogleSignIn:', error)
  }
}

// Send welcome email to new users
async function sendWelcomeEmail(data: {
  userEmail: string;
  userName: string;
  referralCode: string;
}) {
  try {
    // Only send welcome email in production or if explicitly enabled
    const shouldSendEmail = process.env.NODE_ENV === 'production' || 
                           process.env.SEND_WELCOME_EMAILS === 'true';
    
    if (!shouldSendEmail) {
      console.log(`Welcome email skipped for ${data.userEmail} (not in production)`);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`Welcome email sent to ${data.userEmail}: ${result.messageId}`);
    } else {
      const error = await response.text();
      console.error(`Failed to send welcome email to ${data.userEmail}:`, error);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}