# Data Lake Demo Results — 2026-06-15

## Infrastructure (CDK)
- S3 data bucket: `helsinki-data-lake-899659212407`
- S3 results bucket: `helsinki-data-lake-results-899659212407`
- Glue database: `helsinki_open_data`
- Glue crawler: `helsinki-raw-crawler`
- Athena workgroup: `helsinki-data-lake` (1 GB scan limit)

## Data
- Source: Helsinki service map API (hel.fi/palvelukarttaws)
- Records: 21,498 service points (25,437 rows after crawler classification)
- Fields: id, name_fi, name_en, street_address_fi, address_zip, municipality, provider_type, latitude, longitude, www_fi, phone

## Bytes Scanned Comparison
| Format | Query | Bytes Scanned | Reduction |
|--------|-------|---------------|-----------|
| Raw CSV | `GROUP BY municipality` | 3,764,820 | baseline |
| Parquet | `GROUP BY municipality` | 39,707 | **99%** |

## Iceberg Demo
- Table: `services_iceberg`
- Snapshots: 2 (append + overwrite)
- UPDATE: Changed `name_en` for Oodi library (id=51342)
- Time travel: `FOR TIMESTAMP AS OF` returned pre-update value
