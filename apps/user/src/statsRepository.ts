import { Stats } from "./types";
import getInstance from "./db";

export const statsRepository =
{
    findById(id: number): Stats | undefined 
    {
        const db = getInstance().db;
        return db.prepare("SELECT * FROM stats WHERE id = ?").get(id) as Stats | undefined;
    },
    createStatsWithId(id: number, last_match_at: string)
    {
        const db = getInstance().db;
    	return (db.prepare("INSERT INTO stats(id, last_match_at) VALUES (?, ?)").run(id, last_match_at));
    },
    updateMatchesPlayedById(id: number, matches_played: number) 
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE stats SET matches_played = ? WHERE id = ?").run(matches_played, id));
    },
    updateWinsById(id: number, wins: number) 
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE stats SET wins = ? WHERE id = ?").run(wins, id));
    },
    updateLossesById(id: number, losses: number)
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE stats SET losses = ? WHERE id = ?").run(losses, id));
    },
    updatePointsScoredById(id: number, points_scored: number)
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE stats SET points_scored = ? WHERE id = ?").run(points_scored, id));
    },
    updatePointsConcededById(id: number, points_conceded: number)
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE stats SET points_conceded = ? WHERE id = ?").run(points_conceded, id));
    },
    /*updateLastMatchAtById(id: number, last_match_at: number) DUPLICADO match
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE stats SET last_match_at = ? WHERE id = ?").run(last_match_at, id));
    },*/
    deleteById(id: number)
    {
        const db = getInstance().db;
        return (db.prepare("DELETE FROM stats WHERE id = ?").run(id));
    }
}