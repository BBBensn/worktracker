#!/usr/bin/env python3
import re

path = '/root/bensn-hub/api.py'

with open(path, 'r') as f:
    content = f.read()

# Patch 1: break_end UPDATE – notes hinzufügen
old = (
    "            SET break_end = %s,\n"
    "                zig_spicy = %s,\n"
    "                zig_blend = %s,\n"
    "                break_type = COALESCE(%s, break_type)\n"
    "            WHERE id = %s\n"
    "            RETURNING *\n"
    "        \"\"\", (\n"
    "            break_end_ts,\n"
    "            d.get(\"zig_spicy\", 0),\n"
    "            d.get(\"zig_blend\", 0),\n"
    "            d.get(\"break_type\"),\n"
    "            break_id\n"
    "        ))"
)

new = (
    "            SET break_end = %s,\n"
    "                zig_spicy = %s,\n"
    "                zig_blend = %s,\n"
    "                break_type = COALESCE(%s, break_type),\n"
    "                notes = COALESCE(%s, notes)\n"
    "            WHERE id = %s\n"
    "            RETURNING *\n"
    "        \"\"\", (\n"
    "            break_end_ts,\n"
    "            d.get(\"zig_spicy\", 0),\n"
    "            d.get(\"zig_blend\", 0),\n"
    "            d.get(\"break_type\"),\n"
    "            d.get(\"notes\"),\n"
    "            break_id\n"
    "        ))"
)

if old in content:
    content = content.replace(old, new)
    print("✓ Patch 1: break_end notes added")
else:
    print("✗ Patch 1: pattern not found")

with open(path, 'w') as f:
    f.write(content)

print("Done")
