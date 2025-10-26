import { FastifyRequest, FastifyReply } from "fastify";
import fastify from "fastify";
import { userController } from "./userController";
import Database from "./db"; 

const app = fastify({ logger: true });

app.get("/", async () => ({ service: "user", msg: "Hello from user!" }));


// Ruta expuesta al gateway
app.get("/profile", async (request: FastifyRequest, reply: FastifyReply) => {

  // De momento devuelve dummy data usar BD
  reply
    .code(200)
    .send({ nickname: "Max", mail: "test@test.com" });
});

app.get("/data/:id", userController.getUser);

app.get("/settings/:id", userController.getUserSettings);

app.get("/stats/:id", userController.getUserStats);

app.post("/sync", userController.syncFromAuth);

app.delete("/delete/:id?", userController.deleteSyncFromAuth);

//DEBUG 
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
        return res.code(500).send({ error: "database error en all data" });
    }
});

app.listen({ host: "0.0.0.0", port: 3002 }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
