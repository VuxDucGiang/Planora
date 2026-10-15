-- Add Music & MC category to service_categories if not exists
INSERT INTO service_categories(name)
SELECT 'Music & MC'
WHERE NOT EXISTS (
    SELECT 1 FROM service_categories WHERE name = 'Music & MC'
);
