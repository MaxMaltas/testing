
export	interface User 
{
	id: number;
	mail: string;
	password: string;
	created_at: string
};

export interface userOAuth
{
	id: number;
	user_id: number;
	provider: string;
	provider_id: string;
	avatar_url?: string;
}

export	interface loginBody 
{
	mail: string;
	password: string;
};
  
export	interface registerBody 
{
	nickname: string;
	mail?: string;
	password?: string;
};