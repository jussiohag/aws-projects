-- Same query on Parquet — compare bytes scanned vs raw CSV
SELECT municipality, COUNT(*) as service_count
FROM helsinki_open_data.curated
GROUP BY municipality
ORDER BY service_count DESC
LIMIT 20;
