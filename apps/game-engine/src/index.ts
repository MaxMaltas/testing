import { Fastify } from "@app/shared";

const app = Fastify({ logger: true });

app.get("/", async () => ({ service: "game-engine", msg: "Hello from game-engine!" }));

app.listen({ host: "0.0.0.0", port: 3004 }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});