import re

with open('src/lib/location/ethiopianAdministrativePlaces.ts', 'r', encoding='utf-8') as f:
    text = f.read()

regions = set(re.findall(r'"region": "([^"]+)"', text))
print('Regions in ethiopianAdministrativePlaces.ts:', len(regions))
for r in sorted(regions):
    print(' -', r)
