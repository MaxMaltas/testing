import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { User, loginBody, registerBody } from "./types";
import matchRoutes from "./routes"; // Importar rutas modulares
import Database from "./db"; // Importar conexión a BD

type WinScore = 5 | 11 | 15 | 21;
type SpeedSetting = "slow" | "medium" | "fast";

let	activeMatches: Record<string, { p1: string, p2: string, scoreToWin: WinScore; gameSpeed: SpeedSetting }> = {};

const app: FastifyInstance = Fastify({ logger: true });

// app.get("/", async () => ({ service: "match", msg: "Hello from match!" }));

app.register(matchRoutes);

app.get("/debug/all-data", async (req: FastifyRequest, res: FastifyReply) => 
{
	try 
	{
        const db = Database().db;
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{name: string}>;
        const allData: Record<string, any[]> = {};    
        for (const table of tables) 
		{
            const tableName = table.name;
            if (!tableName.startsWith('sqlite_')) 
			{
                const tableData = db.prepare(`SELECT * FROM ${tableName}`).all();
                allData[tableName] = tableData;
            }
        }
        return res.send({ allData });
    } 
	catch (err) 
	{
        console.error('Error fetching all data:', err);
        return res.code(500).send({ error: "database error" });
    }
});

app.listen({ host: "0.0.0.0", port: 3003 }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});