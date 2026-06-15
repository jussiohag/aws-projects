-- Partition pruning demo — only scans Helsinki partition
SELECT name_fi, street_address_fi, provider_type
FROM helsinki_open_data.curated
WHERE municipality = 'helsinki'
LIMIT 10;
