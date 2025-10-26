import sqlite3 from "better-sqlite3";

// Patrón singleton para la conexión
class	Database	
{
	private static instance: Database; //guarda la única instancia de la clase → así no abres varias conexiones a app.db.
	public db: sqlite3.Database;
	private constructor()//privado → no puedes hacer new Database() fuera de la clase.
	{
    	this.db = new sqlite3(process.env.AUTH_DB_PATH);//nueva conexion a la db, si no existe la crea, importante definir bien la ruta
    	this.init();
  	}
	private init() 
	{
    	try 
		{
      		this.db.pragma("journal_mode = WAL"); //Write-Ahead Logging → mejor rendimiento en concurrencia.
			this.db.pragma("foreign_keys = ON");
      		this.db.prepare(`CREATE TABLE IF NOT EXISTS users_auth (
								id INTEGER PRIMARY KEY AUTOINCREMENT,
  								mail TEXT UNIQUE NOT NULL,
  								password TEXT NOT NULL,
  								created_at TEXT NOT NULL)`).run(); //crea la tabla
			this.db.prepare(`CREATE TABLE IF NOT EXISTS refresh_tokens (
								id INTEGER PRIMARY KEY AUTOINCREMENT,
								user_id INTEGER, token_hash TEXT,
								expires_at DATETIME, 
								FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)`).run(); // crea la tabla refresh_tokens
			this.db.prepare(`CREATE TABLE IF NOT EXISTS oauth_accounts (
  								id INTEGER PRIMARY KEY NOT NULL,
  								provider TEXT NOT NULL,
  								provider_id TEXT NOT NULL,
								avatar_url TEXT,
  								UNIQUE(provider, provider_id),
  								FOREIGN KEY(id) REFERENCES users_auth(id) ON DELETE CASCADE);`).run();
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