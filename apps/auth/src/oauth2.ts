import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { authController } from "./authController";
import oauth2Client from "@fastify/oauth2";

export const oauth2 = {
  registerOAuth2(app: any) {
    app.register(oauth2Client, {
      name: "googleOAuth2",
      scope: ["userid", "email", "profile"],
      credentials: {
        client: {
          id: process.env.GOOGLE_CLIENT_ID,
          secret: process.env.GOOGLE_CLIENT_SECRET,
        },
        auth: oauth2Client.GOOGLE_CONFIGURATION,
      },
      startRedirectPath: "oauth/google",
      callbackUri: "https://localhost:4443/api/auth/oauth/google/callback",
      // pkce: 'S256',
      // callbackUriParams: { access_type: 'offline', prompt: 'consent' }
    });
  },
};

  