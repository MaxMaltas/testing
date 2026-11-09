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
	@echo "Certs:  make certs (self-signed dev certificate, created automatically)"

# ---- Dev TLS certificate (not versioned, generated locally) ----
CERT_DIR := apps/nginx/certs

.PHONY: certs
certs: $(CERT_DIR)/dev.crt

$(CERT_DIR)/dev.crt:
	@mkdir -p $(CERT_DIR)
	openssl req -x509 -nodes -newkey rsa:2048 -days 365 -subj "/CN=localhost" \
		-keyout $(CERT_DIR)/dev.key -out $(CERT_DIR)/dev.crt

# Every target that builds or starts nginx needs the certificate
up up-d build re dev-up dev-up-d dev-re dev-build: certs

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
up-%: certs
	$(DC) $(BASE) up -d --build $*
build-%: certs
	$(DC) $(BASE) build $*
re-%: certs
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