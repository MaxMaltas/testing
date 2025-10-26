// apps/match/src/matchController.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { matchRepository } from "./matchRepository";

export const matchController = {

	newMatch(request: FastifyRequest<{ Body: { user1_id?: number; target_score?: number } }>, reply: FastifyReply)
	{
		const { user1_id, target_score } = request.body ?? {};
			if (!user1_id || !target_score)
				return reply.code(400).send({ error: "params required" });
		try
		{
			const created_at = new Date().toISOString();
			const result = matchRepository.createMatch(user1_id, target_score, created_at);
			const id = Number(result.lastInsertRowid);
			return reply.send({ id });
    	}	 
		catch (error)
		{
			request.log.error({ err: error }, "Error inserting match");
			return reply.code(500).send({ error: "database error" });
		}
	},
	addPlayer(request: FastifyRequest<{ Params: { id: string }; Body: { player2_id?: number } }>, reply: FastifyReply)
	{
		const matchId = Number(request.params.id);
		const { player2_id } = request.body ?? {};
		if (!matchId || !player2_id)
			return reply.code(400).send({ error: "params required" });
		try
		{
			matchRepository.addPlayerByMatchId(matchId, player2_id);
			return reply.send({ ok: true });
		}
		catch (error) 
		{
			request.log.error({ err: error }, "Error adding player");
			return reply.code(500).send({ error: "database error" });
		}
	},
	startMatch(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply)
	{
		const matchId = Number(request.params.id);
		if (!matchId)
			return reply.code(400).send({ error: "params required" });
		try
		{
			matchRepository.updateStatusByMatchId(matchId, "active");
			return reply.send({ ok: true });
		}
		catch (error)
		{
			request.log.error({ err: error }, "Error starting match");
			return reply.code(500).send({ error: "database error" });
		}
	},
	updateScore(request: FastifyRequest<{ Params: { id: string, player: string } }>, reply: FastifyReply)
	{
		const matchId = Number(request.params.id);
		const player = Number(request.params.player);
		if (!matchId || !player || (player !== 1 && player !== 2))
			return reply.code(400).send({ error: "params required" });
		try
		{
			if (player === 1)
				matchRepository.updateScoreP1ByMatchId(matchId);
			else
				matchRepository.updateScoreP2ByMatchId(matchId);
			return reply.send({ ok: true });
		}
		catch (error)
		{
			request.log.error({ err: error }, "Error updating score");
			return reply.code(500).send({ error: "database error" });
		}
	}
};
