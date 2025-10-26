import { FastifyInstance } from "fastify";
import { userController } from "./userController";
import { authController } from "./authController";

export default function userRoutes(fastify: FastifyInstance, opts: any, done: () => void) 
{
	fastify.get("/user/:id", userController.getUser);
	fastify.post("/register", userController.registerUser);
	fastify.delete("/user/:id", userController.deleteUser);
  fastify.post("/login", authController.loginUser);
  fastify.post("/logout", authController.logOutUser);
  fastify.post("/refresh", authController.refreshToken);
  fastify.get("/oauth/google/callback", authController.googleOAuthCallback);
  done();// Fastify automatically returns 404 for unmatched routes
}
