.PHONY: up down logs test test-api test-web ps

up: ## Build and start the full stack (Postgres + api + web)
	@test -f .env || cp .env.example .env
	docker compose up --build

down: ## Stop and remove containers (keeps the Postgres volume)
	docker compose down

logs: ## Follow logs for all services
	docker compose logs -f

ps: ## Show container status
	docker compose ps

test: test-api test-web ## Run both test suites

test-api: ## Run the Flask test suite
	cd apps/api && APP_ENV=testing .venv/bin/python -m pytest

test-web: ## Run the Next.js test suite
	cd apps/web && npm test
