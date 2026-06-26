import urllib.request
import re

url = "https://docs.google.com/spreadsheets/d/1u-kw9x5WJPO5NgvkH0-B8bNPWPLvVF28myNvbkc9pFk/htmlview"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)
try:
    with urllib.request.urlopen(req) as res:
        html = res.read().decode('utf-8')
        # Let's print out all occurrences of list items or links that look like sheets
        # In Google Sheets htmlview, tabs are represented as menu items or list items
        matches = re.findall(r'<li[^>]*sheet-button[^>]*>.*?</li>', html, re.DOTALL)
        print("MATCHES:", len(matches))
        for m in matches[:10]:
            print(m)
        
        # Let's write the html to a file to inspect it
        with open("htmlview.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Saved htmlview.html")
except Exception as e:
    print("ERROR:", str(e))
