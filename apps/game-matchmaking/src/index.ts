import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { User, loginBody, registerBody } from "./types";

type WinScore = 5 | 11 | 15 | 21;
type SpeedSetting = "slow" | "medium" | "fast";

let	activeMatches: Record<string, { p1: string, p2: string, scoreToWin: WinScore; gameSpeed: SpeedSetting }> = {};

const app: FastifyInstance = Fastify({ logger: true });

app.post("/create-remote", async (req: FastifyRequest<{ Body: { scoreToWin: WinScore; gameSpeed: SpeedSetting } }>, reply: FastifyReply) => {
	const matchId = "1234";
	activeMatches[matchId] = {
		p1: "",
		p2: "",
		scoreToWin: req.body.scoreToWin,
		gameSpeed: req.body.gameSpeed,
	}
	reply.send({ matchId });
});

app.post("/join-remote", async (req: FastifyRequest<{ Body: { user: any } }>, reply: FastifyReply) => {
	// Comprova que existeixi una sala amb la ID passada al query
	const matchId = (req.query as any).Id;
	if (!activeMatches[matchId])
		return reply.code(404).send({ error: "Match ID not found" });

	if (!activeMatches[matchId].p1)
		activeMatches[matchId].p1 = (req as any).body.user.nickname;
	else if (!activeMatches[matchId].p2)
		activeMatches[matchId].p2 = (req as any).body.user.nickname;
	else
		return reply.code(409).send({ error: "Match full" });
	console.log(`(*) ROOM <${matchId}> { <${activeMatches[matchId].p1}>, <${activeMatches[matchId].p2}> }`);
	reply.send({ msg: "joined" });
})

app.listen({ host: "0.0.0.0", port: 3005 }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});