import urllib.request, csv, urllib.parse

# List of sheets/tabs we know of
tabs = [
    "Profiles",
    "Tradición Performer Report Cards",
    "Inventory",
    "Attendance",
    "Tradicion_Org",
    "Buddies",
    "Quizzes",
    "Auditions",
    "App_Feedback"
]

spreadsheet_id = "1u-kw9x5WJPO5NgvkH0-B8bNPWPLvVF28myNvbkc9pFk"

for tab in tabs:
    # URL encode sheet name
    encoded_tab = urllib.parse.quote(tab)
    url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/gviz/tq?tqx=out:csv&sheet={encoded_tab}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as res:
            csv_data = res.read().decode('utf-8').splitlines()
            reader = csv.reader(csv_data)
            rows = list(reader)
            if not rows:
                continue
            headers = rows[0]
            for r_idx, row in enumerate(rows[1:]):
                for c_idx, cell in enumerate(row):
                    if 'impala' in str(cell).lower() or 'chevrolet' in str(cell).lower():
                        print(f"FOUND IN TAB '{tab}' | Row {r_idx+1} | Col '{headers[c_idx]}' ===> {cell}")
    except Exception as e:
        print(f"ERROR ON TAB '{tab}': {str(e)}")
