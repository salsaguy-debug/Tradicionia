import re

with open(r'c:\Users\Angel A Rodriguez\.gemini\antigravity\scratch\tradicion-ai-os\Index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('id="tab-user-guide"')
start_es = content.find('class="lang-es', start)
end_es = content.find('id="tab-sop"')

es_section = content[start_es:end_es]

# Find all occurrences of '<div class="guide-section">' and their corresponding closing divs.
# We will do this by scanning line by line and identifying the start and end of each guide-section.
lines = es_section.split('\n')
section_idx = 0
in_section = False
sec_opens = 0
sec_lines = []

for idx, line in enumerate(lines):
    if '<div class="guide-section">' in line or '<div class="guide-section"' in line:
        in_section = True
        sec_opens = 1
        sec_lines = [line.strip()]
        section_idx += 1
        print(f"\n--- Section {section_idx} Start (Line {idx+1}) ---")
        continue
    
    if in_section:
        sec_lines.append(line.strip())
        o = len(re.findall(r'<div\b', line))
        cl = len(re.findall(r'</div\b', line))
        sec_opens += o - cl
        if sec_opens == 0:
            print(f"Section {section_idx} closed cleanly on Line {idx+1}")
            in_section = False
        elif sec_opens < 0:
            print(f"ERROR: Section {section_idx} closed early on Line {idx+1} (Bal: {sec_opens})")
            print("Lines in this section:")
            for l in sec_lines:
                print("  ", l)
            in_section = False
