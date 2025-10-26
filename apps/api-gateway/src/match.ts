import type { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginCallback } from "fastify";

const matchRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  fastify.all("/api/match/*", async (request: FastifyRequest, reply: FastifyReply) => {
    const path = (request.url || "").replace(/^\/api\/match/, "");
    const endpoint = `http://match:3003${path}`;

    const opt: RequestInit & { headers: Record<string, string> } = {
      method: request.method,
      headers: {}
    };

    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      if (request.body !== undefined && request.body !== null) {
        opt.headers["Content-Type"] = "application/json";
        opt.body = JSON.stringify(request.body);
      }
    }

    if (request.headers.cookie) {
      opt.headers.cookie = String(request.headers.cookie);
    }

    try {
      const r = await fetch(endpoint, opt);
      const setCookie = r.headers.get("set-cookie");
      if (setCookie) reply.header("set-cookie", setCookie);

      let data: unknown;
      try {
        data = await r.json();
      } catch {
        data = await r.text();
      }

      reply.code(r.status).send(data);
    } catch (error) {
      request.log.error({ err: error }, "match proxy error");
      reply.code(500).send({ error: "Proxy error" });
    }
  });

  done();
};

export default matchRoutes;
		