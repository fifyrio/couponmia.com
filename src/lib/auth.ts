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
      .select('id')
      .eq('email', user.email)
      .single()

    if (!existingUser && error?.code === 'PGRST116') {
      // Create user in our custom users table
      const { error: insertError } = await supabaseAuth
        .from('users')
        .insert({
          id: user.id, // Use Supabase Auth user ID
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          is_verified: true,
          referral_code: generateReferralCode(user.email),
        })

      if (insertError) {
        console.error('Error creating user profile:', insertError)
      }
    }
  } catch (error) {
    console.error('Error in handleGoogleSignIn:', error)
  }
}