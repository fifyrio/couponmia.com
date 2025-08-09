const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Extract blog metadata from a Next.js page component
 * @param {string} filePath - Path to the blog page.tsx file
 * @returns {Object|null} - Extracted metadata or null if parsing fails
 */
function extractBlogMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract folder name as slug
    const folderName = path.basename(path.dirname(filePath));
    
    // Extract metadata object using regex - handle nested objects
    const metadataStart = content.indexOf('export const metadata: Metadata = {');
    if (metadataStart === -1) {
      console.warn(`No metadata found in ${filePath}`);
      return null;
    }
    
    // Find the matching closing brace for the metadata object
    let braceCount = 0;
    let metadataEnd = -1;
    let inString = false;
    let stringChar = '';
    
    for (let i = metadataStart + 'export const metadata: Metadata = '.length; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i-1] : '';
      
      // Handle string literals
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            metadataEnd = i;
            break;
          }
        }
      }
    }
    
    if (metadataEnd === -1) {
      console.warn(`Could not parse metadata object in ${filePath}`);
      return null;
    }
    
    const metadataContent = content.substring(
      metadataStart + 'export const metadata: Metadata = {'.length,
      metadataEnd
    );
    
    // Extract title
    const titleMatch = metadataContent.match(/title:\s*['"](.*?)['"]/s);
    const title = titleMatch ? titleMatch[1] : null;
    
    // Extract description (used as excerpt)
    const descMatch = metadataContent.match(/description:\s*['"](.*?)['"]/s);
    const excerpt = descMatch ? descMatch[1] : null;
    
    // Extract author from authors array or default
    let author = 'CouponMia Editorial Team';
    const authorsMatch = metadataContent.match(/authors:\s*\[\s*{\s*name:\s*['"](.*?)['"]/);
    if (authorsMatch) {
      author = authorsMatch[1];
    }
    
    // Extract featured image from openGraph
    let featuredImage = '/api/placeholder/1200/630';
    const ogImagesMatch = metadataContent.match(/images:\s*\[\s*{\s*url:\s*['"](.*?)['"]/s);
    if (ogImagesMatch) {
      featuredImage = ogImagesMatch[1];
    } else {
      // Fallback: look for direct images array
      const imagesMatch = metadataContent.match(/images:\s*\[\s*['"](.*?)['"]/);
      if (imagesMatch) {
        featuredImage = imagesMatch[1];
      }
    }
    
    // Extract published date from openGraph publishedTime
    let publishedAt = new Date().toISOString();
    const publishedMatch = metadataContent.match(/publishedTime:\s*['"](.*?)['"]/);
    if (publishedMatch) {
      publishedAt = publishedMatch[1];
    }
    
    // Validate required fields
    if (!title || !excerpt) {
      console.warn(`Missing required fields in ${filePath}: title=${!!title}, description=${!!excerpt}`);
      return null;
    }
    
    return {
      title: title.trim(),
      slug: folderName,
      excerpt: excerpt.trim(),
      featured_image_url: featuredImage,
      author_name: author.trim(),
      is_published: true,
      published_at: publishedAt,
      created_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Find all blog page.tsx files
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
 * Check if blog post already exists in database
 * @param {string} slug - Blog post slug
 * @returns {Promise<boolean>} - True if exists, false otherwise
 */
async function blogPostExists(slug) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking blog post existence:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception checking blog post existence:', error);
    return false;
  }
}

/**
 * Insert or update blog post in database
 * @param {Object} blogData - Blog post data
 * @returns {Promise<boolean>} - Success status
 */
async function upsertBlogPost(blogData) {
  try {
    const exists = await blogPostExists(blogData.slug);
    
    if (exists) {
      // Update existing post
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: blogData.title,
          excerpt: blogData.excerpt,
          featured_image_url: blogData.featured_image_url,
          author_name: blogData.author_name,
          is_published: blogData.is_published,
          published_at: blogData.published_at
        })
        .eq('slug', blogData.slug);
      
      if (error) {
        console.error(`Error updating blog post ${blogData.slug}:`, error);
        return false;
      }
      
      console.log(`✅ Updated blog post: ${blogData.title}`);
    } else {
      // Insert new post
      const { error } = await supabase
        .from('blog_posts')
        .insert([blogData]);
      
      if (error) {
        console.error(`Error inserting blog post ${blogData.slug}:`, error);
        return false;
      }
      
      console.log(`✅ Inserted new blog post: ${blogData.title}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Exception upserting blog post ${blogData.slug}:`, error);
    return false;
  }
}

/**
 * Sync all blog posts to Supabase
 * @param {Object} options - Sync options
 */
async function syncBlogs(options = {}) {
  const { forceUpdate = false, specificSlug = null } = options;
  
  console.log('🚀 Starting blog sync to Supabase...');
  
  // Find blog directory
  const blogDir = path.join(process.cwd(), 'src', 'app', 'blog');
  
  if (!fs.existsSync(blogDir)) {
    console.error('❌ Blog directory not found:', blogDir);
    return;
  }
  
  // Find all blog files
  const blogFiles = findBlogFiles(blogDir);
  
  if (blogFiles.length === 0) {
    console.log('📝 No blog posts found to sync');
    return;
  }
  
  console.log(`📋 Found ${blogFiles.length} blog post(s) to process`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process each blog file
  for (const filePath of blogFiles) {
    try {
      // Extract metadata
      const blogData = extractBlogMetadata(filePath);
      
      if (!blogData) {
        console.warn(`⚠️  Skipping ${path.basename(path.dirname(filePath))}: Could not extract metadata`);
        errorCount++;
        continue;
      }
      
      // Filter by specific slug if provided
      if (specificSlug && blogData.slug !== specificSlug) {
        continue;
      }
      
      // Check if we should skip existing posts
      if (!forceUpdate && await blogPostExists(blogData.slug)) {
        console.log(`⏭️  Skipping existing blog post: ${blogData.slug}`);
        continue;
      }
      
      // Upsert blog post
      const success = await upsertBlogPost(blogData);
      
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      errorCount++;
    }
  }
  
  // Summary
  console.log('\n📊 Sync Summary:');
  console.log(`✅ Successfully synced: ${successCount} blog post(s)`);
  console.log(`❌ Errors encountered: ${errorCount} blog post(s)`);
  console.log(`📝 Total processed: ${successCount + errorCount} blog post(s)`);
  
  if (errorCount === 0) {
    console.log('🎉 Blog sync completed successfully!');
  } else {
    console.log('⚠️  Blog sync completed with some errors');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  if (args.includes('--force')) {
    options.forceUpdate = true;
  }
  
  const slugIndex = args.indexOf('--slug');
  if (slugIndex !== -1 && args[slugIndex + 1]) {
    options.specificSlug = args[slugIndex + 1];
  }
  
  syncBlogs(options).catch(error => {
    console.error('Fatal error during blog sync:', error);
    process.exit(1);
  });
}

module.exports = { syncBlogs, extractBlogMetadata };