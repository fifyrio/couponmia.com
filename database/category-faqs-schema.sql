-- Category FAQs table for storing frequently asked questions specific to each category
CREATE TABLE category_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient category-based queries
CREATE INDEX idx_category_faqs_category_id ON category_faqs(category_id);
CREATE INDEX idx_category_faqs_active_order ON category_faqs(category_id, is_active, display_order);

-- RLS (Row Level Security) policies
ALTER TABLE category_faqs ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow public read access on category_faqs" 
ON category_faqs FOR SELECT 
USING (is_active = true);

-- Allow full access to service role
CREATE POLICY "Allow service role full access on category_faqs" 
ON category_faqs FOR ALL 
USING (auth.role() = 'service_role');

-- Update trigger to maintain updated_at timestamp
CREATE OR REPLACE FUNCTION update_category_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_category_faqs_updated_at
    BEFORE UPDATE ON category_faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_category_faqs_updated_at();

-- Insert sample data for common categories
INSERT INTO category_faqs (category_id, question, answer, display_order) 
SELECT 
    c.id,
    'How can I find the best ' || c.name || ' deals?',
    'Browse our curated collection of ' || c.name || ' coupons and deals. We update our offers daily and verify each code to ensure they work. Look for highlighted "Popular" deals for the most savings.',
    1
FROM categories c 
WHERE c.slug IN ('technology', 'fashion', 'food-delivery', 'travel', 'health-beauty')
ON CONFLICT DO NOTHING;

INSERT INTO category_faqs (category_id, question, answer, display_order)
SELECT 
    c.id,
    'Are ' || c.name || ' coupon codes verified?',
    'Yes! Our team verifies all ' || c.name || ' coupon codes regularly. We remove expired codes and mark working deals. If a code doesn''t work, please let us know so we can update it.',
    2
FROM categories c 
WHERE c.slug IN ('technology', 'fashion', 'food-delivery', 'travel', 'health-beauty')
ON CONFLICT DO NOTHING;

INSERT INTO category_faqs (category_id, question, answer, display_order)
SELECT 
    c.id,
    'How often do you add new ' || c.name || ' deals?',
    'We add new ' || c.name || ' deals daily! Our automated system checks for new offers from partner stores multiple times per day, ensuring you always have access to the latest savings.',
    3
FROM categories c 
WHERE c.slug IN ('technology', 'fashion', 'food-delivery', 'travel', 'health-beauty')
ON CONFLICT DO NOTHING;

INSERT INTO category_faqs (category_id, question, answer, display_order)
SELECT 
    c.id,
    'Can I get notifications for new ' || c.name || ' deals?',
    'Absolutely! Sign up for our email alerts to get notified when new ' || c.name || ' deals are available. You can also bookmark this page and check back regularly for updates.',
    4
FROM categories c 
WHERE c.slug IN ('technology', 'fashion', 'food-delivery', 'travel', 'health-beauty')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE category_faqs IS 'Frequently asked questions specific to each coupon category';
COMMENT ON COLUMN category_faqs.category_id IS 'Reference to the categories table';
COMMENT ON COLUMN category_faqs.question IS 'The FAQ question text';
COMMENT ON COLUMN category_faqs.answer IS 'The detailed answer to the question';
COMMENT ON COLUMN category_faqs.display_order IS 'Order in which FAQs should be displayed (lower numbers first)';
COMMENT ON COLUMN category_faqs.is_active IS 'Whether this FAQ is currently active and should be displayed';