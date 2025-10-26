export type LoginBody = {
  mail: string;
  password: string;
};

export type RegisterBody = {
  nickname: string;
  mail?: string;
  password?: string;
};

export type AuthResponse = {
  ok: boolean;
  error?: string;
};

export type LoginUser = {
  message: string;
  accessToken: string | null;
};
