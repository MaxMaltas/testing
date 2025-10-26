import { FastifyRequest, FastifyReply } from "fastify";
import { userRepository } from "./userRepository";
import { User} from "./types";


export const userController = 
{
	getUser(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply) 
	{
		let user;
		try
		{
			if (request.params.id)
			{
				const id = parseInt(request.params.id);
				if (isNaN(id))
					return (reply.code(400).send({ error: "Invalid ID format" }));
				user = userRepository.findById(id);
			}
			if (user)
		  		return (reply.code(200).send({msg: `User id: ${user.id}, User mail: ${user.mail}, found!`, user}));
			else 
		  		return (reply.code(404).send({error: `User: ${request.params.id}, not found!`}));
		} 
		catch (err) 
	  	{
			return (reply.code(500).send({error: "database error getting user", details: err}));
	  	}
	},
	registerUser(request: FastifyRequest<{Body: {mail: string, nickname: string, password: string}}>, reply: FastifyReply) 
	{
		if (!request.body || !request.body.mail || !request.body.password) 
			return (reply.code(400).send({ error: "params required" }));
		try
		{
			const user : User | undefined = userRepository.findByMail(request.body.mail);
			if (user && user.mail === request.body.mail)
				return (reply.code(409).send({ error: "duplicate mail" }));
			const created_at = new Date().toISOString();
			userRepository.create(created_at, request.body.mail, request.body.password);
			const id = userRepository.findByMail(request.body.mail)?.id;
			return (reply.send({ok: true, id: id, nickname: request.body.nickname, created_at: created_at}));
		}
		catch (error)
		{
			console.error("Error inserting user:", error);
			return (reply.code(500).send({ error: "database error en crear usuario", details: error }));
		}
	},
	deleteUser(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply)
	{
		try
		{
			if (request.params.id)
			{
				const id = parseInt(request.params.id);
				if (isNaN(id))
					return (reply.code(400).send({ error: "Invalid ID format" }));
				const result = userRepository.deleteById(id);
				if (result.changes > 0)
					return (reply.code(200).send({msg: `User id: ${id}, deleted succesfully`, id: id}));
				return (reply.code(400).send({ error: `User id: ${id}, not found` }));
			}
			else
				return (reply.code(400).send({ error: "No id params" }));
		}
		catch (error)
		{
			console.error("Error deleting user:", error);
			return (reply.code(500).send({ error: "database error en eliminar usuario", details: error }));
		}
	}
	// updateUser(request: FastifyRequest<{Body: {nickname?: string, newNickname?: string}}>, reply: FastifyReply)
	// {
	// 	try
	// 	{
	// 		if (!request.body.nickname || !request.body.newNickname)
	// 			return (reply.code(400).send({ error: "Invalid params" }));
	// 		const user : User | undefined = userRepository.findByNickname(request.body.nickname);
	// 		if (!user)
	// 			return (reply.code(400).send({error: `User: ${request.body.nickname} not found in db`}));
	// 		else if (user.nickname == request.body.newNickname)
	// 			return (reply.code(400).send({error: `The current nickname and the new nickname are the same`}));
	// 		const tmpUser : User | undefined = userRepository.findByNickname(request.body.newNickname);
	// 		if (tmpUser)
	// 			return (reply.code(400).send({error: `Nickname: ${request.body.newNickname}, in use`}));
	// 		const newUser : User | undefined = userRepository.updateNicknameById(user.id, request.body.newNickname);
	// 		if (newUser && newUser.nickname == request.body.newNickname)
	// 			return (reply.code(200).send({msg: `User id: ${newUser.id}, has successfully changed his nickname to ${newUser.nickname}`}));
	// 	}
	// 	catch (error)
	// 	{
	// 		console.error("Error updating user:", error);
    //     	return (reply.code(500).send({ error: "database error en actualizar usuario", details: error}));
	// 	}
	// }
};