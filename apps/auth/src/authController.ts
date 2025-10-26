import { signAccessToken, signRefreshToken, hashToken, verifyRefreshToken, compareToken, extractUserInfoFromToken } from "./jwt";
import { userRepository } from "./userRepository";
import { authRepository } from "./authRepository";
import { FastifyRequest, FastifyReply } from "fastify";
import { User, userOAuth } from "./types";


export const authController =
{
	loginUser(request: FastifyRequest<{Body: { mail?: string, password?: string}}>, reply: FastifyReply) 
	{

		const { mail, password } = request.body;

		if (!mail || !password) 
			return (reply.code(400).send({ error: "missing login params" }));
		try
		{
			const user = userRepository.findByMail(mail);
			if (!user)
				return (reply.code(409).send({ error: "incorrect mail/password" }));
			else if (user.password != password || user.mail != mail)
				return (reply.code(409).send({ error: "incorrect mail/password" }));
			else if (user.mail == mail && user.password == password) // TODO: implementar password hasheado
			{
				
				const accessToken = signAccessToken({ sub: user.id });
				console.log( "Usuario logeado: ", user.id, user.mail);
				const refreshToken = signRefreshToken({ sub: user.id });

				reply
					.setCookie("refresh-token", refreshToken)
					.code(200)
					.send({ message: "Login correcto" , accessToken });// El access token se envía en el cuerpo de la respuesta
			}
		}
		catch (error)
		{
			console.error("\x1b[31m%s\x1b[0m","Error inserting user:", error);
			return (reply.code(500).send({ error: "database error en Login", details: error }));
		}
	},
	logOutUser(request: FastifyRequest, reply: FastifyReply)
	{
		try
		{
			// Modificar cookie para que quede caducada
			reply
			.setCookie("refresh-token", "", {
				expires: new Date(0) // Fecha en el pasado para caducar la cookie
			  })
			.code(200)
			.send({ success: true, message: "Logout successful" });
		}
		catch (error)
		{
			console.error("\x1b[31m%s\x1b[0m","Error during logout:", error);
			return (reply.code(500).send({ error: "Logout error", details: error }));
		}
	},
	refreshToken(request: FastifyRequest, reply: FastifyReply)
	{
		// Si hay varias cookies, request.cookies contendrá todas como un objeto
		// Siempre buscamos la cookie 'refresh-token'
		const cookies = request.cookies || {};
		const refreshToken = cookies["refresh-token"];
		if (!refreshToken)
			return reply.code(401).send({ error: "No refresh token provided" });
		try
		{
			const payload = verifyRefreshToken(refreshToken) as any;
			// Si el token es válido, generar un nuevo access token
			const accessToken = signAccessToken({ sub: payload.sub });
			return reply.code(200).send({ accessToken });
		}
		catch (error)
		{
			console.error("\x1b[31m%s\x1b[0m", "Error during token refresh:", error);
			return reply.code(500).send({ error: "Token refresh error", details: error });
		}
	},
	googleOAuthCallback: async (request: FastifyRequest<{ Querystring: { state?: string } }>, reply: FastifyReply) =>
	{
		try
		{
			console.log("\x1b[32m%s\x1b[0m", "Handling Google OAuth callback");
			console.log("\x1b[32m%s\x1b[0m", "State en query:", request.query.state);
			console.log("\x1b[32m%s\x1b[0m", request);
			console.log("\x1b[32m%s\x1b[0m", request.cookies["oauth2-redirect-state"]);
			
			
			// 1️⃣ Intercambiar el code por tokens de Google
			const token = await (request.server as any).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
			if (!token?.token?.id_token) {
				console.error("Missing id_token from Google");
				return reply.code(400).send({ error: "Missing Google ID token" });
			}
			console.log("\x1b[32m%s\x1b[0m", "Google OAuth token:", token);

			const userInfo = extractUserInfoFromToken(token.token.id_token);
			if (!userInfo || typeof userInfo !== 'object' || !('sub' in userInfo) || !userInfo.email) {
				console.error("\x1b[31m%s\x1b[0m", "Invalid user info received from Google:", userInfo);
				return reply.code(400).send({ error: "Invalid user info from Google" });
			}

			// Buscar o crear usuario en la base de datos
			const now = new Date().toISOString();
			// const mail = userInfo.email ?? "";
			// const picture = userInfo.picture ?? "";

			if (!userInfo.email) {
				console.error("\x1b[31m%s\x1b[0m", "Email not provided by Google:", userInfo);
				return reply.code(400).send({ error: "Email not provided by Google" });
			}
			const existingUser = userRepository.findByMail(userInfo.email);

			let userId: number;
			if (!userInfo.sub) {
				console.error("\x1b[31m%s\x1b[0m", "Provider ID (sub) not provided by Google:", userInfo);
				return reply.code(400).send({ error: "Provider ID not provided by Google" });
			}
			const existingOAuth = authRepository.findByProviderId("google", userInfo.sub) as {user_id: number} | undefined;


			if (existingOAuth) {
				// Ya existe vínculo con Google → login directo
				userId = existingOAuth.user_id;
				console.log("\x1b[32m[OAuth]\x1b[0m Existing OAuth link found:", userId);
			}
			else if (existingUser) {
				// Ya existe un usuario local con ese email → vincular cuentas
				console.log("\x1b[33m[OAuth]\x1b[0m Linking Google account with existing local user:", existingUser.id);
				userId = existingUser.id;
			}
			else
			{
				const user = userRepository.createOauthUser(userInfo.name, now, userInfo.email, "google", userInfo.sub, userInfo.picture!);
				userId = user?.id as number;
			}

			// Generar tokens JWT internos
			const refreshToken = signRefreshToken({ sub: userId });
			if (!refreshToken) {
				console.error("\x1b[31m%s\x1b[0m", "Failed to sign refresh token");
				return reply.code(500).send({ error: "Token signing error" });
			}

			console.log("\x1b[32m%s\x1b[0m", "Google user info:", userInfo);
			
			// Extrae datos del usuario
			// const google = await userInfo.json() as {
			// 	sub: string;
			// 	email: string;
			// 	name?: string;
			// 	picture?: string;
			// };

			// Extraer info para guardar enDB si es necesario
			// const internalUser = await upsertUserFromGoogle({
			// 	provider: "google",
			// 	providerId: google.sub,
			// 	email: google.email,
			// 	name: google.name,
			// 	avatarUrl: google.picture,
			// });
			// console.log("\x1b[32m%s\x1b[0m", "Google user info:", token);
			/* jti (JWT ID) → identificador único del token (UUID).
				Sirve para revocar refresh tokens específicos desde la base de datos.
			
			// const jti = randomUUID();
			// await saveRefreshRecord({ jti, userId: internalUser.id });*/

			if (!userInfo || typeof userInfo !== 'object' || !('sub' in userInfo) || !userInfo.email) {
				console.error("\x1b[31m%s\x1b[0m", "Invalid user info received from Google:", userInfo);
				return reply.code(500).send({ error: "Invalid user info from Google" });
			}
			reply
				.setCookie("refresh-token", refreshToken)
				.code(200)
				.redirect("https://localhost:4443/#connected")
				// .send({ message: "Google OAuth login successful" });

		}
		catch (error)
		{
			console.error("\x1b[31m%s\x1b[0m", "Error in Google OAuth callback:", error);
			return reply.code(500).send({ error: "Google OAuth error", details: error });
		}
	}
}