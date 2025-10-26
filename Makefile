DC := docker compose
BASE := -p prod -f docker-compose.yml
DEV  := -p dev -f docker-compose.yml -f docker-compose.override.yml

.PHONY: help \
        up up-d down build re logs clean fclean \
        up-% build-% re-% logs-% restart-% stop-% sh-% \
        dev-up dev-build dev-down dev-logs

help:
	@echo "Prod:   make up | up-d | down | build | re | logs"
	@echo "Dev:    make dev-up | dev-build | dev-down | dev-logs"
	@echo "Per-svc: up-<svc> build-<svc> re-<svc> logs-<svc> restart-<svc> stop-<svc> sh-<svc>"

# ---- Production (base only) ----
up:
	$(DC) $(BASE) up --build
up-d:
	$(DC) $(BASE) up -d --build
down:
	$(DC) $(BASE) down -v
build:
	$(DC) $(BASE) build
re:
	$(DC) $(BASE) build --no-cache
	$(DC) $(BASE) up
logs:
	$(DC) $(BASE) logs -f

# ---- Dev (with override: hot reload) ----
dev-up:
	$(DC) $(DEV) up --build
dev-up-d:
	$(DC) $(DEV) up -d --build
dev-re:
	$(DC) $(DEV) build --no-cache
	$(DC) $(DEV) up
dev-build:
	$(DC) $(DEV) build
dev-re:
	$(DC) $(DEV) build --no-cache
	$(DC) $(DEV) up
dev-down:
	$(DC) $(DEV) down
dev-logs:
	$(DC) $(DEV) logs -f

# ---- Per-service (prod by default) ----
up-%:
	$(DC) $(BASE) up -d --build $*
build-%:
	$(DC) $(BASE) build $*
re-%:
	$(DC) $(BASE) build --no-cache $*
	$(DC) $(BASE) up -d $*
logs-%:
	$(DC) $(BASE) logs -f $*
restart-%:
	$(DC) $(BASE) restart $*
stop-%:
	$(DC) $(BASE) stop $* || true && $(DC) $(BASE) rm -f $* || true
sh-%:
	$(DC) $(BASE) exec $* /bin/sh

clean:
	rm -rf node_modules apps/**/node_modules web/node_modules web/dist

fclean:
	$(DC) down -v
	$(DC) $(DEV) down -v
	$(DC) ${BASE} down -v
	rm -rf node_modules apps/**/node_modules web/node_modules web/dist
	docker system prune -f