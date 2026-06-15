-- Convert raw CSV to Parquet with partitioning
CREATE TABLE helsinki_open_data.curated
WITH (
    format = 'PARQUET',
    external_location = 's3://helsinki-data-lake-REDACTED-ACCOUNT-ID/curated/',
    partitioned_by = ARRAY['municipality']
) AS
SELECT id, name_fi, name_en, street_address_fi, address_zip,
       provider_type, latitude, longitude, www_fi, phone,
       municipality
FROM helsinki_open_data.raw;
