#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkBlogData() {
  try {
    console.log('🔍 Checking blog_posts table...');
    
    // Check if table exists and get all data
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching blog posts:', error);
      return;
    }
    
    console.log(`📊 Found ${data?.length || 0} blog posts in database`);
    
    if (data && data.length > 0) {
      console.log('\n📚 Blog posts in database:');
      data.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   - ID: ${post.id}`);
        console.log(`   - Slug: ${post.slug}`);
        console.log(`   - Published: ${post.is_published ? 'Yes' : 'No'}`);
        console.log(`   - Created: ${new Date(post.created_at).toLocaleDateString()}`);
        console.log(`   - Published At: ${post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not set'}\n`);
      });
    } else {
      console.log('📝 No blog posts found in database');
      
      // Try to insert a simple test post
      console.log('\n🧪 Trying to insert a test blog post...');
      const testPost = {
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        excerpt: 'This is a test blog post to check database connectivity.',
        author_name: 'Test Author',
        is_published: true,
        published_at: new Date().toISOString()
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('blog_posts')
        .insert([testPost])
        .select();
      
      if (insertError) {
        console.error('❌ Error inserting test post:', insertError);
      } else {
        console.log('✅ Test post inserted successfully:', insertData);
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
checkBlogData();