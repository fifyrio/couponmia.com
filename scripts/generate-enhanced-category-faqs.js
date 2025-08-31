#!/usr/bin/env node

/**
 * Enhanced Category FAQ Generation System v2.0
 * 
 * This script generates comprehensive FAQ content with structured sections:
 * - Traditional FAQ Questions (Q&A format)
 * - About {categoryName} (detailed overview)
 * - Applications of {categoryName} in Various Industries
 * - Unique & Intriguing {categoryName} Apps/Tools
 * - {categoryName} Saving Tips & Tricks
 * 
 * Architecture: AI-powered with intelligent fallbacks and structured content modules
 * 
 * Usage: node scripts/generate-enhanced-category-faqs.js [command] [options]
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://couponmia.com',
    'X-Title': 'CouponMia Enhanced FAQ Generation'
  }
});

// Configuration
const CONFIG = {
  model: "openai/gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2000,
  rateLimit: 3000, // ms between AI requests
  sectionsPerCategory: {
    faqs: 8, // Traditional Q&A
    about: 1, // About section  
    applications: 1, // Industry applications
    unique_tools: 1, // Unique apps/tools
    saving_tips: 1 // Saving tips & tricks
  }
};

/**
 * Enhanced FAQ Content Modules
 */
const CONTENT_MODULES = {
  // Traditional FAQ questions (Q&A format)
  faqs: {
    type: 'faq',
    title: 'Frequently Asked Questions',
    priority: 1
  },
  
  // About section (informational content)
  about: {
    type: 'content',
    title: 'About {categoryName}',
    priority: 2
  },
  
  // Industry applications (informational content)  
  applications: {
    type: 'content',
    title: 'Applications of {categoryName} in Various Industries',
    priority: 3
  },
  
  // Unique tools and apps (informational content)
  unique_tools: {
    type: 'content', 
    title: 'Unique & Intriguing {categoryName} Apps/Tools',
    priority: 4
  },
  
  // Money saving tips (informational content)
  saving_tips: {
    type: 'content',
    title: '{categoryName} Saving Tips & Tricks', 
    priority: 5
  }
};

/**
 * Generate AI-powered FAQ content with structured modules
 */
async function generateEnhancedFAQsWithAI(category) {
  try {
    console.log(`🤖 Generating AI-powered enhanced FAQs for: ${category.name}`);
    
    const prompt = `Generate comprehensive, structured FAQ content for "${category.name}" category on CouponMia.com.

Create content for these 5 sections with bullet points and specific brand names:

1. TRADITIONAL FAQs (Q&A format - 5 questions):
Generate 5 practical FAQ questions and answers about ${category.name} deals, coupons, and savings. Include specific steps and actionable advice.

2. ABOUT ${category.name.toUpperCase()} (Structured Format):
Write content with clear sections using ** for headers and • for bullet points. Include specific brand names and market examples.

3. APPLICATIONS OF ${category.name.toUpperCase()} IN VARIOUS INDUSTRIES:
Organize by industry sectors with specific company examples (Amazon, Walmart, Nike, Apple, etc.). Use bullet points for clarity.

4. UNIQUE & INTRIGUING ${category.name.toUpperCase()} APPS/TOOLS:
List real apps, tools, and platforms by category (Popular Apps, Browser Extensions, Mobile Apps). Include actual names like Honey, Rakuten, etc.

5. ${category.name.toUpperCase()} SAVING TIPS & TRICKS:
Organize tips by strategy type (Timing, Stacking, Comparison Shopping) with specific tools and platform names.

Requirements:
- Use ** for bold section headers and • for bullet points
- Include specific, recognizable brand names, app names, company names
- Each FAQ answer should include actionable steps
- Content sections: Use structured format with subheadings
- Focus on practical, money-saving advice with real tool names
- Write for deal-seekers who want specific recommendations
- Each content section should be 250-400 words with clear organization

Return ONLY valid JSON in this exact format:
{
  "faqs": [
    {"question": "Q1 text", "answer": "Detailed answer with specific steps and examples"},
    {"question": "Q2 text", "answer": "Another detailed answer"},
    ... (5 total)
  ],
  "about": {
    "title": "About ${category.name}",
    "content": "Brief introduction paragraph.\\n\\n**Key Characteristics:**\\n• Point 1 with specific details and brand names\\n• Point 2 with market data\\n• Point 3 with examples (Nike, Amazon, etc.)\\n\\n**Market Overview:**\\n• Industry trends and growth\\n• Major players and companies\\n• Consumer preferences"
  },
  "applications": {
    "title": "Applications of ${category.name} in Various Industries", 
    "content": "**Retail & E-commerce:**\\n• Use case with brand names (Amazon, Walmart)\\n• Application examples\\n\\n**Enterprise Solutions:**\\n• Business applications\\n• Company examples\\n\\n**Consumer Applications:**\\n• Individual usage scenarios\\n• Popular platforms"
  },
  "unique_tools": {
    "title": "Unique & Intriguing ${category.name} Apps/Tools",
    "content": "**Popular Apps & Platforms:**\\n• App Name 1 - Key features\\n• App Name 2 - Benefits\\n• Platform Name - Functionality\\n\\n**Browser Extensions:**\\n• Extension name - What it does\\n• Tool name - Key capabilities\\n\\n**Mobile Apps:**\\n• App name - Special features"
  },
  "saving_tips": {
    "title": "${category.name} Saving Tips & Tricks",
    "content": "**Timing Strategies:**\\n• Best shopping seasons (Black Friday, etc.)\\n• Price tracking with Honey, CamelCamelCamel\\n• Optimal purchase timing\\n\\n**Stacking & Combining:**\\n• Stack coupons with cashback apps (Rakuten, Ibotta)\\n• Credit card rewards optimization\\n• Manufacturer + store offers\\n\\n**Smart Shopping:**\\n• Compare on Google Shopping, PriceGrabber\\n• Check multiple retailers (Best Buy, Target)\\n• Set up price alerts"
  }
}`;

    const response = await openai.chat.completions.create({
      model: CONFIG.model,
      messages: [
        {
          role: "system",
          content: "You are an expert content creator specializing in e-commerce, deals, and consumer savings. Generate comprehensive, accurate FAQ content. Always respond with valid JSON only, no markdown or additional text."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: CONFIG.temperature,
      max_tokens: CONFIG.maxTokens
    });

    const content = response.choices[0].message.content.trim();
    
    // Extract and parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const enhancedFAQs = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!enhancedFAQs.faqs || !Array.isArray(enhancedFAQs.faqs) || enhancedFAQs.faqs.length < 5) {
      throw new Error('Invalid FAQ structure in AI response');
    }

    console.log(`✅ Generated ${enhancedFAQs.faqs.length} FAQs and 4 content sections for ${category.name}`);
    return enhancedFAQs;
    
  } catch (error) {
    console.error(`❌ AI generation failed for ${category.name}:`, error.message);
    return null;
  }
}

/**
 * Generate fallback content using templates
 */
function generateFallbackContent(category) {
  console.log(`📋 Generating fallback template content for: ${category.name}`);
  
  const fallbackFAQs = [
    {
      question: `How can I find the best ${category.name} deals?`,
      answer: `Browse our curated collection of ${category.name} coupons and deals. We update our offers daily and verify each code to ensure they work. Look for featured deals for maximum savings.`
    },
    {
      question: `Are ${category.name} coupon codes verified?`,
      answer: `Yes! Our team verifies all ${category.name} coupon codes regularly. We test codes and remove expired offers to ensure reliability.`
    },
    {
      question: `How often do you add new ${category.name} deals?`,
      answer: `We add new ${category.name} deals multiple times daily through our automated monitoring system that tracks offers from partner retailers.`
    },
    {
      question: `Can I get notifications for new ${category.name} deals?`,
      answer: `Absolutely! Sign up for our email alerts or bookmark this ${category.name} page to stay updated on the latest offers.`
    },
    {
      question: `What should I do if a ${category.name} coupon doesn't work?`,
      answer: `First check the expiration date and terms. If the code still doesn't work, please report it to us so we can update our listings.`
    }
  ];

  return {
    faqs: fallbackFAQs,
    about: {
      title: `About ${category.name}`,
      content: `${category.name} encompasses a wide range of products and services that cater to various consumer needs. This category offers numerous opportunities for savings through verified coupons, promotional codes, and special deals. Whether you're looking for everyday essentials or specialized items, our ${category.name} section provides access to discounts from trusted retailers and brands.`
    },
    applications: {
      title: `Applications of ${category.name} in Various Industries`,
      content: `${category.name} products and services find applications across multiple industries and use cases. From personal use to business applications, this category serves diverse market segments with solutions that meet specific needs and requirements.`
    },
    unique_tools: {
      title: `Unique & Intriguing ${category.name} Apps/Tools`, 
      content: `The ${category.name} space continues to evolve with innovative tools and applications that provide new ways to access products and services. These emerging solutions offer enhanced functionality and user experiences for consumers in this category.`
    },
    saving_tips: {
      title: `${category.name} Saving Tips & Tricks`,
      content: `Maximize your savings on ${category.name} purchases by combining multiple offers, shopping during sales events, and using cashback programs. Always compare prices across different retailers and sign up for newsletters to receive exclusive discounts. Consider buying in bulk for frequently used items and take advantage of seasonal promotions for the best deals.`
    }
  };
}

/**
 * Save enhanced FAQ content to database
 */
async function saveEnhancedFAQs(category, faqContent) {
  try {
    // Delete existing FAQs for this category
    await supabase
      .from('category_faqs')
      .delete()
      .eq('category_id', category.id);

    const faqsToInsert = [];
    let displayOrder = 1;

    // Insert content sections FIRST (higher priority display)
    const contentSections = [
      { key: 'about', order: 1 },
      { key: 'applications', order: 2 }, 
      { key: 'unique_tools', order: 3 },
      { key: 'saving_tips', order: 4 }
    ];
    
    for (const sectionConfig of contentSections) {
      const section = faqContent[sectionConfig.key];
      if (section && section.content) {
        faqsToInsert.push({
          category_id: category.id,
          question: section.title,
          answer: section.content,
          content_type: 'content',
          section_title: section.title,
          display_order: sectionConfig.order,
          is_active: true
        });
      }
    }

    // Insert traditional FAQs LAST (lower priority display)
    let faqOrder = 10; // Start FAQ items at order 10 to ensure they appear after content sections
    for (const faq of faqContent.faqs) {
      faqsToInsert.push({
        category_id: category.id,
        question: faq.question,
        answer: faq.answer,
        content_type: 'faq',
        section_title: 'Frequently Asked Questions',
        display_order: faqOrder++,
        is_active: true
      });
    }

    // Insert all content
    const { error } = await supabase
      .from('category_faqs')
      .insert(faqsToInsert);

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }

    console.log(`✅ Saved ${faqsToInsert.length} enhanced FAQ items for ${category.name}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to save enhanced FAQs for ${category.name}:`, error.message);
    return false;
  }
}

/**
 * Check if database schema supports enhanced FAQs
 */
async function checkDatabaseSchema() {
  try {
    // Check if required columns exist
    const { data, error } = await supabase
      .from('category_faqs')
      .select('content_type, section_title')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.log('⚠️  Enhanced schema not detected. Will create migration...');
    return false;
  }
}

/**
 * Create database migration for enhanced FAQ schema
 */
async function createSchemaMigration() {
  console.log('🔧 Creating enhanced FAQ schema migration...');
  
  const migrationSQL = `
-- Enhanced Category FAQ Schema Migration
-- Adds support for structured content modules beyond traditional Q&A

-- Add new columns to support enhanced FAQ content
ALTER TABLE category_faqs 
ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'faq',
ADD COLUMN IF NOT EXISTS section_title TEXT;

-- Update existing records to have default content_type
UPDATE category_faqs SET content_type = 'faq' WHERE content_type IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_category_faqs_content_type ON category_faqs(content_type);
CREATE INDEX IF NOT EXISTS idx_category_faqs_section ON category_faqs(category_id, content_type, display_order);

-- Add comment
COMMENT ON COLUMN category_faqs.content_type IS 'Content type: faq (Q&A) or content (informational section)';
COMMENT ON COLUMN category_faqs.section_title IS 'Title for content sections (About, Applications, etc.)';
`;

  console.log('📋 Migration SQL (run this in Supabase SQL editor):');
  console.log('=' .repeat(60));
  console.log(migrationSQL);
  console.log('=' .repeat(60));
  
  return migrationSQL;
}

/**
 * Process single category with enhanced FAQ generation
 */
async function processCategory(category, useAI = true, force = false) {
  try {
    // Check if category already has enhanced FAQs (unless force mode)
    if (!force) {
      const { data: existingFAQs } = await supabase
        .from('category_faqs')
        .select('id, content_type')
        .eq('category_id', category.id)
        .eq('is_active', true);

      const hasEnhancedContent = existingFAQs?.some(faq => faq.content_type === 'content');
      if (hasEnhancedContent && existingFAQs.length >= 8) {
        console.log(`✅ ${category.name} already has enhanced FAQ content. Skipping...`);
        return true;
      }
    }

    let faqContent = null;

    // Try AI generation first
    if (useAI) {
      faqContent = await generateEnhancedFAQsWithAI(category);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit));
    }

    // Fallback to templates if AI fails
    if (!faqContent) {
      faqContent = generateFallbackContent(category);
    }

    // Save to database
    const success = await saveEnhancedFAQs(category, faqContent);
    return success;

  } catch (error) {
    console.error(`❌ Error processing category ${category.name}:`, error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Enhanced Category FAQ Generation System v2.0');
  console.log('=' .repeat(60));
  
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  const useAI = !args.includes('--no-ai');
  const force = args.includes('--force');
  const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1];
  
  try {
    // Check database schema
    const schemaReady = await checkDatabaseSchema();
    if (!schemaReady) {
      await createSchemaMigration();
      console.log('\n⚠️  Please run the migration SQL in Supabase SQL editor first, then retry this script.');
      process.exit(1);
    }

    let categories = [];
    let processed = 0;
    let successful = 0;

    // Handle different commands
    switch (command) {
      case 'single': {
        const categorySlug = args[1];
        if (!categorySlug) {
          console.error('❌ Please provide a category slug for single mode');
          process.exit(1);
        }

        const { data: category, error } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        if (error || !category) {
          console.error(`❌ Category '${categorySlug}' not found`);
          process.exit(1);
        }

        categories = [category];
        break;
      }
      
      case 'migration': {
        await createSchemaMigration();
        process.exit(0);
      }
      
      default: {
        // Process all categories
        let query = supabase
          .from('categories')
          .select('*')
          .order('name');

        if (limit) {
          query = query.limit(parseInt(limit));
        }

        const { data, error } = await query;
        if (error) {
          console.error('❌ Error fetching categories:', error);
          process.exit(1);
        }
        
        categories = data || [];
        break;
      }
    }

    console.log(`\n📊 Processing ${categories.length} categories...`);
    console.log(`🤖 AI Generation: ${useAI ? 'Enabled' : 'Disabled'}`);
    console.log(`⚡ Force Mode: ${force ? 'Enabled' : 'Disabled'}`);
    
    // Process categories
    for (const category of categories) {
      console.log(`\n[${processed + 1}/${categories.length}] Processing: ${category.name}`);
      
      const success = await processCategory(category, useAI, force);
      processed++;
      if (success) successful++;
      
      // Progress indicator
      const progress = Math.round((processed / categories.length) * 100);
      console.log(`📈 Progress: ${progress}% (${successful}/${processed} successful)`);
    }

    // Final summary
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Enhanced FAQ Generation Complete!');
    console.log(`📊 Total: ${processed} | ✅ Success: ${successful} | ❌ Failed: ${processed - successful}`);
    console.log(`💡 Success Rate: ${Math.round((successful / processed) * 100)}%`);
    
    if (successful > 0) {
      console.log('\n🔄 Next steps:');
      console.log('1. Review generated content in the category_faqs table');
      console.log('2. Update the CategoryFAQ component to display new content types');
      console.log('3. Test the enhanced FAQ display on category pages');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Help information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔧 Enhanced Category FAQ Generation System v2.0

This script generates comprehensive FAQ content with 5 structured modules:
• Traditional FAQ Questions (8 Q&A pairs)
• About {categoryName} (detailed overview)
• Applications in Various Industries
• Unique & Intriguing Apps/Tools  
• Saving Tips & Tricks

Usage:
  node scripts/generate-enhanced-category-faqs.js [command] [options]

Commands:
  all (default)       Generate enhanced FAQs for all categories
  single <slug>       Generate for specific category
  migration          Show database migration SQL

Options:
  --no-ai            Use templates instead of AI generation
  --force            Regenerate even if content exists
  --limit=<number>   Limit number of categories to process
  --help             Show this help message

Examples:
  node scripts/generate-enhanced-category-faqs.js
  node scripts/generate-enhanced-category-faqs.js single electronics-tech --force
  node scripts/generate-enhanced-category-faqs.js --limit=5 --no-ai
  node scripts/generate-enhanced-category-faqs.js migration

Environment Requirements:
  OPENROUTER_API_KEY  Required for AI-powered generation
  SUPABASE_SERVICE_ROLE_KEY  Required for database operations
`);
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});