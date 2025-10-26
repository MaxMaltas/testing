import { userSettings } from "./types";
import getInstance from "./db";

export const userSettingsRepository = 
{
    findById(id: number): userSettings | undefined 
    {
        const db = getInstance().db;
        return (db.prepare("SELECT * FROM user_settings WHERE id = ?").get(id) as userSettings | undefined);
    },
    create(id: number, city?: string, country?: string) 
    {
        const db = getInstance().db;
        return (db.prepare("INSERT INTO user_settings (id, city, country) VALUES (?, ?, ?)").run(id, city, country));
    },
    updateCityById(id: number, city: string)
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE user_settings SET city = ? WHERE id = ?").run(city, id));
    },
    updateCountryById(id: number, country: string)
    {
        const db = getInstance().db;
        return (db.prepare("UPDATE user_settings SET country = ? WHERE id = ?").run(country, id));
    },
    deleteById(id: number) 
    {
        const db = getInstance().db;
        return (db.prepare("DELETE FROM user_settings WHERE id = ?").run(id));
    }
}