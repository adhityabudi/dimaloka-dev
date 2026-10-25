CREATE OR REPLACE FUNCTION public.validate_portfolio_settings() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.key = 'portfolio_page' OR NEW.key LIKE 'portfolio\_%' THEN
  IF jsonb_typeof(NEW.value) IS DISTINCT FROM 'object' OR coalesce(trim(NEW.value->>'seo_title'),'') = '' OR coalesce(trim(NEW.value->>'seo_description'),'') = '' OR jsonb_typeof(NEW.value->'keywords') IS DISTINCT FROM 'array' THEN
   RAISE EXCEPTION 'Portfolio requires SEO title, description and keywords';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements_text(NEW.value->'keywords') AS keyword(value) WHERE trim(value) <> '') THEN
   RAISE EXCEPTION 'Portfolio requires at least one SEO keyword';
  END IF;
 END IF;
 RETURN NEW;
END; $$;