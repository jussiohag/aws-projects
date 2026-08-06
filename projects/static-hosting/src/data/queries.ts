export interface QueryResult {
  columns: string[];
  rows: string[][];
}

export interface AthenaQuery {
  id: string;
  label: string;
  filename: string;
  sql: string;
  description: string;
  result: QueryResult;
  bytesScanned?: { format: string; bytes: string }[];
}

export const QUERIES: AthenaQuery[] = [
  {
    id: "explore-raw",
    label: "Explore Raw",
    filename: "01_explore_raw.sql",
    description: "Query raw CSV data in S3 via Athena",
    sql: `SELECT municipality, COUNT(*) as service_count
FROM helsinki_open_data.raw
GROUP BY municipality
ORDER BY service_count DESC
LIMIT 20;`,
    result: {
      columns: ["municipality", "service_count"],
      rows: [
        ["helsinki", "15234"],
        ["espoo", "3891"],
        ["vantaa", "2373"],
      ],
    },
    bytesScanned: [{ format: "CSV", bytes: "2.1 MB" }],
  },
  {
    id: "ctas-parquet",
    label: "CSV → Parquet",
    filename: "02_ctas_parquet.sql",
    description: "Convert raw CSV to partitioned Parquet with CTAS",
    sql: `CREATE TABLE helsinki_open_data.curated
WITH (
    format = 'PARQUET',
    external_location = 's3://...data-lake-.../curated/',
    partitioned_by = ARRAY['municipality']
) AS
SELECT id, name_fi, name_en, street_address_fi,
       address_zip, provider_type, latitude, longitude,
       www_fi, phone, municipality
FROM helsinki_open_data.raw;`,
    result: {
      columns: ["status"],
      rows: [["21498 rows written"]],
    },
  },
  {
    id: "query-parquet",
    label: "Query Parquet",
    filename: "03_query_parquet.sql",
    description: "Same query on Parquet — compare bytes scanned",
    sql: `SELECT municipality, COUNT(*) as service_count
FROM helsinki_open_data.curated
GROUP BY municipality
ORDER BY service_count DESC
LIMIT 20;`,
    result: {
      columns: ["municipality", "service_count"],
      rows: [
        ["helsinki", "15234"],
        ["espoo", "3891"],
        ["vantaa", "2373"],
      ],
    },
    bytesScanned: [
      { format: "CSV", bytes: "2.1 MB" },
      { format: "Parquet", bytes: "21 KB" },
    ],
  },
  {
    id: "partition-prune",
    label: "Partition Pruning",
    filename: "04_parquet_partition_prune.sql",
    description: "Partition pruning — only scans the Helsinki partition",
    sql: `SELECT name_fi, street_address_fi, provider_type
FROM helsinki_open_data.curated
WHERE municipality = 'helsinki'
LIMIT 10;`,
    result: {
      columns: ["name_fi", "street_address_fi", "provider_type"],
      rows: [
        ["Oodi", "Töölönlahdenkatu 4", "SELF_PRODUCED"],
        ["Kallion kirjasto", "Viides linja 11", "SELF_PRODUCED"],
        ["Töölön kirjasto", "Topeliuksenkatu 6", "SELF_PRODUCED"],
      ],
    },
  },
  {
    id: "iceberg-create",
    label: "Create Iceberg",
    filename: "05_iceberg_create.sql",
    description: "Create an Iceberg table with ACID support",
    sql: `CREATE TABLE helsinki_open_data.services_iceberg (
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
LOCATION 's3://...data-lake-.../iceberg/services/'
TBLPROPERTIES ('table_type' = 'ICEBERG');`,
    result: {
      columns: ["status"],
      rows: [["Table created"]],
    },
  },
  {
    id: "iceberg-insert",
    label: "Insert Data",
    filename: "06_iceberg_insert.sql",
    description: "Populate Iceberg table from raw data",
    sql: `INSERT INTO helsinki_open_data.services_iceberg
SELECT CAST(id AS BIGINT),
       name_fi, name_en, street_address_fi, address_zip,
       municipality, provider_type,
       CAST(latitude AS DOUBLE),
       CAST(longitude AS DOUBLE),
       www_fi, phone
FROM helsinki_open_data.raw;`,
    result: {
      columns: ["status"],
      rows: [["21498 rows inserted"]],
    },
  },
  {
    id: "iceberg-update",
    label: "Iceberg UPDATE",
    filename: "07_iceberg_update.sql",
    description: "UPDATE a row — impossible with plain Parquet/Hive",
    sql: `UPDATE helsinki_open_data.services_iceberg
SET name_en = 'Helsinki Central Library Oodi'
WHERE id = 62976;`,
    result: {
      columns: ["status"],
      rows: [["1 row updated"]],
    },
  },
  {
    id: "time-travel",
    label: "Time Travel",
    filename: "08_iceberg_time_travel.sql",
    description: "Query data as it was before the UPDATE",
    sql: `SELECT name_en
FROM helsinki_open_data.services_iceberg
FOR TIMESTAMP AS OF TIMESTAMP '2026-06-15 14:00:00 UTC'
WHERE id = 62976;`,
    result: {
      columns: ["name_en"],
      rows: [["(null)"]],
    },
  },
];
