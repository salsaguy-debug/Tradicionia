import os
import json

conv_id = "5825515e-2146-4038-b9d0-351ebcfe615f"
path = os.path.join(r"C:\Users\Angel A Rodriguez\.gemini\antigravity-ide\brain", conv_id, ".system_generated", "logs", "transcript.jsonl")

if os.path.exists(path):
    print("Found old transcript!")
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                source = data.get("source")
                step_type = data.get("type")
                content = data.get("content", "")
                
                # Check for model planner response or user input containing useful explanation of the fix
                if source == "MODEL" and step_type == "PLANNER_RESPONSE":
                    if "freeze" in content.lower() or "delete" in content.lower() or "fix" in content.lower():
                        print(f"STEP {data.get('step_index')} | SOURCE: {source} | TYPE: {step_type}")
                        print(content[:1000])
                        print("="*60)
                elif source == "USER_EXPLICIT" and step_type == "USER_INPUT":
                    print(f"STEP {data.get('step_index')} | SOURCE: {source} | TYPE: {step_type}")
                    print(content[:1000])
                    print("="*60)
            except Exception as e:
                pass
else:
    print(f"Not found: {path}")
