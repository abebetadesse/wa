import re

ts = open('src/lib/location/ethiopianAdministrativePlaces.ts', encoding='utf-8').read()

# Check for specific entries from the user's pasted list
check = [
    ('Sheger', 'Sheger', 'Sida Awash'),
    ('Addis Ababa', 'Addis Ketema', 'Wereda 01'),
    ('Addis Ababa', 'Addis Ketema', 'Wereda 03'),
    ('Addis Ababa', 'Akaki Kaliti', 'Wereda 01'),
    ('Addis Ababa', 'Lideta', 'Wereda 10'),
    ('Addis Ababa', 'Lemi kura', 'Wereda 06'),
    ('Addis Ababa', 'Lemi Kura', 'Wereda 06'),
]

for region, zone, district in check:
    found = district.lower() in ts.lower() and zone.lower() in ts.lower()
    status = "OK" if found else "MISSING"
    print(f'  [{status}] {region} / {zone} / {district}')

# Also check Sheger specifically
print("\nSheger entries in TS:")
for line in ts.split('\n'):
    if 'sheger' in line.lower():
        print(' ', line.strip())
