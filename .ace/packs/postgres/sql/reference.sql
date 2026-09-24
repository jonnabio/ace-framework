-- The catalog.sql CTE is prepended by the wrapper. No rows, DSNs or function bodies.
SELECT COALESCE(jsonb_agg(jsonb_build_object('kind',kind,'schema',namespace,'name',name,'identity',identity,'description',description)
  ORDER BY kind,namespace,name),'[]'::jsonb) FROM objects;
