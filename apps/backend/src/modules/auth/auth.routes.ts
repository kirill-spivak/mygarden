import type { FastifyPluginAsync } from "fastify";
import { AppDataSource } from "../../data-source.js";
import { User } from "../../entities/user.entity.js";
import { registerSchema } from "./auth.schemas.js";
import * as z from "zod";
import { formatZodError } from "../../shared/utils/formatZodError.js";
import { hashPassword } from "../../shared/utils/passwordHasher.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
    const userRepository = AppDataSource.getRepository(User);

    app.post("/register", async (request, reply) => {
        const parseBody = await registerSchema.safeParseAsync(request.body);
        if (!parseBody.success) {
            return reply.code(400).send({
                message: "Ошибка валидации",
                errors: formatZodError(parseBody.error),
            });
        }

        const { name, email, password } = parseBody.data;
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return reply.code(409).send({
                message: "Пользователь с таким email уже существует",
            });
        }

        const passwordHash = await hashPassword(password);

        const user = userRepository.create({ name, email, passwordHash });
        const savedUser = await userRepository.save(user);

        return reply.code(201).send({
            user: {
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
                passwordHash: savedUser.passwordHash
            },
        });
    });
};
