-- The catalog.sql CTE is prepended by the wrapper.
SELECT COALESCE(jsonb_agg(jsonb_build_object('code',code,'identity',identity) ORDER BY code,identity),'[]'::jsonb)
FROM findings;
