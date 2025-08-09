const fs = require('fs');
const path = require('path');
const { writeFile } = require("fs/promises");
const fetch = require('node-fetch');
const Replicate = require('replicate');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize clients
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Extract blog content and metadata for analysis
 * @param {string} filePath - Path to blog page.tsx file
 * @returns {Object} - Blog content and metadata
 */
function extractBlogContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const folderName = path.basename(path.dirname(filePath));
    
    // Extract title from metadata
    const titleMatch = content.match(/title:\s*['"](.*?)['"]/s);
    const title = titleMatch ? titleMatch[1] : null;
    
    // Extract description from metadata
    const descMatch = content.match(/description:\s*['"](.*?)['"]/s);
    const description = descMatch ? descMatch[1] : null;
    
    // Extract keywords from metadata
    const keywordsMatch = content.match(/keywords:\s*['"](.*?)['"]/s);
    const keywords = keywordsMatch ? keywordsMatch[1] : null;
    
    // Extract content from articleData.content
    const contentMatch = content.match(/content:\s*`([^`]+)`/s);
    const articleContent = contentMatch ? contentMatch[1].substring(0, 2000) : ''; // First 2000 chars
    
    return {
      slug: folderName,
      title,
      description,
      keywords,
      content: articleContent,
    };
  } catch (error) {
    console.error(`Error extracting content from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Generate image prompt using AI analysis
 * @param {Object} blogData - Blog content and metadata
 * @returns {Promise<string>} - Generated image prompt
 */
async function generateImagePrompt(blogData) {
  try {
    console.log(`🤖 Analyzing blog content for: ${blogData.title}`);
    
    const systemPrompt = `You are an expert graphic designer specializing in blog featured images. 
    
Your task is to create compelling image generation prompts that will produce professional, eye-catching blog featured images.

Key requirements:
- Images should be 1200x630 pixels (social media optimized)
- Use modern, professional design aesthetics
- Focus on the blog's core topic and value proposition
- Include relevant visual metaphors and symbols
- Use purple (#8B5CF6) and pink (#C084FC) as primary colors with black background
- Avoid any brand names or specific company logos
- Make it visually striking and clickable
- Include relevant icons, symbols, and visual elements that represent the topic

Generate a detailed image prompt that will create an attractive featured image for this blog post.`;

    const userPrompt = `Blog Details:
Title: ${blogData.title}
Description: ${blogData.description}
Keywords: ${blogData.keywords}
Content Preview: ${blogData.content.substring(0, 800)}

Please generate a detailed image prompt that will create a professional, attractive featured image for this blog post. Focus on visual elements that represent the core topic and value proposition.`;

    const response = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const prompt = response.choices[0].message.content.trim();
    console.log(`✅ Generated prompt for ${blogData.slug}: ${prompt.substring(0, 100)}...`);
    return prompt;
    
  } catch (error) {
    console.error('Error generating image prompt:', error);
    // Fallback to a generic prompt
    return `Professional blog featured image for "${blogData.title}", modern design with purple and pink gradient background, relevant icons and symbols, 1200x630 pixels, high quality, clean typography`;
  }
}

/**
 * Generate image using Replicate FLUX model
 * @param {string} prompt - Image generation prompt
 * @param {string} slug - Blog slug for filename
 * @returns {Promise<string>} - Local file path of generated image
 */
async function generateImage(prompt, slug) {
  try {
    console.log(`🎨 Generating image for: ${slug}`);
    console.log(`Prompt: ${prompt}`);
    
    const input = {
      prompt: prompt,
      width: 1200,
      height: 630,
      num_outputs: 1,
      guidance_scale: 3.5,
      num_inference_steps: 4
    };

    const output = await replicate.run("black-forest-labs/flux-schnell", { input });
    
    if (!output || output.length === 0) {
      throw new Error('No output received from Replicate');
    }

    // Download the image
    const imageUrl = output[0];
    console.log(`📥 Downloading image from: ${imageUrl}`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const imageBuffer = await response.buffer();
    const localFilePath = path.join(process.cwd(), 'temp', `${slug}-cover.webp`);
    
    // Ensure temp directory exists
    await fs.promises.mkdir(path.join(process.cwd(), 'temp'), { recursive: true });
    
    // Write file to disk
    await writeFile(localFilePath, imageBuffer);
    console.log(`✅ Image saved locally: ${localFilePath}`);
    
    return localFilePath;
    
  } catch (error) {
    console.error(`Error generating image for ${slug}:`, error);
    throw error;
  }
}

/**
 * Upload image to Cloudflare R2
 * @param {string} filePath - Local file path
 * @param {string} slug - Blog slug for R2 key
 * @returns {Promise<string>} - R2 public URL
 */
async function uploadToR2(filePath, slug) {
  try {
    console.log(`☁️  Uploading to R2: ${slug}-cover.webp`);
    
    const fileBuffer = await fs.promises.readFile(filePath);
    const key = `blog-covers/${slug}-cover.webp`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await r2Client.send(uploadCommand);
    
    const publicUrl = `${process.env.R2_ENDPOINT}/${key}`;
    console.log(`✅ Uploaded to R2: ${publicUrl}`);
    
    // Clean up local file
    await fs.promises.unlink(filePath);
    console.log(`🗑️  Cleaned up local file: ${filePath}`);
    
    return publicUrl;
    
  } catch (error) {
    console.error(`Error uploading to R2:`, error);
    throw error;
  }
}

/**
 * Update blog post with generated image URL
 * @param {string} slug - Blog slug
 * @param {string} imageUrl - R2 public URL
 * @returns {Promise<boolean>} - Success status
 */
async function updateBlogPostImage(slug, imageUrl) {
  try {
    console.log(`📝 Updating blog post ${slug} with image URL`);
    
    const { error } = await supabase
      .from('blog_posts')
      .update({ featured_image_url: imageUrl })
      .eq('slug', slug);
    
    if (error) {
      console.error(`Error updating blog post ${slug}:`, error);
      return false;
    }
    
    console.log(`✅ Updated blog post ${slug} with new image`);
    return true;
    
  } catch (error) {
    console.error(`Exception updating blog post ${slug}:`, error);
    return false;
  }
}

/**
 * Find all blog files
 * @param {string} blogDir - Blog directory path
 * @returns {Array} - Array of blog file paths
 */
function findBlogFiles(blogDir) {
  const blogFiles = [];
  
  try {
    const items = fs.readdirSync(blogDir);
    
    for (const item of items) {
      const itemPath = path.join(blogDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && item !== 'page.tsx') {
        const pagePath = path.join(itemPath, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          blogFiles.push(pagePath);
        }
      }
    }
  } catch (error) {
    console.error('Error reading blog directory:', error.message);
  }
  
  return blogFiles;
}

/**
 * Generate blog cover images
 * @param {Object} options - Generation options
 */
async function generateBlogCoverImages(options = {}) {
  const { specificSlug = null, forceRegenerate = false } = options;
  
  console.log('🚀 Starting blog cover image generation...');
  
  // Find blog directory
  const blogDir = path.join(process.cwd(), 'src', 'app', 'blog');
  
  if (!fs.existsSync(blogDir)) {
    console.error('❌ Blog directory not found:', blogDir);
    return;
  }
  
  // Find all blog files
  const blogFiles = findBlogFiles(blogDir);
  
  if (blogFiles.length === 0) {
    console.log('📝 No blog posts found');
    return;
  }
  
  console.log(`📋 Found ${blogFiles.length} blog post(s) to process`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process each blog file
  for (const filePath of blogFiles) {
    try {
      // Extract blog content
      const blogData = extractBlogContent(filePath);
      
      if (!blogData || !blogData.title) {
        console.warn(`⚠️  Skipping ${path.basename(path.dirname(filePath))}: Could not extract metadata`);
        errorCount++;
        continue;
      }
      
      // Filter by specific slug if provided
      if (specificSlug && blogData.slug !== specificSlug) {
        continue;
      }
      
      // Check if image already exists (unless force regenerate)
      if (!forceRegenerate) {
        const { data: existingPost } = await supabase
          .from('blog_posts')
          .select('featured_image_url')
          .eq('slug', blogData.slug)
          .single();
        
        if (existingPost && existingPost.featured_image_url && 
            existingPost.featured_image_url !== '/api/placeholder/1200/630') {
          console.log(`⏭️  Skipping ${blogData.slug}: Image already exists`);
          continue;
        }
      }
      
      console.log(`\n🔄 Processing: ${blogData.title}`);
      
      // Generate image prompt using AI
      const imagePrompt = await generateImagePrompt(blogData);
      
      // Generate image using Replicate
      const localImagePath = await generateImage(imagePrompt, blogData.slug);
      
      // Upload to R2
      const r2ImageUrl = await uploadToR2(localImagePath, blogData.slug);
      
      // Update blog post in database
      const updateSuccess = await updateBlogPostImage(blogData.slug, r2ImageUrl);
      
      if (updateSuccess) {
        successCount++;
        console.log(`✅ Successfully generated cover image for: ${blogData.slug}`);
      } else {
        errorCount++;
        console.log(`⚠️  Generated image but failed to update database for: ${blogData.slug}`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      errorCount++;
    }
  }
  
  // Summary
  console.log('\n📊 Generation Summary:');
  console.log(`✅ Successfully generated: ${successCount} cover image(s)`);
  console.log(`❌ Errors encountered: ${errorCount} blog post(s)`);
  console.log(`📝 Total processed: ${successCount + errorCount} blog post(s)`);
  
  if (errorCount === 0) {
    console.log('🎉 Blog cover image generation completed successfully!');
  } else {
    console.log('⚠️  Blog cover image generation completed with some errors');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  if (args.includes('--force')) {
    options.forceRegenerate = true;
  }
  
  const slugIndex = args.indexOf('--slug');
  if (slugIndex !== -1 && args[slugIndex + 1]) {
    options.specificSlug = args[slugIndex + 1];
  }
  
  generateBlogCoverImages(options).catch(error => {
    console.error('Fatal error during blog cover image generation:', error);
    process.exit(1);
  });
}

module.exports = { generateBlogCoverImages, extractBlogContent };