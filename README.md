# testing
42 Project - Full-stack multiplayer Pong web app with real-time gameplay, authentication (OAuth, JWT, 2FA), microservices, Docker, and security modules.

## Development certificate

nginx serves HTTPS with a self-signed certificate for `localhost`. It is not
committed: `make up`, `make dev-up` and the other build targets generate it in
`apps/nginx/certs/` the first time (requires `openssl`). Run `make certs` to
create it by hand.
