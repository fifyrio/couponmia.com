#!/usr/bin/env node

require('dotenv').config();

async function testWelcomeEmail() {
  console.log('Testing Welcome Email System');
  console.log('='.repeat(40));
  
  // Check environment variables
  const requiredEnvVars = [
    'RESEND_API_KEY',
    'FROM_EMAIL',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  console.log('Environment Variables:');
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    console.log(`  ${envVar}: ${value ? '✓ Set' : '❌ Missing'}`);
  }
  
  if (!process.env.RESEND_API_KEY) {
    console.log('\n❌ RESEND_API_KEY is required for testing');
    console.log('Please add it to your .env file');
    console.log('Get your API key from: https://resend.com/api-keys');
    return;
  }
  
  console.log('\nTesting email API...');
  
  const testData = {
    userEmail: process.env.TEST_EMAIL || 'test@example.com',
    userName: 'Test User',
    referralCode: 'TESTUSER1234'
  };
  
  try {
    // Try common development ports
    const devPorts = ['3000', '3001', '3002', '3003'];
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    if (!siteUrl || siteUrl.includes('couponmia.com')) {
      // Development mode - try to find the right port
      siteUrl = 'http://localhost:3000'; // Default
      for (const port of devPorts) {
        try {
          const testUrl = `http://localhost:${port}`;
          const testResponse = await fetch(`${testUrl}/api/health`, { method: 'GET' });
          if (testResponse.ok || testResponse.status === 404) {
            siteUrl = testUrl;
            break;
          }
        } catch {
          // Port not available, try next
        }
      }
    }
    
    console.log(`Testing against: ${siteUrl}`);
    const response = await fetch(`${siteUrl}/api/email/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✓ Email API test successful');
      console.log(`  Message ID: ${result.messageId}`);
      console.log(`  Test email sent to: ${testData.userEmail}`);
    } else {
      const error = await response.text();
      console.log('❌ Email API test failed');
      console.log(`  Status: ${response.status}`);
      console.log(`  Error: ${error}`);
    }
  } catch (error) {
    console.log('❌ Email API test failed');
    console.log(`  Error: ${error.message}`);
    console.log('\nMake sure your development server is running:');
    console.log('  npm run dev');
  }
}

// Test direct email service
async function testDirectEmail() {
  console.log('\nTesting Direct Email Service...');
  
  try {
    // Import the email service
    const { emailService } = await import('../src/lib/email.ts');
    
    const result = await emailService.sendWelcomeEmail({
      userEmail: process.env.TEST_EMAIL || 'test@example.com',
      userName: 'Direct Test User',
      referralCode: 'DIRECTTEST1234'
    });
    
    if (result.success) {
      console.log('✓ Direct email service test successful');
      console.log(`  Message ID: ${result.messageId}`);
    } else {
      console.log('❌ Direct email service test failed');
      console.log(`  Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ Direct email service test failed');
    console.log(`  Error: ${error.message}`);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'api';
  
  if (mode === 'api') {
    await testWelcomeEmail();
  } else if (mode === 'direct') {
    await testDirectEmail();
  } else if (mode === 'both') {
    await testWelcomeEmail();
    await testDirectEmail();
  } else {
    console.log('Usage:');
    console.log('  node scripts/test-email.js api     # Test via API route');
    console.log('  node scripts/test-email.js direct  # Test direct service');
    console.log('  node scripts/test-email.js both    # Test both methods');
    console.log('');
    console.log('Environment variables:');
    console.log('  TEST_EMAIL=your-email@example.com  # Override test email');
  }
}

if (require.main === module) {
  main().catch(console.error);
}