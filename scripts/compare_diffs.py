import zipfile
import xml.etree.ElementTree as ET
import re

with zipfile.ZipFile('List of Region.odt', 'r') as z:
    content = z.read('content.xml')
    root = ET.fromstring(content)

ns = {'table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
      'text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'}

odt_rows = []
for row in root.findall('.//table:table-row', ns)[1:]:
    cells = []
    for cell in row.findall('.//table:table-cell', ns):
        text_pieces = [''.join(p.itertext()).strip() for p in cell.findall('.//text:p', ns)]
        repeat = cell.get('{urn:oasis:names:tc:opendocument:xmlns:table:1.0}number-columns-repeated')
        val = ' '.join([t for t in text_pieces if t])
        count = int(repeat) if repeat else 1
        for _ in range(count):
            cells.append(val)
    if any(cells):
        odt_rows.append(tuple(c.strip() for c in cells[:3]))

with open('src/lib/location/ethiopianAdministrativePlaces.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'\{\s*"id":\s*"([^"]+)",\s*"region":\s*"([^"]+)",\s*"zone":\s*"([^"]+)",\s*"town":\s*"([^"]+)"', re.DOTALL)
ts_entries = pattern.findall(text)
ts_tuples = [ (e[1].strip(), e[2].strip(), e[3].strip()) for e in ts_entries ]

print(f"ODT total rows: {len(odt_rows)}, TS total entries: {len(ts_tuples)}")

odt_set = set(odt_rows)
ts_set = set(ts_tuples)
print(f"Unique ODT: {len(odt_set)}, Unique TS: {len(ts_set)}")

diff_odt = odt_set - ts_set
print(f"ODT not in TS ({len(diff_odt)}):")
for d in sorted(list(diff_odt))[:20]:
    print(" ", d)

diff_ts = ts_set - odt_set
print(f"TS not in ODT ({len(diff_ts)}):")
for d in sorted(list(diff_ts))[:20]:
    print(" ", d)
