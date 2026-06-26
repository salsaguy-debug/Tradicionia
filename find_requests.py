import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

target_ids = ["25fac7da-8d4b-43d6-8fcf-70ee3463a088"]
brain_dir = r"C:\Users\Angel A Rodriguez\.gemini\antigravity-ide\brain"

for tid in target_ids:
    path = os.path.join(brain_dir, tid, ".system_generated", "logs", "transcript.jsonl")
    if os.path.exists(path):
        print("="*60)
        print(f"Conversation: {tid}")
        print("="*60)
        with open(path, "r", encoding="utf-8") as file:
            for line in file:
                if not line.strip():
                    continue
                try:
                    data = json.loads(line)
                    if data.get("source") == "USER_EXPLICIT" and data.get("type") == "USER_INPUT":
                        print(f"[{data.get('created_at')}] User:")
                        print(data.get("content").strip())
                        print("-" * 40)
                except Exception as e:
                    pass
