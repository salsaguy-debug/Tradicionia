import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("conv_detail.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines[6300:]):
    print(f"{idx+6301}: {line}", end="")
