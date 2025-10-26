import { User } from "./types";
import getInstance from "./db";

export const userRepository = 
{
    createWithId(id: number, display_name: string, avatar_url: string, created_at: string)
    {
        const db = getInstance().db;
        return (db.prepare("INSERT INTO users (id, display_name, avatar_url, created_at) VALUES (?, ?, ?, ?)").run(id, display_name, avatar_url, created_at));
    },
    findById(id: number): User | undefined 
    {
        const db = getInstance().db;
        return (db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined);
    },
    findByDisplayName(display_name: string)
    {
        const db = getInstance().db;
        return (db.prepare("SELECT * FROM users WHERE display_name = ?").get(display_name) as User | undefined);
    },
    updateDisplayNameById(id: number, display_name: string) 
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE users SET display_name = ? WHERE id = ?").run(display_name, id));
    },
    updateAvatarUrlById(id: number, avatar_url: string) 
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").run(avatar_url, id));
    },
    updateCreatedAtById(id: number, created_at: string) 
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE users SET created_at = ? WHERE id = ?").run(created_at, id));
    },
    deleteById(id: number) 
    {
        const db = getInstance().db;
        return (db.prepare("DELETE FROM users WHERE id = ?").run(id));
    }
}