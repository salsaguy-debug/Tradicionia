import json

log_file = r"C:\Users\Angel A Rodriguez\.gemini\antigravity-ide\brain\7a80866d-2744-4ac9-ba80-302f004330bb\.system_generated\logs\transcript.jsonl"
try:
    with open(log_file, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            data = json.loads(line)
            # Look for tool calls or content containing Chevrolet or Impala
            content_str = str(data.get("content", ""))
            tool_calls = str(data.get("tool_calls", ""))
            if "Chevrolet" in content_str or "Impala" in content_str or "Chevrolet" in tool_calls or "Impala" in tool_calls:
                print("STEP INDEX:", data.get("step_index"))
                print("SOURCE:", data.get("source"))
                print("TYPE:", data.get("type"))
                print("CONTENT SNIPPET:", content_str[:500])
                print("-" * 50)
except Exception as e:
    print("ERROR:", str(e))
