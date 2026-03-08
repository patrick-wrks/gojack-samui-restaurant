-- Reload PostgREST schema cache so new tables (e.g. raw_materials) are visible to the API.
-- Safe to run multiple times; has no lasting effect except refreshing the cache.
NOTIFY pgrst, 'reload schema';
