-- Explore raw CSV data — note bytes scanned
SELECT municipality, COUNT(*) as service_count
FROM helsinki_open_data.raw
GROUP BY municipality
ORDER BY service_count DESC
LIMIT 20;
