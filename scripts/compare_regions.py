import zipfile
import xml.etree.ElementTree as ET
import re

# Read List of Region.odt
with zipfile.ZipFile('List of Region.odt', 'r') as z:
    content = z.read('content.xml')
    root = ET.fromstring(content)

ns = {'table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
      'text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'}

odt_rows = []
for row in root.findall('.//table:table-row', ns):
    cells = []
    for cell in row.findall('.//table:table-cell', ns):
        text_pieces = []
        for p in cell.findall('.//text:p', ns):
            t = ''.join(p.itertext()).strip()
            if t: text_pieces.append(t)
        repeat = cell.get('{urn:oasis:names:tc:opendocument:xmlns:table:1.0}number-columns-repeated')
        val = ' '.join(text_pieces)
        count = int(repeat) if repeat else 1
        for _ in range(count):
            cells.append(val)
    if any(cells):
        odt_rows.append(cells)

print(f"Total ODT rows: {len(odt_rows)}")
header = odt_rows[0]
data_odt = odt_rows[1:]
print(f"Header: {header}")
print(f"Data rows: {len(data_odt)}")

# Read ethiopianAdministrativePlaces.ts
with open('src/lib/location/ethiopianAdministrativePlaces.ts', 'r', encoding='utf-8') as f:
    ts_text = f.read()

count_source = ts_text.count('"source":')
print(f"Count of 'source' in ts: {count_source}")

# Let's extract entries from ts
# Parse { "id": "...", "region": "...", "zone": "...", "town": "..." }
pattern = re.compile(r'\{\s*"id":\s*"([^"]+)",\s*"region":\s*"([^"]+)",\s*"zone":\s*"([^"]+)",\s*"town":\s*"([^"]+)"', re.DOTALL)
ts_entries = pattern.findall(ts_text)
print(f"Regex extracted entries from ts: {len(ts_entries)}")

# Compare entries
odt_tuples = set((r[0].strip(), r[1].strip(), r[2].strip()) for r in data_odt if len(r) >= 3)
ts_tuples = set((e[1].strip(), e[2].strip(), e[3].strip()) for e in ts_entries)

print(f"Unique ODT tuples (Region, Zone, District): {len(odt_tuples)}")
print(f"Unique TS tuples (Region, Zone, Town): {len(ts_tuples)}")

diff_odt_not_in_ts = odt_tuples - ts_tuples
diff_ts_not_in_odt = ts_tuples - odt_tuples

print(f"In ODT but not in TS: {len(diff_odt_not_in_ts)}")
if diff_odt_not_in_ts:
    print("Sample in ODT but not in TS:", list(diff_odt_not_in_ts)[:10])

print(f"In TS but not in ODT: {len(diff_ts_not_in_odt)}")
if diff_ts_not_in_odt:
    print("Sample in TS but not in ODT:", list(diff_ts_not_in_odt)[:10])
