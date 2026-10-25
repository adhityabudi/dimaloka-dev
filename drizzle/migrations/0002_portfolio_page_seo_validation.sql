CREATE OR REPLACE FUNCTION public.validate_portfolio_settings() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.key = 'portfolio_page' THEN
  IF jsonb_typeof(NEW.value) IS DISTINCT FROM 'object' OR coalesce(trim(NEW.value->>'seo_title'),'') = '' OR coalesce(trim(NEW.value->>'seo_description'),'') = '' OR jsonb_typeof(NEW.value->'keywords') IS DISTINCT FROM 'array' THEN
   RAISE EXCEPTION 'Portfolio requires SEO title, description and keywords';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements_text(NEW.value->'keywords') AS keyword(value) WHERE trim(value) <> '') THEN
   RAISE EXCEPTION 'Portfolio requires at least one SEO keyword';
  END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_portfolio_page BEFORE INSERT OR UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.validate_portfolio_settings();