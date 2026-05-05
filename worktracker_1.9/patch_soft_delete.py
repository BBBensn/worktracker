#!/usr/bin/env python3
"""
Patch api.py:
1. Add DELETE /api/shift/<id> endpoint (soft delete)
2. Add DELETE /api/break/<id> endpoint (soft delete)
3. Filter deleted=false in shifts/breaks queries
"""

path = '/root/bensn-hub/api.py'

with open(path, 'r') as f:
    content = f.read()

# ── 1. Filter deleted shifts in GET /api/shifts ──
old1 = '''        SELECT s.id, s.work_start, s.work_end, s.shift_type, s.station,
               s.service_label, s.is_duo_service, s.duo_partner_station,
               s.has_training, s.corrected, s.notes,
               s.cafe_puls,
               COALESCE(SUM(EXTRACT(EPOCH FROM (b.break_end - b.break_start))/60)::int, 0) AS total_break_minutes,
                    SUM(zig_spicy + zig_blend) AS zig_total'''

new1 = '''        SELECT s.id, s.work_start, s.work_end, s.shift_type, s.station,
               s.service_label, s.is_duo_service, s.duo_partner_station,
               s.has_training, s.corrected, s.notes,
               s.cafe_puls,
               COALESCE(SUM(EXTRACT(EPOCH FROM (b.break_end - b.break_start))/60)::int, 0) AS total_break_minutes,
                    SUM(zig_spicy + zig_blend) AS zig_total'''

# Filter in shifts list query
old2 = '        FROM shifts s\n        LEFT JOIN breaks b ON b.shift_id = s.id\n        GROUP BY s.id\n        ORDER BY s.work_start DESC\n        LIMIT %s'
new2 = '        FROM shifts s\n        LEFT JOIN breaks b ON b.shift_id = s.id AND (b.deleted IS NULL OR b.deleted = false)\n        WHERE (s.deleted IS NULL OR s.deleted = false)\n        GROUP BY s.id\n        ORDER BY s.work_start DESC\n        LIMIT %s'

if old2 in content:
    content = content.replace(old2, new2)
    print('✓ Patch 1: shifts list filter deleted')
else:
    print('✗ Patch 1: pattern not found')

# Filter breaks in shift_get
old3 = '    breaks = db_query("""\n        SELECT * FROM breaks\n        WHERE shift_id = %s\n        ORDER BY break_start ASC\n    """, (shift_id,))'
new3 = '    breaks = db_query("""\n        SELECT * FROM breaks\n        WHERE shift_id = %s AND (deleted IS NULL OR deleted = false)\n        ORDER BY break_start ASC\n    """, (shift_id,))'

if old3 in content:
    content = content.replace(old3, new3)
    print('✓ Patch 2: breaks filter deleted in shift_get')
else:
    print('✗ Patch 2: pattern not found')

# Filter current shift breaks
old4 = '    breaks = db_query("""\n        SELECT * FROM breaks WHERE shift_id = %s ORDER BY break_start\n    """, (shift[\'id\'],))'
new4 = '    breaks = db_query("""\n        SELECT * FROM breaks WHERE shift_id = %s AND (deleted IS NULL OR deleted = false) ORDER BY break_start\n    """, (shift[\'id\'],))'

if old4 in content:
    content = content.replace(old4, new4)
    print('✓ Patch 3: breaks filter deleted in current shift')
else:
    print('✗ Patch 3: pattern not found - trying alternative')
    # Try alternative pattern
    old4b = "    breaks = db_query(\"\"\"\n        SELECT * FROM breaks WHERE shift_id = %s ORDER BY break_start\n    \"\"\", (shift['id'],))"
    new4b = "    breaks = db_query(\"\"\"\n        SELECT * FROM breaks WHERE shift_id = %s AND (deleted IS NULL OR deleted = false) ORDER BY break_start\n    \"\"\", (shift['id'],))"
    if old4b in content:
        content = content.replace(old4b, new4b)
        print('✓ Patch 3b: breaks filter deleted in current shift')
    else:
        print('✗ Patch 3b: also not found, skipping')

# Filter current active shift
old5 = '    shift = db_query("""\n        SELECT * FROM shifts\n        WHERE work_end IS NULL\n        ORDER BY work_start DESC LIMIT 1\n    """, one=True)'
new5 = '    shift = db_query("""\n        SELECT * FROM shifts\n        WHERE work_end IS NULL AND (deleted IS NULL OR deleted = false)\n        ORDER BY work_start DESC LIMIT 1\n    """, one=True)'

if old5 in content:
    content = content.replace(old5, new5)
    print('✓ Patch 4: current shift filter deleted')
else:
    print('✗ Patch 4: pattern not found')

# ── 2. Add DELETE endpoints before the if __name__ block ──
delete_endpoints = '''

@app.route("/api/shift/<shift_id>", methods=["DELETE"])
def shift_delete(shift_id):
    shift = db_query("SELECT id FROM shifts WHERE id = %s", (shift_id,), one=True)
    if not shift:
        return jsonify({"error": "Shift not found"}), 404
    db_query("UPDATE shifts SET deleted = true WHERE id = %s", (shift_id,))
    db_query("UPDATE breaks SET deleted = true WHERE shift_id = %s", (shift_id,))
    return jsonify({"status": "deleted", "id": shift_id})


@app.route("/api/break/<break_id>", methods=["DELETE"])
def break_delete(break_id):
    brk = db_query("SELECT id FROM breaks WHERE id = %s", (break_id,), one=True)
    if not brk:
        return jsonify({"error": "Break not found"}), 404
    db_query("UPDATE breaks SET deleted = true WHERE id = %s", (break_id,))
    return jsonify({"status": "deleted", "id": break_id})

'''

# Insert before if __name__
if 'if __name__' in content:
    content = content.replace('if __name__', delete_endpoints + 'if __name__')
    print('✓ Patch 5: DELETE endpoints added')
else:
    print('✗ Patch 5: if __name__ not found')

with open(path, 'w') as f:
    f.write(content)

print('\nAll patches applied.')
