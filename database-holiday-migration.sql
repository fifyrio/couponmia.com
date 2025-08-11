-- Holiday Tables Migration
-- Creates holidays and holiday_coupons tables for the CouponMia application

-- 1. Create holidays table for managing holiday information
CREATE TABLE public.holidays (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE, -- Holiday name (e.g., "Black Friday")
  slug character varying NOT NULL UNIQUE, -- URL slug (e.g., "black-friday")
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['Federal Holiday'::character varying::text, 'Observance'::character varying::text, 'Shopping Event'::character varying::text])),
  description text, -- Holiday description
  holiday_date date, -- Specific date for fixed holidays
  is_dynamic boolean DEFAULT false, -- Whether the date changes annually
  month_number integer CHECK (month_number >= 1 AND month_number <= 12), -- Month (1-12)
  day_number integer CHECK (day_number >= 1 AND day_number <= 31), -- Day of month
  banner_image_url text, -- Holiday banner image URL
  is_active boolean DEFAULT true, -- Whether to show this holiday
  display_order integer DEFAULT 0, -- Sort order for display
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT holidays_pkey PRIMARY KEY (id)
);

-- 2. Create holiday_coupons table for linking holidays to coupons
CREATE TABLE public.holiday_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  holiday_id uuid NOT NULL, -- Reference to holidays table
  coupon_id uuid NOT NULL, -- Reference to coupons table
  holiday_name character varying NOT NULL, -- Cached holiday name for queries
  holiday_type character varying, -- Cached holiday type
  holiday_date date, -- Cached holiday date
  match_source character varying, -- How this coupon was matched (title, description, etc.)
  match_text text, -- The text that matched the holiday
  confidence_score numeric DEFAULT 0, -- AI confidence score (0-100)
  is_featured boolean DEFAULT false, -- Whether to feature this coupon for the holiday
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT holiday_coupons_pkey PRIMARY KEY (id),
  CONSTRAINT holiday_coupons_holiday_id_fkey FOREIGN KEY (holiday_id) REFERENCES public.holidays(id) ON DELETE CASCADE,
  CONSTRAINT holiday_coupons_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE,
  CONSTRAINT holiday_coupons_unique_holiday_coupon UNIQUE (holiday_id, coupon_id)
);

-- 3. Create indexes for performance
CREATE INDEX idx_holidays_slug ON public.holidays(slug);
CREATE INDEX idx_holidays_type ON public.holidays(type);
CREATE INDEX idx_holidays_is_active ON public.holidays(is_active);
CREATE INDEX idx_holidays_display_order ON public.holidays(display_order);

CREATE INDEX idx_holiday_coupons_holiday_id ON public.holiday_coupons(holiday_id);
CREATE INDEX idx_holiday_coupons_coupon_id ON public.holiday_coupons(coupon_id);
CREATE INDEX idx_holiday_coupons_holiday_name ON public.holiday_coupons(holiday_name);
CREATE INDEX idx_holiday_coupons_confidence_score ON public.holiday_coupons(confidence_score DESC);
CREATE INDEX idx_holiday_coupons_is_featured ON public.holiday_coupons(is_featured);

-- 4. Add Row Level Security policies (if needed)
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday_coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access for holidays
CREATE POLICY "Allow public read access on holidays" ON public.holidays
  FOR SELECT USING (true);

-- Allow public read access for holiday_coupons
CREATE POLICY "Allow public read access on holiday_coupons" ON public.holiday_coupons
  FOR SELECT USING (true);

-- 5. Insert initial holiday data based on existing code
INSERT INTO public.holidays (name, slug, type, description, month_number, day_number, is_dynamic, banner_image_url, display_order) VALUES
-- Federal Holidays
('New Year''s Day', 'new-years-day', 'Federal Holiday', 'Start the new year with amazing deals and fresh savings!', 1, 1, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/new-years-day-sale-banner.webp', 1),
('Martin Luther King Jr. Day', 'martin-luther-king-jr-day', 'Federal Holiday', 'Honor the legacy with meaningful discounts and special offers.', 1, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/martin-luther-king-jr-day-sale-banner.webp', 2),
('Presidents'' Day', 'presidents-day', 'Federal Holiday', 'Presidential savings on everything you need this February!', 2, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/presidents-day-sale-banner.webp', 3),
('Memorial Day', 'memorial-day', 'Federal Holiday', 'Remember and save with Memorial Day weekend deals.', 5, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/memorial-day-sale-banner.webp', 4),
('Independence Day', 'independence-day', 'Federal Holiday', 'Celebrate freedom with Fourth of July fireworks and savings!', 7, 4, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/independence-day-sale-banner.webp', 5),
('Labor Day', 'labor-day', 'Federal Holiday', 'Work hard, save harder this Labor Day weekend!', 9, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/labor-day-sale-banner.webp', 6),
('Columbus Day', 'columbus-day', 'Federal Holiday', 'Discover new deals this Columbus Day!', 10, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/columbus-day-sale-banner.webp', 7),
('Veterans Day', 'veterans-day', 'Federal Holiday', 'Thank veterans with special discounts and offers.', 11, 11, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/veterans-day-sale-banner.webp', 8),
('Thanksgiving Day', 'thanksgiving-day', 'Federal Holiday', 'Give thanks for incredible Thanksgiving deals!', 11, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/thanksgiving-day-sale-banner.webp', 9),
('Christmas Day', 'christmas-day', 'Federal Holiday', 'Make Christmas magical with holiday savings and gifts!', 12, 25, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/christmas-day-sale-banner.webp', 10),

-- Cultural Holidays & Observances
('Valentine''s Day', 'valentines-day', 'Observance', 'Show love with sweet Valentine''s Day deals and gifts!', 2, 14, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/valentines-day-sale-banner.webp', 11),
('St. Patrick''s Day', 'st-patricks-day', 'Observance', 'Get lucky with green St. Patrick''s Day savings!', 3, 17, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/st-patricks-day-sale-banner.webp', 12),
('Easter Sunday', 'easter-sunday', 'Observance', 'Hop into Easter with egg-cellent deals and spring savings!', null, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/easter-sunday-sale-banner.webp', 13),
('Mother''s Day', 'mothers-day', 'Observance', 'Celebrate Mom with special Mother''s Day gifts and deals!', 5, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/mothers-day-sale-banner.webp', 14),
('Father''s Day', 'fathers-day', 'Observance', 'Honor Dad with fantastic Father''s Day deals and gifts!', 6, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/fathers-day-sale-banner.webp', 15),
('Halloween', 'halloween', 'Observance', 'Spook-tacular Halloween deals that won''t scare your wallet!', 10, 31, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/halloween-sale-banner.webp', 16),

-- Shopping Events
('Black Friday', 'black-friday', 'Shopping Event', 'The biggest shopping day of the year with unbeatable deals!', 11, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/black-friday-sale-banner.webp', 17),
('Cyber Monday', 'cyber-monday', 'Shopping Event', 'Online deals that will blow your mind this Cyber Monday!', 11, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/cyber-monday-sale-banner.webp', 18),
('Prime Day', 'prime-day', 'Shopping Event', 'Amazon Prime Day - exclusive deals for Prime members!', null, null, true, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/prime-day-sale-banner.webp', 19),
('Boxing Day', 'boxing-day', 'Shopping Event', 'Box up savings with amazing post-Christmas deals!', 12, 26, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/boxing-day-sale-banner.webp', 20),
('Back to School', 'back-to-school', 'Shopping Event', 'Get ready for school with back-to-school deals and supplies!', 8, null, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/back-to-school-sale-banner.webp', 21),

-- Seasonal Sales
('Summer Sale', 'summer-sale', 'Shopping Event', 'Beat the heat with hot summer deals and cool savings!', 6, null, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/summer-sale-sale-banner.webp', 22),
('Fall Sale', 'fall-sale', 'Shopping Event', 'Fall into savings with autumn deals and cozy discounts!', 9, null, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/fall-sale-sale-banner.webp', 23),
('Winter Sale', 'winter-sale', 'Shopping Event', 'Warm up to winter savings and cold-weather deals!', 12, null, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/winter-sale-sale-banner.webp', 24),
('Spring Sale', 'spring-sale', 'Shopping Event', 'Spring into savings with fresh deals and blooming discounts!', 3, null, false, 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev/holiday-images/spring-sale-sale-banner.webp', 25);