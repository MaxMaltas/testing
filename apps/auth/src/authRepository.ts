import getInstance from "./db";
import { User, userOAuth } from "./types";

export const authRepository =
{
	insertHashedTokenById(id: number, hashedToken: string) {
		const db = getInstance().db;
		return (db.prepare("INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, datetime('now', '+7 day'))").run(id, hashedToken));
	},
	getTokensByUserId(id: number) {
		const db = getInstance().db;
		return (db.prepare("SELECT * FROM refresh_tokens WHERE user_id = ?").all(id));
	},
	deleteTokenByHash(tokenHash: string) {
		const db = getInstance().db;
		return (db.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?").run(tokenHash));
	},
	deleteTokensByUserId(userId: number) {
		const db = getInstance().db;
		return (db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").run(userId));
	},
	findByProviderId(provider: string, providerId: string): userOAuth | undefined
	{
		const db = getInstance().db;
		return (db.prepare("SELECT * FROM oauth_accounts WHERE provider = ? AND provider_id = ?").get(provider, providerId)) as userOAuth | undefined;
	}
};
