#!/usr/bin/env python3
path = '/root/bensn-hub/api.py'

with open(path, 'r') as f:
    content = f.read()

new_endpoint = '''
@app.route("/api/break/add", methods=["POST"])
@require_api_key
def break_add():
    """Pause nachträglich zu einer Schicht hinzufügen."""
    d = request.get_json() or {}
    shift_id = d.get("shift_id")
    if not shift_id:
        return jsonify({"error": "shift_id required"}), 400

    shift = db_query("SELECT id FROM shifts WHERE id = %s AND (deleted IS NULL OR deleted = false)",
                     (shift_id,), fetchone=True)
    if not shift:
        return jsonify({"error": "Shift not found"}), 404

    row = db_query("""
        INSERT INTO breaks (shift_id, break_start, break_end, break_type, zig_spicy, zig_blend, notes, source)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """, (
        shift_id,
        d.get("break_start"),
        d.get("break_end"),
        d.get("break_type", "Pause"),
        d.get("zig_spicy", 0),
        d.get("zig_blend", 0),
        d.get("notes"),
        d.get("source", "pwa")
    ), fetchone=True)

    return jsonify({"break": dict(row)})

'''

# Insert before shift_delete
if '@app.route("/api/shift/<shift_id>", methods=["DELETE"])' in content:
    content = content.replace(
        '@app.route("/api/shift/<shift_id>", methods=["DELETE"])',
        new_endpoint + '@app.route("/api/shift/<shift_id>", methods=["DELETE"])'
    )
    print("✓ break/add endpoint added")
else:
    print("✗ insertion point not found")

with open(path, 'w') as f:
    f.write(content)
