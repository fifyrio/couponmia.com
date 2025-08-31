#!/usr/bin/env node

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
});

// Category-specific FAQ templates for different types of categories
const categoryFAQTemplates = {
  technology: [
    {
      question: "How can I find the best {category} deals?",
      answerTemplate: "Browse our curated collection of {category} coupons and deals. We update our offers daily and verify each code to ensure they work. Look for highlighted deals from top tech brands for the most savings."
    },
    {
      question: "Are {category} coupon codes verified?",
      answerTemplate: "Yes! Our team verifies all {category} coupon codes regularly. We test codes with major tech retailers and remove expired offers. If a code doesn't work, please report it so we can update our listings."
    },
    {
      question: "Do {category} deals work on sale items?",
      answerTemplate: "It depends on the specific offer. Many {category} deals can be combined with existing sales, but some exclude already discounted items. Check the deal terms for each coupon to see what restrictions apply."
    },
    {
      question: "How often do you add new {category} deals?",
      answerTemplate: "We add new {category} deals multiple times daily! Our automated system monitors major tech retailers and adds verified offers as soon as they become available."
    },
    {
      question: "Can I get price alerts for {category} products?",
      answerTemplate: "While we don't offer direct price alerts, you can bookmark this {category} page and check regularly for new deals. We also recommend signing up for our newsletter to get notified of major {category} sales events."
    }
  ],
  fashion: [
    {
      question: "How can I find the best {category} deals?",
      answerTemplate: "Discover amazing {category} savings through our verified coupon collection. We partner with top fashion brands and update deals daily. Look for seasonal sales and clearance events for maximum savings."
    },
    {
      question: "Do {category} coupons work on designer items?",
      answerTemplate: "Designer item eligibility varies by retailer and specific coupon. Some {category} deals exclude luxury brands, while others offer sitewide savings. Always check the terms and conditions before purchasing."
    },
    {
      question: "When are the best {category} sales?",
      answerTemplate: "The best {category} sales typically occur during Black Friday, end-of-season clearances, back-to-school periods, and holiday weekends. We track these major sales events and feature the top deals prominently."
    },
    {
      question: "Can I return items purchased with {category} coupons?",
      answerTemplate: "Return policies for items purchased with coupons follow the retailer's standard return policy. Using a coupon typically doesn't affect your ability to return items, but refunds may be processed for the amount paid after discount."
    },
    {
      question: "How do I know if a {category} deal is legitimate?",
      answerTemplate: "All {category} deals on our site are verified by our team. We only list coupons from reputable retailers and test codes regularly. Look for our 'verified' badges and user success rates."
    }
  ],
  food: [
    {
      question: "How can I save money on {category} orders?",
      answerTemplate: "Use our verified {category} coupons for instant savings on your orders. Many deals offer percentage discounts, free delivery, or buy-one-get-one offers. Check for minimum order requirements to maximize savings."
    },
    {
      question: "Do {category} coupons work with delivery apps?",
      answerTemplate: "Many {category} coupons work with popular delivery apps, but some are exclusive to direct ordering from restaurants. Check the deal details to see which platforms are supported."
    },
    {
      question: "Are there restrictions on {category} deals?",
      answerTemplate: "Common restrictions include minimum order amounts, delivery area limitations, and exclusions on certain menu items. Each {category} deal clearly lists its terms and conditions."
    },
    {
      question: "How often do {category} deals change?",
      answerTemplate: "Restaurant deals change frequently, often weekly or bi-weekly. We update our {category} section daily to ensure you have access to the latest offers from your favorite eateries."
    },
    {
      question: "Can I combine multiple {category} coupons?",
      answerTemplate: "Most restaurants allow only one coupon per order, but you can often combine platform-specific deals with restaurant coupons. Check the specific terms for each {category} offer."
    }
  ],
  travel: [
    {
      question: "How can I find the best {category} deals?",
      answerTemplate: "Our {category} section features verified deals from major airlines, hotels, and booking platforms. We update offers daily and highlight time-sensitive sales for maximum savings on your trips."
    },
    {
      question: "When should I book {category} deals?",
      answerTemplate: "Booking timing varies by destination and season. Generally, book domestic flights 1-3 months ahead and international flights 2-8 months ahead. Hotel deals often have flexible cancellation, so book early and monitor for better rates."
    },
    {
      question: "Are {category} coupon codes transferable?",
      answerTemplate: "Most {category} coupon codes are tied to the account that uses them and aren't transferable. However, some promotional codes can be shared. Check the specific terms for each deal."
    },
    {
      question: "Do {category} deals include taxes and fees?",
      answerTemplate: "Deal descriptions specify whether taxes and fees are included. Many {category} coupons offer discounts on base prices, with additional fees applied at checkout. Always review the total cost before booking."
    },
    {
      question: "Can I cancel bookings made with {category} coupons?",
      answerTemplate: "Cancellation policies depend on the booking platform and specific deal terms. Some promotional rates have stricter cancellation policies, so review the terms carefully before booking your {category} deal."
    }
  ]
};

// Generic FAQ templates that work for any category
const genericFAQTemplates = [
  {
    question: "How can I find the best {category} deals?",
    answerTemplate: "Browse our curated collection of {category} coupons and deals. We update our offers daily and verify each code to ensure they work. Look for highlighted 'Popular' deals for the most savings."
  },
  {
    question: "Are {category} coupon codes verified?",
    answerTemplate: "Yes! Our team verifies all {category} coupon codes regularly. We remove expired codes and mark working deals. If a code doesn't work, please let us know so we can update it."
  },
  {
    question: "How often do you add new {category} deals?",
    answerTemplate: "We add new {category} deals daily! Our automated system checks for new offers from partner stores multiple times per day, ensuring you always have access to the latest savings."
  },
  {
    question: "Can I get notifications for new {category} deals?",
    answerTemplate: "Absolutely! Sign up for our email alerts to get notified when new {category} deals are available. You can also bookmark this page and check back regularly for updates."
  },
  {
    question: "What should I do if a {category} coupon doesn't work?",
    answerTemplate: "If a {category} coupon code doesn't work, first check the expiration date and terms. Make sure you meet minimum purchase requirements. If it still doesn't work, please report it to us so we can verify and update the offer."
  }
];

async function generateFAQsWithAI(category, existingFaqs = []) {
  try {
    const existingQuestions = existingFaqs.map(faq => faq.question);
    
    const prompt = `Generate 5 unique, helpful FAQ questions and answers for the "${category.name}" category on a coupon website. 
    
Category: ${category.name}
Category description: ${category.description || 'General category for deals and coupons'}

Requirements:
- Questions should be specific to ${category.name} deals/coupons
- Answers should be helpful, informative, and encourage engagement
- Avoid these existing questions: ${existingQuestions.join(', ')}
- Each answer should be 1-3 sentences
- Focus on common customer concerns about ${category.name} deals

Please respond with a JSON array in this exact format:
[
  {
    "question": "Question text here",
    "answer": "Answer text here"
  }
]`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates FAQ content for coupon websites. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content.trim();
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const faqs = JSON.parse(jsonMatch[0]);
    return faqs;
  } catch (error) {
    console.error(`Error generating AI FAQs for ${category.name}:`, error);
    return null;
  }
}

function getTemplateForCategory(categorySlug) {
  // Determine category type based on slug
  if (categorySlug.includes('tech') || categorySlug.includes('software') || categorySlug.includes('electronic')) {
    return categoryFAQTemplates.technology;
  } else if (categorySlug.includes('fashion') || categorySlug.includes('clothing') || categorySlug.includes('apparel')) {
    return categoryFAQTemplates.fashion;
  } else if (categorySlug.includes('food') || categorySlug.includes('restaurant') || categorySlug.includes('delivery')) {
    return categoryFAQTemplates.food;
  } else if (categorySlug.includes('travel') || categorySlug.includes('hotel') || categorySlug.includes('flight')) {
    return categoryFAQTemplates.travel;
  } else {
    return genericFAQTemplates;
  }
}

async function generateCategoryFAQs(category, useAI = false) {
  try {
    console.log(`\nGenerating FAQs for category: ${category.name} (${category.slug})`);

    // Check existing FAQs
    const { data: existingFaqs } = await supabase
      .from('category_faqs')
      .select('*')
      .eq('category_id', category.id)
      .eq('is_active', true);

    if (existingFaqs && existingFaqs.length >= 5) {
      console.log(`✅ Category ${category.name} already has ${existingFaqs.length} FAQs. Skipping...`);
      return;
    }

    let faqsToInsert = [];

    if (useAI) {
      // Try to generate with AI first
      const aiFaqs = await generateFAQsWithAI(category, existingFaqs);
      if (aiFaqs && aiFaqs.length > 0) {
        faqsToInsert = aiFaqs.map((faq, index) => ({
          category_id: category.id,
          question: faq.question,
          answer: faq.answer,
          display_order: (existingFaqs?.length || 0) + index + 1
        }));
        console.log(`📝 Generated ${aiFaqs.length} AI FAQs for ${category.name}`);
      }
    }

    // If AI failed or not requested, use templates
    if (faqsToInsert.length === 0) {
      const templates = getTemplateForCategory(category.slug);
      const neededFaqs = Math.min(5, templates.length);
      
      faqsToInsert = templates.slice(0, neededFaqs).map((template, index) => ({
        category_id: category.id,
        question: template.question.replace(/\{category\}/g, category.name),
        answer: template.answerTemplate.replace(/\{category\}/g, category.name),
        display_order: (existingFaqs?.length || 0) + index + 1
      }));
      console.log(`📋 Generated ${neededFaqs} template FAQs for ${category.name}`);
    }

    // Insert FAQs
    if (faqsToInsert.length > 0) {
      const { error } = await supabase
        .from('category_faqs')
        .insert(faqsToInsert);

      if (error) {
        console.error(`❌ Error inserting FAQs for ${category.name}:`, error);
      } else {
        console.log(`✅ Successfully inserted ${faqsToInsert.length} FAQs for ${category.name}`);
      }
    }

  } catch (error) {
    console.error(`❌ Error generating FAQs for category ${category.name}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting Category FAQ Generation Script');
  
  const args = process.argv.slice(2);
  const command = args[0];
  const useAI = args.includes('--ai');
  const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1];

  try {
    if (command === 'single') {
      // Generate for single category
      const categorySlug = args[1];
      if (!categorySlug) {
        console.error('❌ Please provide a category slug for single mode');
        process.exit(1);
      }

      const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (!category) {
        console.error(`❌ Category with slug '${categorySlug}' not found`);
        process.exit(1);
      }

      await generateCategoryFAQs(category, useAI);
    } else if (command === 'cleanup') {
      // Remove inactive FAQs
      const { error } = await supabase
        .from('category_faqs')
        .delete()
        .eq('is_active', false);

      if (error) {
        console.error('❌ Error cleaning up inactive FAQs:', error);
      } else {
        console.log('✅ Cleaned up inactive FAQs');
      }
    } else {
      // Generate for all categories (default)
      let query = supabase
        .from('categories')
        .select('*')
        .order('name');

      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const { data: categories, error } = await query;

      if (error) {
        console.error('❌ Error fetching categories:', error);
        process.exit(1);
      }

      console.log(`📊 Found ${categories.length} categories to process`);
      
      for (const category of categories) {
        await generateCategoryFAQs(category, useAI);
        
        // Rate limiting for AI requests
        if (useAI) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    console.log('\n✅ Category FAQ generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔧 Category FAQ Generation Script

Usage:
  node scripts/generate-category-faqs.js [command] [options]

Commands:
  (default)           Generate FAQs for all categories
  single <slug>       Generate FAQs for specific category
  cleanup            Remove inactive FAQs

Options:
  --ai               Use AI to generate unique FAQs (requires OPENROUTER_API_KEY)
  --limit=<number>   Limit number of categories to process
  --help             Show this help message

Examples:
  node scripts/generate-category-faqs.js
  node scripts/generate-category-faqs.js single technology --ai
  node scripts/generate-category-faqs.js --limit=10 --ai
  node scripts/generate-category-faqs.js cleanup
`);
  process.exit(0);
}

main();