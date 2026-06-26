with open("htmlview.html", "r", encoding="utf-8") as f:
    html = f.read()

print("HTML LENGTH:", len(html))
# Find any tab names
import re
tabs = re.findall(r'<a href="[^"]*gid=([^"]+)"[^>]*>([^<]+)</a>', html)
print("TABS BY GID:", tabs)
if not tabs:
    # Try another search
    tabs = re.findall(r'gid=([^&"]+)[^>]*>([^<]+)<', html)
    print("TABS BY GID 2:", tabs)
