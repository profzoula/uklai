-- Deal of the Day collection (safe to re-run)
INSERT INTO collections (name, slug, description, active) VALUES
  (
    'Deal of the Day',
    'deal-of-the-day',
    'Limited-time daily deals with the biggest savings',
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active;
