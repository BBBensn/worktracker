#!/bin/bash
# Fügt cafe_puls zu shift/start und shift/correct hinzu
# Ausführen: bash patch_cafe_puls.sh

API=/root/bensn-hub/api.py

# Backup
cp $API ${API}.bak
echo "✓ Backup: ${API}.bak"

# 1. cafe_puls in INSERT INTO shifts
python3 - <<'EOF'
import re

with open('/root/bensn-hub/api.py', 'r') as f:
    content = f.read()

# Add cafe_puls to INSERT columns
old_insert = """        INSERT INTO shifts (
            work_start, shift_type, station, service_label,
            is_duo_service, duo_partner_station,
            has_training, training_note, source
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""

new_insert = """        INSERT INTO shifts (
            work_start, shift_type, station, service_label,
            is_duo_service, duo_partner_station,
            has_training, training_note, source, cafe_puls
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

content = content.replace(old_insert, new_insert)

# Add cafe_puls to the values tuple
old_values = """        d.get("source", "shortcut")
    ))"""

new_values = """        d.get("source", "shortcut"),
        d.get("cafe_puls", False)
    ))"""

content = content.replace(old_values, new_values)

# Add cafe_puls to allowed fields in shift_correct
old_allowed = '    allowed = ["work_start", "work_end", "shift_type", "station",\n               "service_label", "is_duo_service", "duo_partner_station",\n               "has_training", "training_note", "notes"]'
new_allowed = '    allowed = ["work_start", "work_end", "shift_type", "station",\n               "service_label", "is_duo_service", "duo_partner_station",\n               "has_training", "training_note", "notes", "cafe_puls"]'

content = content.replace(old_allowed, new_allowed)

with open('/root/bensn-hub/api.py', 'w') as f:
    f.write(content)

print("✓ api.py patched")
EOF

# Restart API
cd /root/bensn-hub && docker compose restart bensn-api
echo "✓ API restarted"
