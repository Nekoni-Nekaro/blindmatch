.PHONY: dev prod down logs test lint migrate seed

# ── Development ───────────────────────────────────────────────────
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# ── Production ────────────────────────────────────────────────────
prod:
	docker compose up --build -d

down:
	docker compose down

# ── Logs ──────────────────────────────────────────────────────────
logs:
	docker compose logs -f backend

logs-all:
	docker compose logs -f

# ── Database ──────────────────────────────────────────────────────
migrate:
	docker compose exec backend npm run migration:run

migrate-revert:
	docker compose exec backend npm run migration:revert

seed:
	docker compose exec backend node -e "const {RoomsService} = require('./dist/rooms/rooms.service'); console.log('Rooms seeded via app startup')"

db-shell:
	docker compose exec postgres psql -U blindmatch -d blindmatch_db

# ── Backend tests ─────────────────────────────────────────────────
test:
	cd backend && npm test

test-watch:
	cd backend && npm run test:watch

test-cov:
	cd backend && npm run test:cov

test-e2e:
	cd backend && npm run test:e2e

# ── Flutter ───────────────────────────────────────────────────────
flutter-test:
	cd frontend && flutter test

flutter-run:
	cd frontend && flutter run

flutter-build-apk:
	cd frontend && flutter build apk --release

flutter-build-ios:
	cd frontend && flutter build ipa --release

# ── Lint ──────────────────────────────────────────────────────────
lint:
	cd backend && npx eslint src --ext .ts

lint-fix:
	cd backend && npx eslint src --ext .ts --fix

# ── Docker utils ──────────────────────────────────────────────────
ps:
	docker compose ps

prune:
	docker system prune -f

rebuild:
	docker compose down && docker compose up --build -d

# ── SSL cert (dev self-signed) ────────────────────────────────────
ssl-dev:
	mkdir -p nginx/ssl
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/ssl/key.pem \
		-out nginx/ssl/cert.pem \
		-subj "/CN=localhost"
	@echo "Self-signed SSL cert created in nginx/ssl/"
