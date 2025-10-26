import { User } from "./types";
import getInstance from "./db";

export const userRepository = 
{
	findById(id: number): User | undefined
  	{
    	const db = getInstance().db;
    	return (db.prepare("SELECT * FROM users_auth WHERE id = ?").get(id) as User | undefined);
  	},
	findByMail(mail: string): User
  	{
    	const db = getInstance().db;
    	return (db.prepare("SELECT * FROM users_auth WHERE mail = ?").get(mail) as User);
  	},
	create(created_at: string,  mail: string, password: string)
	{
    	const db = getInstance().db;
    	return (db.prepare("INSERT INTO users_auth(created_at, mail, password) VALUES (?, ?, ?)").run(created_at, mail, password));
  	},
	deleteById(id: number)
	{
		const db = getInstance().db;
		return (db.prepare("DELETE FROM users_auth WHERE id = ?").run(id));
	},
	updateMailById(id: number, newMail: string)
	{
		const db = getInstance().db;
		const result = db.prepare("UPDATE users_auth SET mail = ? WHERE id = ?").run(newMail, id);
		if (result.changes > 0)
			return (userRepository.findById(id));
		return (undefined);
	},
	createOauthUser(nickname: string, created_at: string, mail: string, provider: string, providerId: string, avatar_url?: string): User | undefined
	{
		const db = getInstance().db;
		const insertUser = db.prepare("INSERT INTO users_auth(nickname, mail, created_at) VALUES (?, ?, ?)");
		const result = insertUser.run(nickname, mail, created_at);
		const userId = result.lastInsertRowid as number;
		const insertProvider = db.prepare("INSERT INTO oauth_accounts(id, provider, provider_id, avatar_url) VALUES (?, ?, ?, ?)");
		insertProvider.run(userId, provider, providerId, avatar_url);
		return (userRepository.findById(userId));
	}
};
