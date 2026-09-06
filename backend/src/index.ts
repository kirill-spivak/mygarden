import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import { prisma } from './prisma/index.js'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { userCreateSchema, userLoginResponse, userLoginSchema, userResponseSchema } from './schemas/user/index.js'
import argon2 from 'argon2'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { errorResponse } from './schemas/shared/index.js'
import fastifyJwt from '@fastify/jwt'
import { is } from 'zod/locales'
import { generateRefreshToken } from './auth/refresh/index.js'

const app = Fastify()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply,
        ) => Promise<void>
    }
}

await app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "My Garden OpenAPI",
            description: "My Garden OpenAPI schema",
            version: "0.0.0"
        },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }},
    transform: jsonSchemaTransform,
})

await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
        docExpansion: "full",
        deepLinking: false,
    }
})

await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
    sign: {
        expiresIn: process.env.ACCESS_TOKEN_LIFETIME!,
    }
})

app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify()
    } catch (err) {
       return reply.status(401).send(err)
    }
})

app.get('/health', (request, reply) => {
    reply.send({ "status": "ok" })
})

app.withTypeProvider<ZodTypeProvider>().post('/auth/register',
    { schema: { tags: ["auth"], body: userCreateSchema, response: { 201: userResponseSchema, 400: errorResponse, 500: errorResponse } } },
    async (request, reply) => {
        const { email, password, name } = request.body;
        if (await prisma.user.findUnique({ where: { email } })) {
            return reply.status(400).send({ error: "ERR_CONFLICT", message: "User already exists" })
        }
        const passwordHash = await argon2.hash(password)
        const newUser = await prisma.user.create({
            data: {
                name: name || "",
                email,
                password_hash: passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        })
        return reply.status(201).send(newUser)
    })

app.withTypeProvider<ZodTypeProvider>().post("/auth/login",
    { schema: { body: userLoginSchema, tags: ["auth"], response: { 200: userLoginResponse, 401: errorResponse, 500: errorResponse } } },
    async (request, reply) => {
        const { email, password } = request.body;
        const existingUser = await prisma.user.findUnique({ where: { email: email } })
        if (!existingUser) {
            return reply.status(401).send({ error: 'ERR_NOT_FOUND', message: "Invalid email or password" })
        }

        const isValidPassword = await argon2.verify(existingUser.password_hash, password)
        if (!isValidPassword) {
            return reply.status(401).send({ error: 'ERR_NOT_FOUND', message: 'Invalid email or password' })
        }

        const accessToken = app.jwt.sign({ sub: existingUser.id, email: existingUser.email })
        const refreshToken = generateRefreshToken(32)
        return reply.status(200).send({ accessToken, refreshToken: refreshToken })
    }
)

app.withTypeProvider<ZodTypeProvider>().get("/auth/me", 
    {
        onRequest: [app.authenticate],
        schema: {
            tags: ['auth'],
            security: [
                {
                    bearerAuth: [],
                }
            ]
        }
    },
    async (request, reply) => {
        return reply.send(request.user)
    })

app.listen({ port: 8081 }, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})