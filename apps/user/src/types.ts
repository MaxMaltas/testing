export	interface User 
{
	id: number;
	display_name: string;
    avatar_url: string;
	created_at: string
};

export interface  userSettings
{
    id: number;
    city: string;
    country: string;
}

export interface Block
{
    id: number;
    blocked_id: number;
    created_at: string;
}

export interface friends //peticion?
{
    requester_id: number;
    addresse_id: number;
    status: string;
    created_at: string;
    responded_at: string;
}

export interface Stats
{
    id: number;
    matches_played: number;
    wins: number;
    losses: number;
    points_scored: number;
    points_conceded: number;
    last_match_at: string;
}


