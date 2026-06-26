import urllib.request, csv

# We want to fetch the "Crosswalk" tab. 
# GID of Crosswalk can be fetched. But wait, we can just try to fetch by tab name by exporting.
# To export a specific tab by name, we can use:
# https://docs.google.com/spreadsheets/d/1u-kw9x5WJPO5NgvkH0-B8bNPWPLvVF28myNvbkc9pFk/gviz/tq?tqx=out:csv&sheet=Crosswalk
url = "https://docs.google.com/spreadsheets/d/1u-kw9x5WJPO5NgvkH0-B8bNPWPLvVF28myNvbkc9pFk/gviz/tq?tqx=out:csv&sheet=Crosswalk"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0'}
)
try:
    with urllib.request.urlopen(req) as res:
        csv_data = res.read().decode('utf-8').splitlines()
        reader = csv.reader(csv_data)
        rows = list(reader)
        headers = rows[0]
        print("CROSSWALK HEADERS:", headers)
        for r_idx, row in enumerate(rows[1:]):
            if any('rodriguez2113' in str(cell).lower() or 'angel' in str(cell).lower() for cell in row):
                print(f"Row {r_idx + 1}:")
                for c_idx, cell in enumerate(row):
                    print(f"  {headers[c_idx]} ===> {cell}")
except Exception as e:
    print("ERROR:", str(e))
