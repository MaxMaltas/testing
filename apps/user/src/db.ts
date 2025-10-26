import sqlite3 from "better-sqlite3";

// Patrón singleton para la conexión
class	Database	
{
	private static instance: Database; //guarda la única instancia de la clase → así no abres varias conexiones a app.db.
	public db: sqlite3.Database;
	private constructor()//privado → no puedes hacer new Database() fuera de la clase.
	{
    	this.db = new sqlite3(process.env.USER_DB_PATH);//nueva conexion a la db, si no existe la crea, importante definir bien la ruta
    	this.init();
  	}
	private init() 
	{
    	try 
		{
      		this.db.pragma("journal_mode = WAL"); //Write-Ahead Logging → mejor rendimiento en concurrencia.
			this.db.pragma("foreign_keys = ON");
      		this.db.prepare(`CREATE TABLE IF NOT EXISTS users (
								id INTEGER PRIMARY KEY,
								display_name TEXT UNIQUE NOT NULL,
								avatar_url TEXT,
								created_at TEXT);`).run();
			this.db.prepare(`CREATE TABLE IF NOT EXISTS user_settings (
								id INTEGER PRIMARY KEY NOT NULL,
								city TEXT,
								country TEXT,
								FOREIGN KEY(id) REFERENCES users(id) ON DELETE CASCADE);`).run();
			this.db.prepare(`CREATE TABLE IF NOT EXISTS blocks (
								id INTEGER NOT NULL,
								blocked_id INTEGER NOT NULL ,
								created_at INTEGER NOT NULL,
								UNIQUE(id, blocked_id),
								FOREIGN KEY(id) REFERENCES users(id) ON DELETE CASCADE,
								FOREIGN KEY(blocked_id) REFERENCES users(id) ON DELETE CASCADE);`).run();
			this.db.prepare(`CREATE TABLE IF NOT EXISTS friends (
								requester_id INTEGER NOT NULL,
								addressee_id INTEGER NOT NULL,
								status TEXT NOT NULL,
								created_at INTEGER NOT NULL,
								responded_at INTEGER,
								UNIQUE(requester_id, addressee_id),
								FOREIGN KEY(requester_id) REFERENCES users(id) ON DELETE CASCADE,
								FOREIGN KEY(addressee_id) REFERENCES users(id) ON DELETE CASCADE);`).run();
			this.db.prepare(`CREATE TABLE IF NOT EXISTS stats (
								id INTEGER PRIMARY KEY NOT NULL,
								matches_played INTEGER NOT NULL DEFAULT 0,
								wins INTEGER NOT NULL DEFAULT 0,
								losses INTEGER NOT NULL DEFAULT 0,
								points_scored INTEGER NOT NULL DEFAULT 0,
								points_conceded INTEGER NOT NULL DEFAULT 0,
								last_match_at TEXT,
								FOREIGN KEY(id) REFERENCES users(id) ON DELETE CASCADE);`).run();
    	}
		catch (err: any) 
		{
      		console.error("Failed to connect to the SQLite database:", err.message);
    	}
  	}
	//Crea la conexión una sola vez y luego devuelve siempre la misma.
	//static → lo llamas en la clase, no en una instancia. public → puedes usarlo fuera de la clase.
	public static getInstance(): Database 
	{
		if (!Database.instance) //Si la instancia no existe, la crea.
			Database.instance = new Database();
    	return Database.instance;
	}
	public close() 
	{
		this.db.close();
	}
}
export default Database.getInstance;