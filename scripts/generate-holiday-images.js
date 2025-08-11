#!/usr/bin/env node

/**
 * Holiday Image Generator Script
 * 
 * This script generates holiday-themed sale images using Replicate API,
 * uploads them to Cloudflare R2, and updates the holiday page template.
 * 
 * Usage:
 *   node scripts/generate-holiday-images.js [holiday-name]
 *   node scripts/generate-holiday-images.js --all
 * 
 * Environment Variables Required:
 *   REPLICATE_API_TOKEN - Replicate API token
 *   R2_ACCOUNT_ID - Cloudflare R2 account ID
 *   R2_ACCESS_KEY_ID - Cloudflare R2 access key
 *   R2_SECRET_ACCESS_KEY - Cloudflare R2 secret key
 *   R2_BUCKET_NAME - Cloudflare R2 bucket name
 *   R2_ENDPOINT - Public URL for R2 bucket (e.g., pub-xxxxx.r2.dev)
 */

const Replicate = require('replicate');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Initialize Cloudflare R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Holiday slug mapping (from the page.tsx file)
const holidaySlugMap = {
  // 季节促销
  'summer-sale': 'Summer Sale',
  'winter-sale': 'Winter Sale', 
  'spring-sale': 'Spring Sale',
  'fall-sale': 'Fall Sale',
  'autumn-sale': 'Autumn Sale',
  
  // 主要购物节
  'black-friday': 'Black Friday',
  'cyber-monday': 'Cyber Monday',
  'prime-day': 'Prime Day',
  'boxing-day': 'Boxing Day',
  
  // 联邦节日
  'new-years-day': "New Year's Day",
  'martin-luther-king-jr-day': 'Martin Luther King Jr. Day',
  'presidents-day': "Presidents' Day", 
  'memorial-day': 'Memorial Day',
  'independence-day': 'Independence Day',
  'labor-day': 'Labor Day',
  'columbus-day': 'Columbus Day',
  'veterans-day': 'Veterans Day',
  'thanksgiving-day': 'Thanksgiving Day',
  'christmas-day': 'Christmas Day',
  
  // 文化节日
  'valentines-day': "Valentine's Day",
  'st-patricks-day': "St. Patrick's Day", 
  'easter-sunday': 'Easter Sunday',
  'mothers-day': "Mother's Day",
  'fathers-day': "Father's Day",
  'halloween': 'Halloween',
  
  // 特殊活动
  'back-to-school': 'Back to School',
  'end-of-year': 'End of Year',
  'womens-equality-day': "Women's Equality Day",
  'earth-day': 'Earth Day',
  'april-fools-day': "April Fool's Day",
  'groundhog-day': 'Groundhog Day',
  'mardi-gras': 'Mardi Gras',
  'cinco-de-mayo': 'Cinco de Mayo',
  'flag-day': 'Flag Day',
  'national-donut-day': 'National Donut Day',
  'world-health-day': 'World Health Day',
  'international-womens-day': "International Women's Day",
  
  // 宗教节日
  'good-friday': 'Good Friday',
  'palm-sunday': 'Palm Sunday',
  'ash-wednesday': 'Ash Wednesday',
  'passover': 'Passover',
  'rosh-hashanah': 'Rosh Hashanah',
  'yom-kippur': 'Yom Kippur',
  'hanukkah': 'Hanukkah',
  'kwanzaa': 'Kwanzaa',
  
  // 月度促销
  'january-sale': 'January Sale',
  'february-sale': 'February Sale',
  'march-sale': 'March Sale',
  'april-sale': 'April Sale', 
  'may-sale': 'May Sale',
  'june-sale': 'June Sale',
  'july-sale': 'July Sale',
  'august-sale': 'August Sale',
  'september-sale': 'September Sale',
  'october-sale': 'October Sale',
  'november-sale': 'November Sale',
  'december-sale': 'December Sale'
};

/**
 * Generate AI image using Replicate
 * @param {string} holidayName - The holiday name
 * @returns {Promise<string>} - URL of generated image
 */
async function generateHolidayImage(holidayName) {
  console.log(`Generating image for ${holidayName}...`);
  
  const prompt = `A vibrant, festive ${holidayName} sale banner image. Modern e-commerce style with shopping elements, discount symbols, and holiday-themed decorations. Professional marketing design with bold typography space for "${holidayName} Sale" text. High quality, commercial use, ratio 19:5, bright colors, celebratory atmosphere.`;
  
  try {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          go_fast: true,
          width: 1520,
          height: 400,
          num_outputs: 1,
          output_format: "webp",
          output_quality: 90
        }
      }
    );
    
    // Return the first generated image URL
    return Array.isArray(output) ? output[0] : output;
  } catch (error) {
    console.error(`Error generating image for ${holidayName}:`, error);
    throw error;
  }
}

/**
 * Download image from URL
 * @param {string} imageUrl - URL of the image to download
 * @returns {Promise<Buffer>} - Image buffer
 */
async function downloadImage(imageUrl) {
  console.log(`Downloading image from ${imageUrl}...`);
  
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Upload image to Cloudflare R2
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} fileName - File name for the image
 * @returns {Promise<string>} - Public URL of uploaded image
 */
async function uploadToR2(imageBuffer, fileName) {
  console.log(`Uploading ${fileName} to R2...`);
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `holiday-images/${fileName}`,
    Body: imageBuffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000', // 1 year cache
  });
  
  try {
    await r2Client.send(command);
    
    // Construct public URL using R2.dev format
    // If R2_ENDPOINT is provided, use it directly, otherwise construct from bucket name
    let baseUrl;
    if (process.env.R2_ENDPOINT) {
      baseUrl = `https://${process.env.R2_ENDPOINT}`;
    } else {
      // Fallback: try to construct from bucket name (this might not always work)
      baseUrl = `https://${process.env.R2_BUCKET_NAME}.r2.dev`;
    }
    
    const publicUrl = `${baseUrl}/holiday-images/${fileName}`;
    console.log(`Image uploaded successfully: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading to R2:`, error);
    throw error;
  }
}

/**
 * Update holiday page with image URL
 * @param {string} holidaySlug - Holiday slug
 * @param {string} imageUrl - Image URL to insert
 */
async function updateHolidayPage(holidaySlug, imageUrl) {
  console.log(`Updating holiday page for ${holidaySlug}...`);
  
  const pagePath = '/Users/wuwei/Documents/nodejs/couponmia.com/src/app/holidays/[holiday-slug]/page.tsx';
  
  try {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Find the holidayImages mapping
    const mappingStart = content.indexOf('const holidayImages: { [key: string]: string } = {');
    const mappingEnd = content.indexOf('};', mappingStart);
    
    if (mappingStart === -1 || mappingEnd === -1) {
      throw new Error('Could not find holidayImages mapping in page.tsx');
    }
    
    // Extract the current mapping content
    const beforeMapping = content.substring(0, mappingStart);
    const afterMapping = content.substring(mappingEnd);
    const currentMapping = content.substring(mappingStart, mappingEnd);
    
    // Check if this holiday slug already exists in the mapping
    const entryRegex = new RegExp(`\\s*'${holidaySlug}':\\s*'[^']*',?`);
    const newEntry = `  '${holidaySlug}': '${imageUrl}',`;
    
    let updatedMapping;
    if (entryRegex.test(currentMapping)) {
      // Replace existing entry
      updatedMapping = currentMapping.replace(entryRegex, `  '${holidaySlug}': '${imageUrl}',`);
    } else {
      // Add new entry before the closing brace
      const insertPoint = currentMapping.lastIndexOf('\n') || currentMapping.length;
      const beforeInsert = currentMapping.substring(0, insertPoint);
      const afterInsert = currentMapping.substring(insertPoint);
      updatedMapping = beforeInsert + '\n' + newEntry + afterInsert;
    }
    
    // Reconstruct the file
    const updatedContent = beforeMapping + updatedMapping + afterMapping;
    
    fs.writeFileSync(pagePath, updatedContent);
    console.log(`✅ Updated holidayImages mapping for ${holidaySlug}`);
    
  } catch (error) {
    console.error(`❌ Error updating holiday page:`, error);
    throw error;
  }
}

/**
 * Process a single holiday
 * @param {string} holidaySlug - Holiday slug to process
 */
async function processHoliday(holidaySlug) {
  const holidayName = holidaySlugMap[holidaySlug];
  
  if (!holidayName) {
    console.error(`Unknown holiday slug: ${holidaySlug}`);
    return;
  }
  
  console.log(`\n=== Processing ${holidayName} (${holidaySlug}) ===`);
  
  try {
    // Generate image
    const imageUrl = await generateHolidayImage(holidayName);
    
    // Download image
    const imageBuffer = await downloadImage(imageUrl);
    
    // Create filename
    const fileName = `${holidaySlug}-sale-banner.webp`;
    
    // Upload to R2
    const publicUrl = await uploadToR2(imageBuffer, fileName);
    
    // Update holiday page
    await updateHolidayPage(holidaySlug, publicUrl);
    
    console.log(`✅ Successfully processed ${holidayName}`);
    console.log(`Image URL: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error(`❌ Failed to process ${holidayName}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Validate environment variables
  const requiredEnvVars = [
    'REPLICATE_API_TOKEN',
    'R2_ACCOUNT_ID', 
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }
  
  // Warn if R2_ENDPOINT is not provided
  if (!process.env.R2_ENDPOINT) {
    console.warn('⚠️  R2_ENDPOINT not provided. Will attempt to construct from bucket name.');
    console.warn('   For best results, set R2_ENDPOINT to your R2 public domain (e.g., pub-xxxxx.r2.dev)');
  }
  
  if (args.length === 0) {
    console.error('Usage: node scripts/generate-holiday-images.js [holiday-slug] | --all');
    console.error('\nAvailable holiday slugs:');
    Object.keys(holidaySlugMap).forEach(slug => {
      console.error(`  ${slug} -> ${holidaySlugMap[slug]}`);
    });
    process.exit(1);
  }
  
  try {
    if (args[0] === '--all') {
      console.log('Generating images for all holidays...');
      
      const results = [];
      for (const holidaySlug of Object.keys(holidaySlugMap)) {
        try {
          const imageUrl = await processHoliday(holidaySlug);
          results.push({ holidaySlug, imageUrl, success: true });
          
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          results.push({ holidaySlug, error: error.message, success: false });
        }
      }
      
      // Print summary
      console.log('\n=== SUMMARY ===');
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      console.log(`✅ Successful: ${successful.length}`);
      console.log(`❌ Failed: ${failed.length}`);
      
      if (failed.length > 0) {
        console.log('\nFailed holidays:');
        failed.forEach(result => {
          console.log(`  ${result.holidaySlug}: ${result.error}`);
        });
      }
      
    } else {
      const holidaySlug = args[0];
      await processHoliday(holidaySlug);
    }
    
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateHolidayImage,
  uploadToR2,
  updateHolidayPage,
  processHoliday
};