-- Iceberg table — native UPDATE + time-travel support
CREATE TABLE helsinki_open_data.services_iceberg (
    id BIGINT,
    name_fi STRING,
    name_en STRING,
    street_address_fi STRING,
    address_zip STRING,
    municipality STRING,
    provider_type STRING,
    latitude DOUBLE,
    longitude DOUBLE,
    www_fi STRING,
    phone STRING
)
LOCATION 's3://helsinki-data-lake-899659212407/iceberg/services/'
TBLPROPERTIES ('table_type' = 'ICEBERG');
