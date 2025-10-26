import { userRepository } from "./userRepository";
import { userSettingsRepository } from "./userSettingsRepository";
import { User, Stats, userSettings } from "./types";
import { FastifyRequest, FastifyReply } from "fastify";
import { statsRepository } from "./statsRepository";

export const userController =
{
    syncFromAuth(request: FastifyRequest<{Body: {auth_id: number, nickname: string, created_at: string}}>, reply: FastifyReply)
    {
        try
        {
            let { auth_id, nickname, created_at } = request.body;
            const avatar_url = "null";
            if (!auth_id)
            {
                console.log("No id from auth provided");
                return reply.code(400).send({ error: "auth_id is required" });
            }
            const findUser: User | undefined = userRepository.findById(auth_id)
			const findUserByDisplayName : User | undefined = userRepository.findByDisplayName(nickname);
            if (findUser)
            {
                console.log("No id from auth/id duplicated");
                return reply.code(409).send({ error: "User already exists" });
            }
			else if (findUserByDisplayName)
				return reply.code(409).send({ error: "Nickname in use" });
            if (!nickname)
                nickname = "null";
            if (!created_at)
                created_at = "null";
            userRepository.createWithId(auth_id, nickname, avatar_url, created_at);
            userSettingsRepository.create(auth_id, "null", "null");
            statsRepository.createStatsWithId(auth_id, "null");
            return (reply.code(201).send({message: "User synchronized successfully", user_id: auth_id}));
        }
        catch (error)
        {
            console.log(error);
			return (reply.code(500).send({error: "userController.syncFromAuth: database error getting user", details: error}));
        }
    },
    getUser(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply) 
	{
		let user : User | undefined;
		try
		{
			if (request.params.id)
			{
				const id = parseInt(request.params.id);
				if (isNaN(id))
					return (reply.code(400).send({ error: "Invalid ID format" }));
				user = userRepository.findById(id);
			}
            if (!user)
                return reply.code(404).send({error: `User with ID ${request.params.id} not found!`});
            return (reply.code(200).send({ message: "User found successfully", 
                user: {id: user!.id, display_name: user!.display_name, avatar_url: user!.avatar_url, created_at: user!.created_at}}));
		} 
		catch (err) 
	  	{
            console.log(err);
			return (reply.code(500).send({error: "userController.getUser:database error getting user", details: err}));
	  	}
    },
    getUserStats(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply) 
	{
		let stats : Stats | undefined;
		try
		{
			if (request.params.id)
			{
				const id = parseInt(request.params.id);
				if (isNaN(id))
					return (reply.code(400).send({ error: "Invalid ID format" }));
				stats = statsRepository.findById(id);
			}
            else if (!stats)
                return reply.code(404).send({error: `User with ID ${request.params.id} not found!`});
            return (reply.code(200).send({ message: "User Stats found successfully", 
                user_stats: {id: stats!.id, matches_played: stats!.matches_played, wins: stats!.wins, losses: stats!.losses, points_scored: stats!.points_scored, points_conceded: stats!.points_conceded, last_match_at: stats!.last_match_at}}));
		} 
		catch (err) 
	  	{
            console.log(err);
			return (reply.code(500).send({error: "userController.getUserStats: database error getting userStats", details: err}));
	  	}
    },
    getUserSettings(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply) 
	{
		let userSettings : userSettings| undefined;
		try
		{
			if (request.params.id)
			{
				const id = parseInt(request.params.id);
				if (isNaN(id))
					return (reply.code(400).send({ error: "Invalid ID format" }));
				userSettings = userSettingsRepository.findById(id);
			}
            else if (!userSettings)
                return reply.code(404).send({error: `User with ID ${request.params.id} not found!`});
            return (reply.code(200).send({ message: "User userSettings found successfully", 
                user_userSettings: {id: userSettings!.id, city: userSettings!.city, country: userSettings!.country}}));
		} 
		catch (err) 
	  	{
            console.log(err);
			return (reply.code(500).send({error: "userController.getUserSettings: database error getting userSettings", details: err}));
	  	}
    },
    deleteSyncFromAuth(request: FastifyRequest<{Params: {id?: string}}>, reply: FastifyReply)
    {
        let user : User | undefined;
		try
		{
			if (request.params.id)
			{
				const id = parseInt(request.params.id as string);
				if (isNaN(id))
					return (reply.code(400).send({ error: "Invalid ID format" }));
				user = userRepository.findById(id);
			}
            if (!user)
                return reply.code(404).send({error: `User with ID ${request.params.id} not found!`});
            const result_user = userRepository.deleteById(user.id);
            if (result_user.changes <= 0)
			    return (reply.code(400).send({ error: `User id: ${user.id}, not found` }));
            return (reply.code(200).send({ message: `User id: ${user.id}, deleted successfully`,}));
		} 
		catch (err) 
	  	{
            console.log(err);
			return (reply.code(500).send({error: "userController.deleteSyncFromAuth: database error getting user", details: err}));
	  	}
    }
}

