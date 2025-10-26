import sqlite3 from "better-sqlite3";

// Patrón singleton para la conexión
class	Database	
{
	private static instance: Database; //guarda la única instancia de la clase → así no abres varias conexiones a app.db.
	public db: sqlite3.Database;
	private constructor()//privado → no puedes hacer new Database() fuera de la clase.
	{
    	this.db = new sqlite3("./app.db");//nueva conexion a la db, si no existe la crea, importante definir bien la ruta
    	this.init();
  	}
	private init() 
	{
    	try 
		{
      		this.db.pragma("journal_mode = WAL"); //Write-Ahead Logging → mejor rendimiento en concurrencia.
			this.db.pragma("foreign_keys = ON");
      		this.db.prepare(`CREATE TABLE IF NOT EXISTS tournaments_data (
								id INTEGER PRIMARY KEY AUTOINCREMENT,
								best_of INTEGER UNIQUE NOT NULL default 1,
								status TEXT UNIQUE NOT NULL default 'pending',
								started_at INTEGER,
  								finished_at INTEGER)`).run(); //crea la tabla
								this.db.prepare(`CREATE TABLE IF NOT EXISTS match_data (
								id INTEGER PRIMARY KEY AUTOINCREMENT,
								tournament_id INTEGER,
								player1_id INTEGER NOT NULL,
								player2_id INTEGER,
								player1_score INTEGER NOT NULL DEFAULT 0,
								player2_score INTEGER NOT NULL DEFAULT 0,
								target_score INTEGER NOT NULL,
								status TEXT NOT NULL DEFAULT 'pending',
								created_at INTEGER,
								finished_at INTEGER,
								FOREIGN KEY(tournament_id) REFERENCES tournaments_data(id));`).run();
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