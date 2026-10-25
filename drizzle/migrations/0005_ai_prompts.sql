CREATE TABLE public.ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature text NOT NULL UNIQUE CHECK (feature IN ('article_generate','article_seo','website_content','product_seo')),
  name text NOT NULL,
  system_prompt text NOT NULL,
  temperature numeric NOT NULL DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  model text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompts TO authenticated;
GRANT ALL ON public.ai_prompts TO service_role;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ai prompts" ON public.ai_prompts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));