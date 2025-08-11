-- 创建节日优惠券表
-- 这个文件包含创建 holiday_coupons 表的完整SQL

-- 删除可能存在的旧表
DROP TABLE IF EXISTS holiday_coupons;

-- 创建节日优惠券表
CREATE TABLE holiday_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL,
  holiday_name VARCHAR(100) NOT NULL,
  holiday_date DATE,
  holiday_type VARCHAR(50),
  match_source VARCHAR(20) NOT NULL CHECK (match_source IN ('title', 'description')),
  match_text TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT holiday_coupons_pkey PRIMARY KEY (id),
  CONSTRAINT holiday_coupons_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT holiday_coupons_unique_coupon_holiday UNIQUE(coupon_id, holiday_name)
);

-- 创建索引优化查询性能
CREATE INDEX idx_holiday_coupons_holiday_name ON holiday_coupons(holiday_name);
CREATE INDEX idx_holiday_coupons_holiday_date ON holiday_coupons(holiday_date);
CREATE INDEX idx_holiday_coupons_coupon_id ON holiday_coupons(coupon_id);
CREATE INDEX idx_holiday_coupons_holiday_type ON holiday_coupons(holiday_type);

-- 添加注释
COMMENT ON TABLE holiday_coupons IS '节日优惠券关联表，存储包含节日关键词的优惠券';
COMMENT ON COLUMN holiday_coupons.coupon_id IS '优惠券ID，外键关联coupons表';
COMMENT ON COLUMN holiday_coupons.holiday_name IS '节日名称，如 Halloween, Christmas Day';
COMMENT ON COLUMN holiday_coupons.holiday_date IS '节日日期';
COMMENT ON COLUMN holiday_coupons.holiday_type IS '节日类型：Federal Holiday, Observance, Shopping Event';
COMMENT ON COLUMN holiday_coupons.match_source IS '匹配来源：title或description';
COMMENT ON COLUMN holiday_coupons.match_text IS '匹配到的具体文本';
COMMENT ON COLUMN holiday_coupons.confidence_score IS '匹配置信度，0.0-1.0';

-- 验证表创建成功
SELECT 'holiday_coupons table created successfully' as status;