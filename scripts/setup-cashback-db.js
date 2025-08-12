#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('Cashback Database Setup Instructions');
console.log('='.repeat(60));
console.log();

console.log('To set up the cashback system database functions:');
console.log();
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the contents of database/cashback-functions.sql');
console.log('4. Run the SQL script');
console.log();

// Check if the SQL file exists
const sqlFilePath = path.join(__dirname, '..', 'database', 'cashback-functions.sql');
if (fs.existsSync(sqlFilePath)) {
  console.log('✓ Found database/cashback-functions.sql');
  console.log();
  console.log('SQL file contents:');
  console.log('-'.repeat(40));
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(sqlContent);
  console.log('-'.repeat(40));
} else {
  console.log('❌ database/cashback-functions.sql not found');
  console.log('Please ensure the SQL file exists');
}

console.log();
console.log('After running the SQL script in Supabase, you can run:');
console.log('node scripts/sync-cashback-rates.js all');
console.log();