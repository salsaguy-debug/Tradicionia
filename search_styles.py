with open("Styles.html", "r", encoding="utf-8") as f:
    content = f.read()

keywords = ["modal", "overlay", "dialog", "custom-dialog"]
for kw in keywords:
    count = content.lower().count(kw)
    print(f"Keyword '{kw}' occurs {count} times")
