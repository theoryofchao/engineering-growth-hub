"""One-off sync: backfill content/curriculum/curriculum-map.json's
per-module "prerequisites" field from CURRICULUM.md's text.

CURRICULUM.md is the canonical, hand-authored source for the 80-module
map (titles, tiers, descriptions, and prerequisites), but curriculum-map.json
is what app/seed.py actually loads into the database -- and it has never
carried prerequisite data. Re-run this whenever CURRICULUM.md's
Prerequisites lines change; it is not invoked by the app or by CI.

Edits curriculum-map.json with a targeted per-line regex splice rather
than a full json.loads/json.dumps round-trip, because the file is
deliberately one compact line per module -- a full reformat would turn
an 80-entry data change into an unreviewable formatting diff.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
CURRICULUM_MD = REPO_ROOT / "CURRICULUM.md"
CURRICULUM_MAP = REPO_ROOT / "content" / "curriculum" / "curriculum-map.json"

MODULE_HEADING_RE = re.compile(r"^#### (\d{2}) — ")
PREREQUISITES_LINE_RE = re.compile(r"^- \*\*Prerequisites:\*\* (.+)$")
PREREQUISITE_ID_RE = re.compile(r"`(\d{2})`")
MAP_MODULE_LINE_RE = re.compile(r'^(\s*\{"id":\s*(\d+).*?)(\})(,?)\s*$')


def parse_prerequisites(text: str) -> dict[int, list[int]]:
    prereqs_by_id: dict[int, list[int]] = {}
    current_id: int | None = None

    for line in text.splitlines():
        heading_match = MODULE_HEADING_RE.match(line)
        if heading_match:
            current_id = int(heading_match.group(1))
            continue

        prereq_match = PREREQUISITES_LINE_RE.match(line)
        if prereq_match and current_id is not None:
            if current_id in prereqs_by_id:
                raise ValueError(f"Module {current_id:02d} has more than one Prerequisites line")
            raw = prereq_match.group(1).strip()
            if raw == "None":
                prereqs_by_id[current_id] = []
            else:
                prereqs_by_id[current_id] = [int(m) for m in PREREQUISITE_ID_RE.findall(raw)]
            current_id = None

    return prereqs_by_id


def splice_prerequisites_into_map(map_text: str, prereqs_by_id: dict[int, list[int]]) -> str:
    seen_ids: set[int] = set()
    out_lines = []

    for line in map_text.splitlines():
        match = MAP_MODULE_LINE_RE.match(line)
        if match is None:
            out_lines.append(line)
            continue

        before_brace, module_id_str, _brace, trailing_comma = match.groups()
        module_id = int(module_id_str)
        if module_id not in prereqs_by_id:
            raise ValueError(f"curriculum-map.json module {module_id} has no CURRICULUM.md match")
        seen_ids.add(module_id)

        prereqs_json = json.dumps(prereqs_by_id[module_id])
        out_lines.append(f'{before_brace}, "prerequisites": {prereqs_json}}}{trailing_comma}')

    missing = set(prereqs_by_id) - seen_ids
    if missing:
        raise ValueError(f"CURRICULUM.md modules not found in curriculum-map.json: {sorted(missing)}")

    return "\n".join(out_lines) + "\n"


def main() -> None:
    prereqs_by_id = parse_prerequisites(CURRICULUM_MD.read_text())
    if len(prereqs_by_id) != 80 or set(prereqs_by_id) != set(range(1, 81)):
        raise ValueError(
            f"Expected modules 1..80 with exactly one Prerequisites line each, "
            f"got {len(prereqs_by_id)} modules: {sorted(prereqs_by_id)}"
        )

    original_text = CURRICULUM_MAP.read_text()
    updated_text = splice_prerequisites_into_map(original_text, prereqs_by_id)

    data = json.loads(updated_text)
    all_modules = [m for d in data["domains"] for m in d["modules"]]
    if len(all_modules) != 80:
        raise ValueError(f"Expected 80 modules after splice, got {len(all_modules)}")
    for module in all_modules:
        expected = prereqs_by_id[module["id"]]
        if module.get("prerequisites") != expected:
            raise ValueError(
                f"Module {module['id']} prerequisites mismatch: "
                f"expected {expected}, got {module.get('prerequisites')}"
            )

    CURRICULUM_MAP.write_text(updated_text)
    print(f"Synced prerequisites for {len(all_modules)} modules into {CURRICULUM_MAP}")


if __name__ == "__main__":
    main()
