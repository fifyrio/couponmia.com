#!/usr/bin/env node

/**
 * Category Image Generator Script
 * 
 * This script generates category-themed images using Replicate API,
 * uploads them to Cloudflare R2, and updates the categories table in database.
 * 
 * Usage:
 *   node scripts/generate-category-images.js [category-slug]
 *   node scripts/generate-category-images.js --all
 * 
 * Environment Variables Required:
 *   REPLICATE_API_TOKEN - Replicate API token
 *   R2_ACCOUNT_ID - Cloudflare R2 account ID
 *   R2_ACCESS_KEY_ID - Cloudflare R2 access key
 *   R2_SECRET_ACCESS_KEY - Cloudflare R2 secret key
 *   R2_BUCKET_NAME - Cloudflare R2 bucket name
 *   R2_ENDPOINT - Public URL for R2 bucket (e.g., pub-xxxxx.r2.dev)
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
 */

const Replicate = require('replicate');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Category image styles mapping
const categoryPromptStyles = {
  'ai-software': 'modern AI artificial intelligence technology with neural networks, machine learning algorithms, futuristic digital interface',
  'electronics-tech': 'electronic devices, smartphones, laptops, gadgets, technology products with circuit patterns',
  'fashion-apparel': 'stylish fashion clothing, trendy apparel, designer outfits, fashion runway aesthetic',
  'food-dining': 'delicious food, restaurant dining, culinary delights, gourmet meals, food photography style',
  'health-fitness': 'fitness equipment, wellness products, healthy lifestyle, sports and exercise gear',
  'home-garden': 'beautiful home interior, garden plants, home improvement, furniture and decor',
  'travel-leisure': 'travel destinations, vacation scenes, leisure activities, tourism and adventure',
  'beauty-personal-care': 'beauty products, skincare, cosmetics, personal care items, spa aesthetic',
  'books-education': 'books, educational materials, learning resources, academic supplies, library setting',
  'automotive': 'cars, automotive parts, vehicle maintenance, driving and transportation',
  'pets-animals': 'cute pets, animal care products, pet accessories, veterinary supplies',
  'sports-outdoors': 'outdoor sports, recreational activities, camping gear, athletic equipment',
  'business-services': 'professional business environment, office supplies, corporate services, productivity tools',
  'entertainment': 'entertainment products, gaming, movies, music, recreational activities',
  'jewelry-accessories': 'luxury jewelry, fashion accessories, watches, elegant design aesthetic'
};

/**
 * Get all categories from database
 * @returns {Promise<Array>} - Array of category objects
 */
async function getCategories() {
  console.log('Fetching categories from database...');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    console.log(`Found ${data?.length || 0} categories`);
    return data || [];
  } catch (error) {
    console.error('Exception in getCategories:', error);
    return [];
  }
}

/**
 * Generate AI image for a category using Replicate
 * @param {Object} category - The category object
 * @returns {Promise<string>} - URL of generated image
 */
async function generateCategoryImage(category) {
  console.log(`Generating image for ${category.name} (${category.slug})...`);
  
  // Get specific prompt style or use generic one
  const styleDescription = categoryPromptStyles[category.slug] || 
    `${category.name.toLowerCase()} related products, modern commercial style`;
  
  const prompt = `A professional, modern banner image representing ${category.name} category. ${styleDescription}. Clean commercial design, vibrant colors, high quality e-commerce style banner. No text overlay needed. Professional photography style, ratio 16:9, bright and appealing for online shopping.`;
  
  try {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          go_fast: true,
          width: 1280,
          height: 720,
          num_outputs: 1,
          output_format: "webp",
          output_quality: 90
        }
      }
    );
    
    // Return the first generated image URL
    return Array.isArray(output) ? output[0] : output;
  } catch (error) {
    console.error(`Error generating image for ${category.name}:`, error);
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
    Key: `category-images/${fileName}`,
    Body: imageBuffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000', // 1 year cache
  });
  
  try {
    await r2Client.send(command);
    
    // Construct public URL using R2.dev format
    let baseUrl;
    if (process.env.R2_ENDPOINT) {
      // Check if R2_ENDPOINT already includes protocol
      baseUrl = process.env.R2_ENDPOINT.startsWith('http') 
        ? process.env.R2_ENDPOINT 
        : `https://${process.env.R2_ENDPOINT}`;
    } else {
      // Fallback: try to construct from bucket name
      baseUrl = `https://${process.env.R2_BUCKET_NAME}.r2.dev`;
    }
    
    const publicUrl = `${baseUrl}/category-images/${fileName}`;
    console.log(`Image uploaded successfully: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading to R2:`, error);
    throw error;
  }
}

/**
 * Update category image URL in database
 * @param {string} categoryId - Category ID
 * @param {string} imageUrl - Image URL to update
 */
async function updateCategoryImage(categoryId, imageUrl) {
  console.log(`Updating category ${categoryId} with image URL...`);
  
  try {
    const { error } = await supabase
      .from('categories')
      .update({ image: imageUrl })
      .eq('id', categoryId);

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    
    console.log(`✅ Updated category ${categoryId} with image URL`);
  } catch (error) {
    console.error(`❌ Error updating category:`, error);
    throw error;
  }
}

/**
 * Process a single category
 * @param {Object} category - Category object to process
 */
async function processCategory(category) {
  console.log(`\n=== Processing ${category.name} (${category.slug}) ===`);
  
  try {
    // Skip if image already exists (unless forced)
    if (category.image && !process.argv.includes('--force')) {
      console.log(`✓ Category ${category.name} already has an image: ${category.image}`);
      return category.image;
    }
    
    // Generate image
    const imageUrl = await generateCategoryImage(category);
    
    // Download image
    const imageBuffer = await downloadImage(imageUrl);
    
    // Create filename
    const fileName = `${category.slug}-category-banner.webp`;
    
    // Upload to R2
    const publicUrl = await uploadToR2(imageBuffer, fileName);
    
    // Update category in database
    await updateCategoryImage(category.id, publicUrl);
    
    console.log(`✅ Successfully processed ${category.name}`);
    console.log(`Image URL: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error(`❌ Failed to process ${category.name}:`, error);
    throw error;
  }
}

/**
 * Find category by slug
 * @param {Array} categories - Array of categories
 * @param {string} slug - Category slug to find
 * @returns {Object|null} - Category object or null if not found
 */
function findCategoryBySlug(categories, slug) {
  return categories.find(cat => cat.slug === slug) || null;
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
    'R2_BUCKET_NAME',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
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
  
  // Get all categories from database
  const categories = await getCategories();
  
  if (categories.length === 0) {
    console.error('No categories found in database');
    process.exit(1);
  }
  
  if (args.length === 0) {
    console.error('Usage: node scripts/generate-category-images.js [category-slug] | --all | --force');
    console.error('\nAvailable categories:');
    categories.forEach(cat => {
      const hasImage = cat.image ? '✅' : '❌';
      console.error(`  ${hasImage} ${cat.slug} -> ${cat.name}`);
    });
    console.error('\nOptions:');
    console.error('  --all    Generate images for all categories');
    console.error('  --force  Force regenerate even if image exists');
    process.exit(1);
  }
  
  try {
    if (args.includes('--all')) {
      console.log('Generating images for all categories...');
      
      const results = [];
      for (const category of categories) {
        try {
          const imageUrl = await processCategory(category);
          results.push({ categorySlug: category.slug, categoryName: category.name, imageUrl, success: true });
          
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          results.push({ categorySlug: category.slug, categoryName: category.name, error: error.message, success: false });
        }
      }
      
      // Print summary
      console.log('\n=== SUMMARY ===');
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      console.log(`✅ Successful: ${successful.length}`);
      console.log(`❌ Failed: ${failed.length}`);
      
      if (successful.length > 0) {
        console.log('\nSuccessful categories:');
        successful.forEach(result => {
          console.log(`  ✅ ${result.categoryName} (${result.categorySlug}): ${result.imageUrl}`);
        });
      }
      
      if (failed.length > 0) {
        console.log('\nFailed categories:');
        failed.forEach(result => {
          console.log(`  ❌ ${result.categoryName} (${result.categorySlug}): ${result.error}`);
        });
      }
      
    } else {
      // Process single category
      const categorySlug = args.find(arg => !arg.startsWith('--'));
      if (!categorySlug) {
        console.error('Please specify a category slug');
        process.exit(1);
      }
      
      const category = findCategoryBySlug(categories, categorySlug);
      if (!category) {
        console.error(`Category not found: ${categorySlug}`);
        console.error('Available categories:', categories.map(c => c.slug).join(', '));
        process.exit(1);
      }
      
      await processCategory(category);
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
  generateCategoryImage,
  uploadToR2,
  updateCategoryImage,
  processCategory,
  getCategories
};