
export	interface User 
{
	id: number;
	nickname: string;
	mail: string;
	password: string;
	created_at: string
};

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

export interface match
{
	id: number;
	user1_id: number;
	user2_id: number;
	score: number;
	created_at: string;
}