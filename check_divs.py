import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\Angel A Rodriguez\.gemini\antigravity\scratch\tradicion-ai-os\Index.html', 'r', encoding='utf-8') as f:
    c = f.read()

start_en = c.find('id="tab-user-guide"')
start_es = c.find('class="lang-es', start_en)
end_es = c.find('id="tab-sop"')

if start_en != -1 and start_es != -1 and end_es != -1:
    es_section = c[start_es:end_es]
    
    # We want to print the lines of es_section with line numbers of es_section to see where the mismatch happens
    opens = 0
    lines = es_section.split('\n')
    for idx, l in enumerate(lines):
        o = len(re.findall(r'<div\b', l))
        cl = len(re.findall(r'</div\b', l))
        opens += o - cl
        # Print when opens is less than 0, or near headers
        if "<h4>" in l or "<h3>" in l or opens < 0:
            print(f"Line {idx+1} [Balance: {opens}]: {l.strip()}")
            if opens < 0:
                opens = 0
else:
    print("Not found")
