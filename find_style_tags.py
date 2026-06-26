with open('Styles.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'style' in line.lower():
        print(f"Line {idx+1}: {line.strip()}")
