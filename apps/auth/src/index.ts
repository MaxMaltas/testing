import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import userRoutes from "./routes"; // Importar rutas modulares
import Database from "./db"; // Importar conexión a BD
import fastifyCookie from "@fastify/cookie";
import OAuth2 from '@fastify/oauth2';

const app: FastifyInstance = Fastify({ logger: true });

// Registro de Cookies en fastify (firmadas con COOKIE_SECRET)
app.register(fastifyCookie, 
{
    secret: process.env.COOKIE_SECRET as string,
    parseOptions: {
      httpOnly: true,
      secure: true,         // obligatorio detrás de HTTPS (tu nginx sirve 443)
	  sameSite: "strict",   // “same-site”: perfecto porque SPA y API comparten origin
      path: "/api/auth", // path común a todas las rutas de auth
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
});

//Registro de OAuth con Google
app.register(OAuth2, {
    name: 'googleOAuth2',
    scope: ["openid", "email", "profile"],
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID as string,
            secret: process.env.GOOGLE_CLIENT_SECRET as string
        },
        auth: OAuth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/oauth/google", // Endpoint para iniciar OAuth
    callbackUri: "https://localhost:4443/api/auth/oauth/google/callback"
});

// Registrar rutas modulares
app.register(userRoutes);

app.get("/health", async (req: FastifyRequest, res: FastifyReply) => 
{
	res.code(200).send({status: "Ok"});
});

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
        console.error("\x1b[31m%s\x1b[0m", 'Error fetching all data:', err);
        return res.code(500).send({ error: "database error en all data" });
    }
});

app.listen({ host: "0.0.0.0", port: 3001 });
