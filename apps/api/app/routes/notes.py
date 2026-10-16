"""Per-content-block notes. One note per block, upserted in place."""
from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

from app.extensions import db
from app.models import ContentBlock, Note
from app.schemas import NoteDetail

notes_bp = Blueprint("notes", __name__, url_prefix="/api/v1")


@notes_bp.put("/content-blocks/<int:content_block_id>/note")
def upsert_note(content_block_id: int):
    content_block = db.session.get(ContentBlock, content_block_id)
    if content_block is None:
        abort(404, description="Content block not found")

    data = request.get_json(silent=True) or {}
    note_body = data.get("body")
    if not isinstance(note_body, str) or note_body.strip() == "":
        abort(400, description="body must be a non-empty string")

    note = Note.upsert(content_block_id, note_body)
    db.session.commit()

    return jsonify(NoteDetail(body=note.body, updated_at=note.updated_at).model_dump())


@notes_bp.delete("/content-blocks/<int:content_block_id>/note")
def delete_note(content_block_id: int):
    note = Note.query.filter_by(content_block_id=content_block_id).first()
    if note is None:
        abort(404, description="Note not found")

    db.session.delete(note)
    db.session.commit()

    return "", 204
