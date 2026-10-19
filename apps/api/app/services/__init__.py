"""Domain/business logic, kept separate from route handlers (thin routes,
explicit services) per docs/ARCHITECTURE.md. Services return plain
dataclasses or ORM objects, never Pydantic schemas -- API response
shaping is the route layer's job, not the domain layer's.
"""
