import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\Angel A Rodriguez\.gemini\antigravity\scratch\tradicion-ai-os\Index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if '👔 Assigned Inventory' in l:
        print(f"Line {idx+1}: {l.strip()}")
