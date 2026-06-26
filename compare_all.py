import os
import re

js_path = r"c:\Users\Angel A Rodriguez\.gemini\antigravity\scratch\tradicion-ai-os\JavaScript.html"
preview_path = r"c:\Users\Angel A Rodriguez\.gemini\antigravity\scratch\tradicion-ai-os\local_preview.html"

with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

with open(preview_path, "r", encoding="utf-8") as f:
    preview_content = f.read()

def get_functions(content):
    funcs = {}
    pattern = re.compile(r"function\s+([a-zA-Z0-9_]+)\s*\(")
    for match in pattern.finditer(content):
        func_name = match.group(1)
        start_idx = match.start()
        
        brace_start = content.find("{", start_idx)
        if brace_start == -1:
            continue
            
        brace_count = 1
        i = brace_start + 1
        while brace_count > 0 and i < len(content):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
            i += 1
        
        funcs[func_name] = content[start_idx:i]
    return funcs

js_funcs = get_functions(js_content)
preview_funcs = get_functions(preview_content)

print(f"JavaScript.html function count: {len(js_funcs)}")
print(f"local_preview.html function count: {len(preview_funcs)}")

diff_impl = []
for name, body in js_funcs.items():
    if name in preview_funcs:
        # Normalize whitespace to compare logic
        norm_js = re.sub(r'\s+', '', body)
        norm_prev = re.sub(r'\s+', '', preview_funcs[name])
        if norm_js != norm_prev:
            diff_impl.append(name)

print("\n--- Functions with different logic ---")
for d in diff_impl:
    print(d)

missing_in_prev = [name for name in js_funcs if name not in preview_funcs]
missing_in_js = [name for name in preview_funcs if name not in js_funcs]

print("\n--- Missing in local_preview.html ---")
for m in missing_in_prev:
    print(m)

print("\n--- Missing in JavaScript.html ---")
for m in missing_in_js:
    print(m)
