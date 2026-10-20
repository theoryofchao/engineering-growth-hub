"""Competency catalog and STAR-method leadership story CRUD."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

from app.models import LeadershipStory, Section
from app.schemas import CompetencySummary, LeadershipStoryDetail, LeadershipStorySummary
from app.services import leadership_service

leadership_bp = Blueprint("leadership", __name__, url_prefix="/api/v1/leadership")


def _competency_summary(section: Section) -> CompetencySummary:
    return CompetencySummary(
        id=section.id, title=section.title, slug=section.slug, description=section.description
    )


def _story_summary(story: LeadershipStory) -> LeadershipStorySummary:
    return LeadershipStorySummary(
        id=story.id,
        title=story.title,
        competency=_competency_summary(story.section),
        result=story.result,
        created_at=story.created_at,
        updated_at=story.updated_at,
    )


def _story_detail(story: LeadershipStory) -> LeadershipStoryDetail:
    return LeadershipStoryDetail(
        id=story.id,
        title=story.title,
        competency=_competency_summary(story.section),
        situation=story.situation,
        task=story.task,
        action=story.action,
        result=story.result,
        reflection=story.reflection,
        quantified_outcome=story.quantified_outcome,
        created_at=story.created_at,
        updated_at=story.updated_at,
    )


@leadership_bp.get("/competencies")
def list_competencies():
    competencies = leadership_service.list_competencies()
    return jsonify([_competency_summary(t).model_dump() for t in competencies])


@leadership_bp.get("/stories")
def list_stories():
    competency_id = request.args.get("competency_id", type=int)
    stories = leadership_service.list_stories(competency_id)
    return jsonify([_story_summary(s).model_dump() for s in stories])


@leadership_bp.post("/stories")
def create_story():
    data = request.get_json(silent=True) or {}

    try:
        story = leadership_service.create_story(
            section_id=data.get("section_id"),
            title=data.get("title"),
            situation=data.get("situation"),
            task=data.get("task"),
            action=data.get("action"),
            result=data.get("result"),
            reflection=data.get("reflection"),
            quantified_outcome=data.get("quantified_outcome"),
        )
    except ValueError as error:
        abort(400, description=str(error))

    return jsonify(_story_detail(story).model_dump()), 201


@leadership_bp.get("/stories/<int:story_id>")
def get_story(story_id: int):
    story = leadership_service.get_story(story_id)
    if story is None:
        abort(404, description="Leadership story not found")

    return jsonify(_story_detail(story).model_dump())


@leadership_bp.patch("/stories/<int:story_id>")
def update_story(story_id: int):
    data = request.get_json(silent=True) or {}
    fields = {
        key: value
        for key, value in data.items()
        if key
        in (
            "section_id",
            "title",
            "situation",
            "task",
            "action",
            "result",
            "reflection",
            "quantified_outcome",
        )
    }

    try:
        story = leadership_service.update_story(story_id, **fields)
    except ValueError as error:
        abort(400, description=str(error))

    if story is None:
        abort(404, description="Leadership story not found")

    return jsonify(_story_detail(story).model_dump())


@leadership_bp.delete("/stories/<int:story_id>")
def delete_story(story_id: int):
    deleted = leadership_service.delete_story(story_id)
    if not deleted:
        abort(404, description="Leadership story not found")

    return "", 204
