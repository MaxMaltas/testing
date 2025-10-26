import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export function signAccessToken(payload: object) {
	  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
}

export function signRefreshToken(payload: object) {
	  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: 7*24*60*60 }); // 7 días
}

export function verifyAccessToken(token: string) {
	try {
		return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
	} catch (error) {
		throw new Error("\x1b[31m%s\x1b[0m Invalid access token");
	}
}

export async function verifyRefreshToken(token: string) {
	try {
		return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
	} catch (error) {
		throw new Error("\x1b[31m%s\x1b[0m Invalid refresh token");
	}
}

export function hashToken(token: string) {
	const salt = bcrypt.genSaltSync(10);
	return bcrypt.hashSync(token, salt);
}

export function compareToken(token: string, hashedToken: string) {
	return bcrypt.compareSync(token, hashedToken);
}

export function extractUserInfoFromToken(token: string) {
	try{
		const userInfo = jwt.decode(token);
		return userInfo;
	}
	catch (error) {
		console.error("\x1b[31m%s\x1b[0m","Error extracting user info from token:", error);
		return null;
	}
}