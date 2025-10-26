const fetch = require("node-fetch");
import	Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import	fastifyCookie from "@fastify/cookie";
import authRoutes from './auth';
import matchRoutes from './match';
import userRoutes from './user';

const app = Fastify({ logger: true });

app.register(fastifyCookie);

app.get("/api", async (_req: FastifyRequest, _res: FastifyReply) => 
{
	return { message: "API Gateway → Try /api/health" };
});

app.get("/api/health", async () => ({ ok: true }));

app.register(authRoutes);

app.register(matchRoutes);

// User endpoints
app.register(userRoutes);

app.get("/api/user", async () => 
{
	const r = await fetch("http://user:3002/");
	return r.json() as Promise<Record<string, unknown>>;
});

app.get("/api/game-matchmaking", async () => 
{  
	const r = await fetch("http://game-matchmaking:3005/");
	return r.json() as Promise<Record<string, unknown>>;
});

app.post("/api/game-matchmaking/create-remote", async (req, reply) => {
	const	res = await fetch("http://game-matchmaking:3005/create-remote", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req.body)
	});
	const	data = await res.json();
	reply.send(data);
});

app.post("/api/game-matchmaking/join-remote", async (req, reply) => {
	const user = (req as any).user;
	const	res = await fetch(`http://game-matchmaking:3005/join-remote?Id=${(req.query as any).Id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ user })
	});
	const	data = await res.json();
	reply.code(res.status).send(data);
});

app.get("/api/game-engine", async () => 
{
	const r = await fetch("http://game-engine:3004/");
	return r.json() as Promise<Record<string, unknown>>;
});

app.listen({ host: "0.0.0.0", port: 3000 }).catch((err) => 
{
	app.log.error(err);
	process.exit(1);
});
