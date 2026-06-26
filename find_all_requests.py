import os
import json
import sys

brain_dir = r"C:\Users\Angel A Rodriguez\.gemini\antigravity-ide\brain"
all_requests = []

if os.path.exists(brain_dir):
    for entry in os.listdir(brain_dir):
        path = os.path.join(brain_dir, entry, ".system_generated", "logs", "transcript.jsonl")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as file:
                for line in file:
                    if not line.strip():
                        continue
                    try:
                        data = json.loads(line)
                        if data.get("source") == "USER_EXPLICIT" and data.get("type") == "USER_INPUT":
                            created_at = data.get("created_at")
                            content = data.get("content", "").strip()
                            all_requests.append({
                                "conv_id": entry,
                                "created_at": created_at,
                                "content": content
                            })
                    except Exception as e:
                        pass

# Sort by created_at
all_requests.sort(key=lambda x: x["created_at"])

output_path = "requests_history.txt"
with open(output_path, "w", encoding="utf-8") as out:
    out.write(f"Found {len(all_requests)} user requests total across all conversations:\n")
    for req in all_requests:
        out.write("="*60 + "\n")
        out.write(f"CONV: {req['conv_id']} | DATE: {req['created_at']}\n")
        out.write("="*60 + "\n")
        out.write(req['content'] + "\n\n")

print(f"Wrote requests to {output_path}")
