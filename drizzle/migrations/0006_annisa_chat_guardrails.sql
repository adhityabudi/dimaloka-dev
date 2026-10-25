ALTER TABLE public.ai_prompts DROP CONSTRAINT ai_prompts_feature_check;
ALTER TABLE public.ai_prompts ADD CONSTRAINT ai_prompts_feature_check CHECK (feature IN ('article_generate','article_seo','website_content','product_seo','assistant_chat'));
CREATE TABLE public.assistant_rate_limits (subject text PRIMARY KEY, count integer NOT NULL DEFAULT 0, window_start timestamptz NOT NULL DEFAULT now(), blocked_until timestamptz);
GRANT ALL ON public.assistant_rate_limits TO service_role;
ALTER TABLE public.assistant_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.consume_assistant_request(_subject text, _block boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.assistant_rate_limits; t timestamptz := clock_timestamp();
BEGIN
 IF length(_subject) <> 64 THEN RAISE EXCEPTION 'invalid subject'; END IF;
 INSERT INTO public.assistant_rate_limits(subject) VALUES (_subject) ON CONFLICT DO NOTHING;
 SELECT * INTO r FROM public.assistant_rate_limits WHERE subject=_subject FOR UPDATE;
 IF r.blocked_until > t THEN RETURN jsonb_build_object('allowed',false,'blocked',true,'retry_after',ceil(extract(epoch FROM r.blocked_until-t))); END IF;
 IF _block THEN UPDATE public.assistant_rate_limits SET blocked_until=t+interval '15 minutes' WHERE subject=_subject; RETURN jsonb_build_object('allowed',false,'blocked',true,'retry_after',900); END IF;
 IF r.window_start <= t-interval '15 minutes' THEN r.count := 0; r.window_start := t; END IF;
 IF r.count >= 20 THEN RETURN jsonb_build_object('allowed',false,'blocked',false,'retry_after',ceil(extract(epoch FROM r.window_start+interval '15 minutes'-t))); END IF;
 UPDATE public.assistant_rate_limits SET count=r.count+1,window_start=r.window_start,blocked_until=null WHERE subject=_subject;
 RETURN jsonb_build_object('allowed',true,'blocked',false,'remaining',19-r.count);
END $$;
REVOKE ALL ON FUNCTION public.consume_assistant_request(text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_assistant_request(text,boolean) TO service_role;
DROP POLICY IF EXISTS "public settings" ON public.site_settings;
CREATE POLICY "public presentation settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (key IN ('canonical_domain','contact_address','contact_email','contact_whatsapp','footer_about','global_keywords','global_seo_description','global_seo_title','google_analytics_id','homepage_page','payment_info','portfolio_master','portfolio_page','robots_txt','search_console_meta','site_name','site_tagline','social_links') OR key LIKE 'service\_%' ESCAPE '\' OR key LIKE 'portfolio\_%' ESCAPE '\');