import Fastify from "fastify";
import "reflect-metadata";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { AppDataSource } from "./data-source.js";

const fastify = Fastify({
    logger: true,
});

fastify.get("/", async (request, reply) => {
    return { hello: "world" };
});

const start = async () => {
    try {
        await AppDataSource.initialize();

        await fastify.register(authRoutes, { prefix: "/api/auth" });

        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
