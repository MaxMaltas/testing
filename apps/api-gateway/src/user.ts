import	Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

async function getUser(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply) 
{
	try
	{
		let endpoint : string = "http://user:3002/data";
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

async function getStats(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply) 
{
	try
	{
		let endpoint : string = "http://user:3002/stats";
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

async function getProfile(request: FastifyRequest, reply: FastifyReply)
{
	try
	{ 
    	const r = await fetch("http://user:3002/profile", 
		{
      		method: "GET",
      		headers: { "Content-Type": "application/json" }
    	});
    	const data = await r.json();
    	reply.code(r.status).send(data);
	}
	catch (error)
  	{
    	console.error("Error fetching profile:", error);
    	return reply.code(500).send({ error: "Error fetching profile", details: error });
  	}
};

async function getUserSettings(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply) 
{
	try
	{
		let endpoint : string = "http://user:3002/settings";
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

async function debug() 
{
	const r = await fetch("http://user:3002/debug/all-data");
	return r.json() as Promise<Record<string, unknown>>;
};

export default function userRoutes (fastify: FastifyInstance) 
{
    fastify.get("/api/user/data/:id", getUser);
    fastify.get("/api/user/stats/:id", getStats);
    fastify.get("/api/user/profile", getProfile);
    fastify.get("/api/user/debug/all-data", debug);
	fastify.get("/api/user/settings/:id", getUserSettings);
};