-- 给stores表添加新字段以支持API数据
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS commission_rate_data JSONB,
ADD COLUMN IF NOT EXISTS countries_data JSONB,
ADD COLUMN IF NOT EXISTS domains_data JSONB,
ADD COLUMN IF NOT EXISTS commission_model_data JSONB,
ADD COLUMN IF NOT EXISTS discount_analysis JSONB;

-- 添加唯一约束
ALTER TABLE public.stores ADD CONSTRAINT stores_external_id_unique UNIQUE (external_id);
ALTER TABLE public.coupons ADD CONSTRAINT coupons_external_id_unique UNIQUE (external_id);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_stores_external_id ON public.stores(external_id);
CREATE INDEX IF NOT EXISTS idx_coupons_external_id ON public.coupons(external_id);
CREATE INDEX IF NOT EXISTS idx_coupons_store_id ON public.coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON public.coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);

-- 创建同步日志表（可选）
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sync_type character varying NOT NULL, -- 'stores', 'coupons', 'all'
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  status character varying NOT NULL, -- 'running', 'completed', 'failed'
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sync_logs_pkey PRIMARY KEY (id)
);