-- Populate Iceberg table from raw data
INSERT INTO helsinki_open_data.services_iceberg
SELECT
    CAST(id AS BIGINT),
    name_fi, name_en, street_address_fi, address_zip,
    municipality, provider_type,
    CAST(latitude AS DOUBLE),
    CAST(longitude AS DOUBLE),
    www_fi, phone
FROM helsinki_open_data.raw;
