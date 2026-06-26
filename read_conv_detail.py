import os
import json

conv_id = "dde22ca1-f2ef-4eb2-8a5d-43271c329658"
path = os.path.join(r"C:\Users\Angel A Rodriguez\.gemini\antigravity-ide\brain", conv_id, ".system_generated", "logs", "transcript.jsonl")
output_path = "conv_detail.txt"

with open(output_path, "w", encoding="utf-8") as out:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as file:
            for line in file:
                if not line.strip():
                    continue
                try:
                    data = json.loads(line)
                    source = data.get("source")
                    step_type = data.get("type")
                    content = data.get("content", "")
                    tool_calls = data.get("tool_calls", [])
                    
                    out.write("="*60 + "\n")
                    out.write(f"STEP {data.get('step_index')} | SOURCE: {source} | TYPE: {step_type}\n")
                    out.write("="*60 + "\n")
                    if content:
                        out.write("CONTENT:\n")
                        out.write(content[:1500] + "\n") # Limit length per step to keep file readable
                    if tool_calls:
                        out.write("TOOL CALLS:\n")
                        for tc in tool_calls:
                            out.write(f"  {tc.get('name')} -> {tc.get('arguments')}\n")
                    out.write("\n")
                except Exception as e:
                    pass
    else:
        out.write(f"Path does not exist: {path}\n")
print("Wrote to conv_detail.txt")
