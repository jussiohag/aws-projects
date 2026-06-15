#!/usr/bin/env python3
"""Download Helsinki service map data and save as CSV for the data lake."""

import csv
import json
import sys
import urllib.request

API_URL = "https://www.hel.fi/palvelukarttaws/rest/v4/unit/"
PARAMS = "?format=json&page_size=1000"
OUTPUT = "helsinki_service_points.csv"

FIELDS = [
    "id",
    "name_fi",
    "name_en",
    "street_address_fi",
    "address_zip",
    "municipality",
    "provider_type",
    "latitude",
    "longitude",
    "www_fi",
    "phone",
]


def fetch_all():
    """Fetch all service points, paginating through results."""
    url = API_URL + PARAMS
    all_units = []
    page = 1

    while url:
        print(f"Fetching page {page}...", file=sys.stderr)
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        if isinstance(data, list):
            all_units.extend(data)
            break
        elif isinstance(data, dict) and "results" in data:
            all_units.extend(data["results"])
            url = data.get("next")
            page += 1
        else:
            all_units.extend(data if isinstance(data, list) else [data])
            break

    return all_units


def to_csv(units, output_path):
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")
        writer.writeheader()
        for unit in units:
            row = {}
            for field in FIELDS:
                val = unit.get(field, "")
                if isinstance(val, (list, dict)):
                    val = json.dumps(val, ensure_ascii=False)
                row[field] = val if val is not None else ""
            # Extract lat/lon from location if present
            if not row.get("latitude") and "location" in unit and unit["location"]:
                loc = unit["location"]
                if isinstance(loc, dict) and "coordinates" in loc:
                    coords = loc["coordinates"]
                    row["longitude"] = coords[0] if len(coords) > 0 else ""
                    row["latitude"] = coords[1] if len(coords) > 1 else ""
            writer.writerow(row)
    return len(units)


if __name__ == "__main__":
    units = fetch_all()
    count = to_csv(units, OUTPUT)
    print(f"Saved {count} service points to {OUTPUT}")
