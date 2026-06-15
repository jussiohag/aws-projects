-- Time travel — query data as it was before the UPDATE
SELECT name_en
FROM helsinki_open_data.services_iceberg
FOR TIMESTAMP AS OF TIMESTAMP '2026-06-15 14:00:00 UTC'
WHERE id = 62976;
