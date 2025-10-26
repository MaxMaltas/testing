import { FastifyInstance } from "fastify";
import { matchController } from "./matchController";

export default function matchRoutes(fastify: FastifyInstance, opts: any, done: () => void) 
{
	fastify.post("/new", matchController.newMatch);
	fastify.post("/:id/add-player", matchController.addPlayer);
	fastify.post("/:id/start", matchController.startMatch);
	fastify.post("/:id/score/:player", matchController.updateScore);
	done();// Fastify automatically returns 404 for unmatched routes
}
