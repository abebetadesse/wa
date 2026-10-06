#!/usr/bin/env python3
"""
Fetch coordinates for every (Region, Zone, District) row in a docx.

Install:
    pip install python-docx requests

Run (default: OpenStreetMap Nominatim, free):
    python scrape_ethiopia.py --docx "List of Region.docx" --out ethiopia_locations.csv

Resume is automatic: re-run and it skips rows already in the CSV.
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
from pathlib import Path
from typing import Optional

import requests
from docx import Document


# ─────────────── Configuration ───────────────

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {
    # Nominatim REQUIRES a real contact — replace with your email.
    "User-Agent": "EthiopiaLocationScraper/1.0 (you@example.com)",
    "Accept-Language": "en",
}
REQUEST_DELAY = 1.2          # Nominatim policy: <= 1 req / second
MAX_RETRIES   = 3

FIELDS = [
    "region", "zone", "district",
    "matched_query", "display_name",
    "latitude", "longitude",
    "osm_class", "osm_type",
]


# ─────────────── 1. Parse the docx ───────────────

def parse_docx_rows(docx_path: Path) -> list[tuple[str, str, str]]:
    """Return unique (region, zone, district) triples from all tables."""
    doc = Document(str(docx_path))
    rows: list[tuple[str, str, str]] = []
    seen: set[tuple[str, str, str]] = set()

    for table in doc.tables:
        prev_region = prev_zone = ""
        for row in table.rows:
            # Cells can contain line breaks — flatten them
            cells = [c.text.strip().replace("\n", " ") for c in row.cells]
            if len(cells) < 3:
                continue
            if cells[0].lower().startswith("region"):   # header row
                continue

            region, zone, district = cells[0], cells[1], cells[2]
            # Forward-fill merged cells
            if not region: region = prev_region
            if not zone:   zone   = prev_zone
            prev_region, prev_zone = region, zone

            if not (region and zone and district):
                continue

            key = (region, zone, district)
            if key not in seen:
                seen.add(key)
                rows.append(key)
    return rows


# ─────────────── 2. Nominatim lookup ───────────────

def build_queries(region: str, zone: str, district: str) -> list[str]:
    """Try most specific first, then broader fallbacks."""
    return [
        f"{district}, {zone}, {region}, Ethiopia",
        f"{district}, {region}, Ethiopia",
        f"{zone}, {region}, Ethiopia",
        f"{region}, Ethiopia",
    ]


def query_nominatim(region: str, zone: str, district: str) -> Optional[dict]:
    for q in build_queries(region, zone, district):
        for attempt in range(MAX_RETRIES):
            try:
                resp = requests.get(
                    NOMINATIM_URL,
                    params={
                        "q": q,
                        "format": "jsonv2",
                        "limit": 1,
                        "countrycodes": "et",
                        "addressdetails": 1,
                    },
                    headers=HEADERS,
                    timeout=20,
                )
                if resp.status_code == 429:
                    time.sleep(5 * (attempt + 1))
                    continue
                resp.raise_for_status()
                data = resp.json()
                if data:
                    hit = data[0]
                    return {
                        "matched_query": q,
                        "display_name": hit.get("display_name", ""),
                        "latitude":     hit.get("lat", ""),
                        "longitude":    hit.get("lon", ""),
                        "osm_class":    hit.get("category", hit.get("class", "")),
                        "osm_type":     hit.get("type", ""),
                    }
                break   # no result -> try next query variant
            except requests.RequestException as exc:
                wait = 2 ** attempt
                print(f"    retry in {wait}s ({exc})", file=sys.stderr)
                time.sleep(wait)
        time.sleep(REQUEST_DELAY)
    return None


# ─────────────── 3. Optional: Google Places API ───────────────

def query_google(region: str, zone: str, district: str, api_key: str) -> Optional[dict]:
    """Uses Google Places 'Find Place' endpoint. Requires a valid API key."""
    url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    for q in build_queries(region, zone, district):
        params = {
            "input": q,
            "inputtype": "textquery",
            "fields": "name,formatted_address,geometry",
            "key": api_key,
        }
        try:
            r = requests.get(url, params=params, timeout=20).json()
        except requests.RequestException as exc:
            print(f"    google error: {exc}", file=sys.stderr)
            continue
        if r.get("candidates"):
            c = r["candidates"][0]
            loc = c.get("geometry", {}).get("location", {})
            return {
                "matched_query": q,
                "display_name": c.get("formatted_address", c.get("name", "")),
                "latitude":  loc.get("lat", ""),
                "longitude": loc.get("lng", ""),
                "osm_class": "google",
                "osm_type":  "",
            }
        time.sleep(0.3)
    return None


# ─────────────── 4. Main ───────────────

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--docx", default="List of Region.docx")
    ap.add_argument("--out",  default="ethiopia_locations.csv")
    ap.add_argument("--source", choices=("nominatim", "google"), default="nominatim")
    ap.add_argument("--google-key", default=None,
                    help="Required when --source google")
    ap.add_argument("--limit", type=int, default=0,
                    help="Only process the first N rows (0 = all)")
    args = ap.parse_args()

    docx_path = Path(args.docx)
    out_path  = Path(args.out)

    if not docx_path.exists():
        print(f"ERROR: {docx_path} not found", file=sys.stderr)
        return 1
    if args.source == "google" and not args.google_key:
        print("ERROR: --google-key is required for --source google", file=sys.stderr)
        return 1

    rows = parse_docx_rows(docx_path)
    if args.limit:
        rows = rows[: args.limit]
    print(f"Parsed {len(rows)} unique (region, zone, district) rows.")

    # ---- Resume: skip everything already written ----
    done: set[tuple[str, str, str]] = set()
    write_header = True
    if out_path.exists():
        with out_path.open(newline="", encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                done.add((r["region"], r["zone"], r["district"]))
        write_header = False
        print(f"Resuming — {len(done)} rows already done.")

    mode = "w" if write_header else "a"
    with out_path.open(mode, newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS)
        if write_header:
            writer.writeheader()

        for i, (region, zone, district) in enumerate(rows, 1):
            if (region, zone, district) in done:
                continue

            print(f"[{i}/{len(rows)}] {region} > {zone} > {district}")

            if args.source == "nominatim":
                hit = query_nominatim(region, zone, district)
                time.sleep(REQUEST_DELAY)
            else:
                hit = query_google(region, zone, district, args.google_key)

            row = {"region": region, "zone": zone, "district": district}
            if hit:
                row.update(hit)
                print(f"    ✓ {hit['latitude']}, {hit['longitude']}")
            else:
                print("    ✗ no match")

            writer.writerow(row)
            fh.flush()   # safe to Ctrl-C and resume

    print(f"\nDone → {out_path.resolve()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())