import { User } from "./types";
import getInstance from "./db";

export const matchRepository = 
{
	createMatch(player1_id: number, target_score: number, created_at: string)
	{
		const db = getInstance().db;
		return (db.prepare("INSERT INTO match_data(player1_id, target_score, created_at, status) VALUES (?, ?, ?, 'pending')").run(player1_id, target_score, created_at));
	},
	addPlayerByMatchId(matchid: number, playerId: number) 
	{
		const db = getInstance().db;
		return (db.prepare("UPDATE match_data SET player2_id = ? WHERE id = ?").run(playerId, matchid));
	},
	updateStatusByMatchId(matchid: number, status: string)
	{
		const db = getInstance().db;
		return(db.prepare("UPDATE match_data SET status = ? WHERE id = ?").run(status, matchid))
	},
	updateScoreP1ByMatchId(matchid: number)
	{
		const db = getInstance().db;
			return(db.prepare("UPDATE match_data SET player1_score = player1_score + 1 WHERE id = ?").run(matchid))
	},
	updateScoreP2ByMatchId(matchid: number)
	{
		const db = getInstance().db;
			return(db.prepare("UPDATE match_data SET player2_score = player2_score + 1 WHERE id = ?").run(matchid))
	}

};