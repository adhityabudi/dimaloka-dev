CREATE OR REPLACE FUNCTION public.consume_assistant_request(_subject text, _block boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r public.assistant_rate_limits; t timestamptz := clock_timestamp();
BEGIN
 IF length(_subject) <> 64 THEN RAISE EXCEPTION 'invalid subject'; END IF;
 INSERT INTO public.assistant_rate_limits(subject) VALUES (_subject) ON CONFLICT DO NOTHING;
 SELECT * INTO r FROM public.assistant_rate_limits WHERE subject=_subject FOR UPDATE;
 IF r.blocked_until > t THEN RETURN jsonb_build_object('allowed',false,'blocked',true,'remaining',0,'retry_after',ceil(extract(epoch FROM r.blocked_until-t))); END IF;
 IF _block THEN UPDATE public.assistant_rate_limits SET blocked_until=t+interval '15 minutes' WHERE subject=_subject; RETURN jsonb_build_object('allowed',false,'blocked',true,'remaining',0,'retry_after',900); END IF;
 IF r.window_start <= t-interval '24 hours' THEN r.count := 0; r.window_start := t; END IF;
 IF r.count >= 5 THEN RETURN jsonb_build_object('allowed',false,'blocked',false,'remaining',0,'retry_after',ceil(extract(epoch FROM r.window_start+interval '24 hours'-t))); END IF;
 UPDATE public.assistant_rate_limits SET count=r.count+1,window_start=r.window_start,blocked_until=null WHERE subject=_subject;
 RETURN jsonb_build_object('allowed',true,'blocked',false,'remaining',4-r.count);
END $function$;

CREATE OR REPLACE FUNCTION public.assistant_quota_status(_subject text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r public.assistant_rate_limits; t timestamptz := clock_timestamp();
BEGIN
 IF length(_subject) <> 64 THEN RAISE EXCEPTION 'invalid subject'; END IF;
 SELECT * INTO r FROM public.assistant_rate_limits WHERE subject=_subject;
 IF NOT FOUND OR r.window_start <= t-interval '24 hours' THEN RETURN jsonb_build_object('remaining',5,'blocked',false); END IF;
 RETURN jsonb_build_object('remaining',greatest(0,5-r.count),'blocked',coalesce(r.blocked_until > t,false),
   'retry_after',CASE WHEN r.count >= 5 THEN ceil(extract(epoch FROM r.window_start+interval '24 hours'-t)) END);
END $function$;

REVOKE ALL ON FUNCTION public.consume_assistant_request(text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.assistant_quota_status(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_assistant_request(text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.assistant_quota_status(text) TO service_role;