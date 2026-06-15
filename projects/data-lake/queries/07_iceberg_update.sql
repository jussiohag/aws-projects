-- Iceberg UPDATE — not possible with plain Hive/Parquet tables
UPDATE helsinki_open_data.services_iceberg
SET name_en = 'Helsinki Central Library Oodi'
WHERE id = 62976;
