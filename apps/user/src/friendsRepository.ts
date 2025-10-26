import { friends } from "./types";
import getInstance from "./db";

export const friendsRepository = 
{
    findByRequesterId(requester_id: number): friends[] 
    {
        const db = getInstance().db;
        return db.prepare("SELECT * FROM friends WHERE requester_id = ?").all(requester_id) as friends[];
    },
    findByAddresseeId(addressee_id: number): friends[] 
    {
        const db = getInstance().db;
        return db.prepare("SELECT * FROM friends WHERE addressee_id = ?").all(addressee_id) as friends[];
    },
    findByIds(requester_id: number, addressee_id: number): friends | undefined 
    {
        const db = getInstance().db;
        return db.prepare("SELECT * FROM friends WHERE requester_id = ? AND addressee_id = ?").get(requester_id, addressee_id) as friends | undefined;
    },
    createFriendRequest(requester_id: number, addressee_id: number, status: string, created_at: number) 
    {
        const db = getInstance().db;
        return db.prepare("INSERT INTO friends (requester_id, addressee_id, status, created_at) VALUES (?, ?, ?, ?)").run(requester_id, addressee_id, status, created_at);
    },
    updateStatusByIds(requester_id: number, addressee_id: number, status: string) 
    {
        const db = getInstance().db;
        return db.prepare("UPDATE friends SET status = ? WHERE requester_id = ? AND addressee_id = ?").run(status, requester_id, addressee_id);
    },
    updateRespondedAtByIds(requester_id: number, addressee_id: number, responded_at: number) 
    {
        const db = getInstance().db;
        return db.prepare("UPDATE friends SET responded_at = ? WHERE requester_id = ? AND addressee_id = ?").run(responded_at, requester_id, addressee_id);
    },
    deleteByIds(requester_id: number, addressee_id: number)// eliminar una relación específica
    {
        const db = getInstance().db;
        return db.prepare("DELETE FROM friends WHERE requester_id = ? AND addressee_id = ?").run(requester_id, addressee_id);
    }
};