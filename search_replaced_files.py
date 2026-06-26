with open("conv_detail.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "replace_file_content" in line or "write_to_file" in line or "multi_replace_file_content" in line:
        # Print surrounding 10 lines
        start = max(0, i - 2)
        end = min(len(lines), i + 8)
        print(f"--- MATCH AT LINE {i+1} ---")
        for j in range(start, end):
            print(f"{j+1}: {lines[j]}", end="")
        print("\n")
