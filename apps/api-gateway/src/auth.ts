const fetch = require("node-fetch");
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from "jsonwebtoken";

async function cookieCheck(request: FastifyRequest, reply: FastifyReply) 
{
	console.log("\x1b[34m%s\x1b[0m", "CookieCheck en API-Gateway para ruta:", request.url);
	if (request.url.startsWith("/api/auth/oauth"))
		return;
	
	if ((request.url === "/api/auth/register" && request.method === "POST") 
  	|| (request.url === "/api/auth/login" && request.method === "POST")
	|| (request.url === "/api/auth/refresh" && request.method === "POST")
  	|| request.url === "/api/auth/health" || request.url === "/api/auth/debug/all-data"/*este ultimo solo para debug*/)
		return; 
  		  
  	//Si no existe cookie
  	const cookies = request.cookies;
  	if (!cookies)
    	return reply.code(402).send({ error: "Missing cookies" });

  	const authHeader = request.headers["authorization"];
  	if (!authHeader || !authHeader.startsWith("Bearer "))
    	return reply.code(401).send({ error: "Missing token" });
	
	// Extraer token del header	
	const token = authHeader.split(" ")[1];
	if (!token || token == null)
    	return reply.code(401).send({ error: "Not authenticated" });
	
	try
  	{
    	const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    	(request as any).user = payload;
		console.log("\x1b[32m%s\x1b[0m", "ID Usuario del token verificado: ", payload.sub);
  	} 
	catch (err) 
	{
		console.error("\x1b[31m%s\x1b[0m", "Error verificando token:", err);
    	return reply.code(401).send({ error: "Invalid token" });
  	}
};

async function refreshToken(request: FastifyRequest, reply: FastifyReply)
{
	try
  	{
    	const r = await fetch("http://auth:3001/refresh",
    	{
      		method: "POST",
      		headers: 
			{
        		"cookie": request.headers.cookie || ""
      		}
    	});
		
    	// forwardear cabeceras + cookies
    	const setCookie = r.headers.get("set-cookie");
    	if (setCookie)
    		reply.header("set-cookie", setCookie);
    	const data = await r.json();
    	reply.code(r.status).send(data);
  	}
	catch (error)
  	{
    	console.error("Error in API Gateway refresh:", error);
    	reply.code(500).send({ error: "Refresh error", details: error });
  	}
}

//app.get("/api/auth/oauth/google", 
async function initGoogleOAuth(request: FastifyRequest, reply: FastifyReply)
{
	const r = await fetch("http://auth:3001/oauth/google", {redirect: 'manual'});
	const setCookie = r.headers.raw()['set-cookie'];
	if (setCookie) {
		reply.header("set-cookie", setCookie); // Puede ser array o string, Fastify lo maneja
	}
	reply.header("location", r.headers.get("location") || "/");
	return reply.code(302).send();
};

//app.get("/api/auth/oauth/google/callback", 
async function handleGoogleOAuthCallback(request: FastifyRequest, reply: FastifyReply)
{
	const url = new URL(request.url, `http://api-gateway`);
	const r = await fetch(`http://auth:3001/oauth/google/callback${url.search}`, {
		redirect: 'manual',
		headers: {
			"cookie": request.headers.cookie || ""
		}
	});
	// forwardear cabeceras + cookies
	const setCookie = r.headers.raw()['set-cookie'];
    if (setCookie) {
        reply.header("set-cookie", setCookie); // Puede ser array o string, Fastify lo maneja
    }
    reply.header("location", r.headers.get("location") || "/");
    return reply.code(302).send();
};

async function health(request: FastifyRequest, reply: FastifyReply)
{
	try
	{
		const r = await fetch("http://auth:3001/health");
		return r.json() as Promise<Record<string, unknown>>;
	}
	catch (error)
	{
		reply.code(500).send({error: "Api-gateway error", msg: error});
	}
}

async function register(request: FastifyRequest, reply: FastifyReply) 
{
	try
	{
		const api_reply = await fetch("http://auth:3001/register",
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body : JSON.stringify(request.body)
		});
		const data = await api_reply.json();
		if ((api_reply.status === 201 || api_reply.status === 200) && data.id) 
		{
			const syncReply = await fetch("http://user:3002/sync",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					auth_id: data.id,
					nickname: data.nickname || (request.body as any).nickname,
					created_at: data.created_at || Date.now().toString()
				})
			});
			const syncData = await syncReply.json();
			if (syncReply.status == 409)
			{
				let endpoint: string = "http://auth:3001/user";
				endpoint += `/${data.id}`;
				const api_delete_reply = await fetch(endpoint, {
				method: "DELETE",
				headers: { "cookie": request.headers.cookie || "" }
				});
				const setCookie = api_delete_reply.headers.get("set-cookie");
				if (setCookie)
					reply.header("set-cookie", setCookie);        
				const delete_data = await api_delete_reply.json();
				return (reply.code(409).send({ error: "nickname duplicated"}));
			}
			console.log(`✅ User successfully synchronized with User Service${syncData}`);                
        }
		return (reply.code(api_reply.status).send(data));
	}
	catch (error)
	{
		reply.code(500).send({ error: "Api-gateway error", details: error });
		console.log(`error api-gateway on register:${error}`)
	}
};

async function login(request: FastifyRequest, reply: FastifyReply) 
{
	try
	{
		const api_reply = await fetch("http://auth:3001/login",
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body : JSON.stringify(request.body)
		});
		const setCookie = api_reply.headers.get("set-cookie");
		if (setCookie)// forwardear cabeceras + cookies
			reply.header("set-cookie", setCookie);
		const data = await api_reply.json();
		reply.code(api_reply.status).send(data);
	}
	catch (error)
	{
		reply.code(500).send({ error: "Api-gateway error", details: error });
	}
};

async function logout(request: FastifyRequest, reply: FastifyReply)
{
	try
	{
		const api_reply = await fetch("http://auth:3001/logout",
		{
			method: "POST",
			headers: 
			{
				// "Content-Type": "application/json",
				"cookie": request.headers.cookie || "" 
			},
		});
		const setCookie = api_reply.headers.get("set-cookie");
		if (setCookie)	// forwardear cabeceras + cookies
			reply.header("set-cookie", setCookie);
		const data = await api_reply.json();
		reply.code(api_reply.status).send(data);
	}
	catch (error)
	{
		reply.code(500).send({ error: "Api-gateway error", details: error });
	}
};

async function getUser(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply)
{
	try
	{
		let endpoint : string = "http://auth:3001/user";
		if (!request.params.id)
			return (reply.code(400).send({ error: "No id params"}));
		endpoint += `/${request.params.id}`;
		const api_reply = await fetch(endpoint, 
		{
			method: "GET",
			headers:
			{
				"Content-Type": "application/json",
				"cookie": request.headers.cookie || "" 
			},
		});
		const setCookie = api_reply.headers.get("set-cookie");
  		if (setCookie)
    		reply.header("set-cookie", setCookie);
  		const data = await api_reply.json();
  		reply.code(api_reply.status).send(data);
	}
	catch (error) 
	{
    	reply.code(500).send({ error: "Api-gateway error", details: error });
	}
};

async function deleteUser(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply) 
{
    try 
	{
		if (!request.params.id)
			return (reply.code(400).send({ error: "No id params"}));
		let endpoint: string = "http://auth:3001/user";
		endpoint += `/${request.params.id}`;
        const api_reply = await fetch(endpoint, {
            method: "DELETE",
            headers: { "cookie": request.headers.cookie || "" }
        });
        const setCookie = api_reply.headers.get("set-cookie");
        if (setCookie)
            reply.header("set-cookie", setCookie);        
        const data = await api_reply.json();
        if (api_reply.status === 200 && data.id)
		{
            let userEndpoint = "http://user:3002/delete";
            userEndpoint += `/${request.params.id}`;
            const syncReply = await fetch(userEndpoint, {
				method: "DELETE",
				headers: { "cookie": request.headers.cookie || "" }
			});
            const userDeleteReply = await syncReply.json();
            if (syncReply.ok && userDeleteReply)
                console.log(`✅ User successfully deleted with User Service: ${JSON.stringify(userDeleteReply)}`);
            else
                console.error("❌ User Service delete failed:", syncReply.status, userDeleteReply);
        }
        console.log("❌ Sync condition not met:");
		return reply.code(api_reply.status).send(data);
    }
    catch (error)
	{
        console.error("Error in deleteUser:", error);
        return reply.code(500).send({ error: "Api-gateway error", details: error });
    }
};

async function updateUser(request: FastifyRequest, reply: FastifyReply)
{
	try
	{
		const api_reply = await fetch("http://auth:3001/user",
		{
			method: "PATCH",
			headers: 
			{
				"Content-Type": "application/json",
				"cookie": request.headers.cookie || ""
			},
			body : JSON.stringify(request.body)
		});
		const setCookie = api_reply.headers.get("set-cookie");
		if (setCookie)
			reply.header("set-cookie", setCookie);
		const data = await api_reply.json();
		reply.code(api_reply.status).send(data);
	}
	catch (error)
	{
		reply.code(500).send({error: "Api-gateway error", details: error});
	}
};

//app.get("/api/game-engine", 
async function debug() 
{
	const r = await fetch("http://auth:3001/debug/all-data");
	return r.json() as Promise<Record<string, unknown>>;
};

export default function authRoutes (fastify: FastifyInstance) 
{
	fastify.addHook("preHandler", cookieCheck);
	fastify.get("/api/auth/debug/all-data", debug);
	fastify.get("/api/auth/health", health);
	fastify.get("/api/auth/user/:id", getUser);
	fastify.post("/api/auth/register", register);
	fastify.delete("/api/auth/user/:id", deleteUser);
	fastify.patch("/api/auth/user", updateUser);
	fastify.post("/api/auth/login", login);
	fastify.post("/api/auth/logout", logout);
	fastify.post("/api/auth/refresh", refreshToken);
	fastify.get("/api/auth/oauth/google", initGoogleOAuth)
	fastify.get("/api/auth/oauth/google/callback", handleGoogleOAuthCallback);
};