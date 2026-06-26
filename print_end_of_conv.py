with open("conv_detail.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find the line that has "STEP 480"
start_line = 0
for i, line in enumerate(lines):
    if "STEP 480" in line:
        start_line = i
        break

if start_line == 0:
    start_line = max(0, len(lines) - 1000)

for line in lines[start_line:]:
    print(line, end="")
