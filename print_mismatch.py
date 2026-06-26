import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\Angel A Rodriguez\.gemini\antigravity\scratch\tradicion-ai-os\Index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('id="tab-user-guide"')
start_es = content.find('class="lang-es', start)
end_es = content.find('id="tab-sop"')

es_section = content[start_es:end_es]
lines = es_section.split('\n')
opens = 0

for idx, l in enumerate(lines):
    o = len(re.findall(r'<div\b', l))
    cl = len(re.findall(r'</div\b', l))
    old_opens = opens
    opens += o - cl
    if 1 <= idx + 1 <= 15:
        print(f"Line {idx+1} [Diff: +{o}/-{cl}, Bal: {old_opens}->{opens}]: {l.strip()[:60]}")
