with open("htmlview.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
# Let's find any occurrences of sheet names or tab names in the HTML.
# In htmlview, sheets are listed in list items, buttons, or links, often starting with "sheet-button"
# Let's search for "Profiles", "Profile", "Sheet1", "Crosswalk", "Bailarines", "Respuestas" in the HTML.
for term in ["Profiles", "Profile", "Sheet1", "Crosswalk", "Bailarines", "Respuestas"]:
    matches = [m.start() for m in re.finditer(term, html, re.IGNORECASE)]
    print(f"Term '{term}' matches found at indices: {matches}")
