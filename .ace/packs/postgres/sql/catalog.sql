-- Shared read-only catalog CTE. Bind schema arrays as psql quoted JSON values.
WITH params AS (
  SELECT ARRAY(SELECT jsonb_array_elements_text(:'owned_schemas'::jsonb)) AS owned,
         ARRAY(SELECT jsonb_array_elements_text(:'exposed_schemas'::jsonb)) AS exposed
), scope AS (
  SELECT n.* FROM pg_namespace n, params p WHERE n.nspname = ANY(p.owned)
), raw_objects AS (
  SELECT 'pg_namespace'::regclass AS classid, n.oid AS objid, 0 AS subid,
         'schema'::text AS kind, n.nspname::text AS namespace, n.nspname::text AS name,
         obj_description(n.oid,'pg_namespace') AS description
  FROM scope n
  UNION ALL
  SELECT 'pg_class'::regclass, c.oid, 0,
         CASE c.relkind WHEN 'r' THEN 'table' WHEN 'p' THEN 'partitioned table'
           WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' WHEN 'f' THEN 'foreign table'
           WHEN 'S' THEN 'sequence' ELSE 'index' END,
         n.nspname, c.relname, obj_description(c.oid,'pg_class')
  FROM pg_class c JOIN scope n ON n.oid=c.relnamespace
  WHERE c.relkind IN ('r','p','v','m','f','S','i','I')
    AND NOT (c.relkind IN ('i','I') AND EXISTS (SELECT 1 FROM pg_constraint k WHERE k.conindid=c.oid))
    AND NOT (c.relkind='S' AND EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype IN ('a','i')))
  UNION ALL
  SELECT 'pg_class'::regclass,c.oid,a.attnum,'column',n.nspname,
         format('%I.%I',c.relname,a.attname),col_description(c.oid,a.attnum)
  FROM pg_class c JOIN scope n ON n.oid=c.relnamespace JOIN pg_attribute a ON a.attrelid=c.oid
  WHERE c.relkind IN ('r','p','v','m','f') AND a.attnum>0 AND NOT a.attisdropped
  UNION ALL
  SELECT 'pg_proc'::regclass,f.oid,0,CASE f.prokind WHEN 'p' THEN 'procedure' ELSE 'function' END,
         n.nspname,format('%I(%s)',f.proname,pg_get_function_identity_arguments(f.oid)),obj_description(f.oid,'pg_proc')
  FROM pg_proc f JOIN scope n ON n.oid=f.pronamespace WHERE f.prokind IN ('f','p','w','a')
  UNION ALL
  SELECT 'pg_type'::regclass,t.oid,0,'type',n.nspname,t.typname,obj_description(t.oid,'pg_type')
  FROM pg_type t JOIN scope n ON n.oid=t.typnamespace
  LEFT JOIN pg_class c ON c.oid=t.typrelid
  WHERE t.typtype IN ('e','d','c') AND (t.typrelid=0 OR c.relkind='c')
  UNION ALL
  SELECT 'pg_constraint'::regclass,k.oid,0,'constraint',n.nspname,
         format('%I.%I',COALESCE(c.relname,t.typname),k.conname),obj_description(k.oid,'pg_constraint')
  FROM pg_constraint k JOIN scope n ON n.oid=k.connamespace
  LEFT JOIN pg_class c ON c.oid=k.conrelid LEFT JOIN pg_type t ON t.oid=k.contypid
  WHERE k.contype IN ('p','u','f','c','x')
  UNION ALL
  SELECT 'pg_policy'::regclass,p.oid,0,'policy',n.nspname,
         format('%I.%I',c.relname,p.polname),obj_description(p.oid,'pg_policy')
  FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN scope n ON n.oid=c.relnamespace
  UNION ALL
  SELECT 'pg_trigger'::regclass,t.oid,0,'trigger',n.nspname,
         format('%I.%I',c.relname,t.tgname),obj_description(t.oid,'pg_trigger')
  FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN scope n ON n.oid=c.relnamespace
  WHERE NOT t.tgisinternal
), objects AS (
  SELECT r.*, format('%s:%I.%s',kind,namespace,name) AS identity
  FROM raw_objects r
  WHERE NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid=r.classid AND d.objid=r.objid AND d.deptype='e')
    AND NOT EXISTS (
      SELECT 1 FROM pg_depend d JOIN pg_class c ON d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e'
      WHERE (r.classid='pg_policy'::regclass AND c.oid=(SELECT polrelid FROM pg_policy WHERE oid=r.objid))
         OR (r.classid='pg_trigger'::regclass AND c.oid=(SELECT tgrelid FROM pg_trigger WHERE oid=r.objid))
         OR (r.classid='pg_constraint'::regclass AND c.oid=(SELECT conrelid FROM pg_constraint WHERE oid=r.objid))
    )
), findings AS (
  SELECT 'scope'::text AS code, s AS identity FROM params p,
    unnest(p.owned || p.exposed) s
  WHERE NOT EXISTS (SELECT 1 FROM pg_namespace n WHERE n.nspname=s AND has_schema_privilege(n.oid,'USAGE'))
  UNION ALL
  SELECT 'comment',identity FROM objects WHERE description IS NULL OR description !~ '[^[:space:]]'
  UNION ALL
  SELECT 'classification',identity FROM objects WHERE kind='column' AND
    (COALESCE(description,'') !~ '(^|[[:space:];])classification:[[:space:]]*(public|internal|confidential|restricted)([[:space:];]|$)'
     OR COALESCE(description,'') !~ '(^|[[:space:];])pii:[[:space:]]*(none|personal|sensitive)([[:space:];]|$)')
  UNION ALL
  SELECT 'rls',format('%I.%I',n.nspname,c.relname)
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace, params p
  WHERE c.relkind IN ('r','p') AND NOT c.relrowsecurity
    AND (n.nspname=ANY(p.exposed) OR (n.nspname=ANY(p.owned) AND EXISTS (SELECT 1 FROM pg_policy k WHERE k.polrelid=c.oid)))
    AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e')
  UNION ALL
  SELECT 'search_path',o.identity FROM objects o JOIN pg_proc f ON o.classid='pg_proc'::regclass AND o.objid=f.oid
  WHERE f.prosecdef AND NOT EXISTS (SELECT 1 FROM unnest(f.proconfig) setting WHERE setting LIKE 'search_path=%')
)
