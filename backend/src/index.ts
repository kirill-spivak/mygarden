import Fastify from 'fastify'
import { prisma } from './prisma/index.js'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { userCreateSchema, userResponseSchema } from './schemas/user/index.js'
import argon2 from 'argon2'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { errorResponse } from './schemas/shared/index.js'

const app = Fastify()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

await app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "My Garden OpenAPI",
            description: "My Garden OpenAPI schema",
            version: "0.0.0"
        },
    },
    transform: jsonSchemaTransform,
})

await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
        docExpansion: "full",
        deepLinking: false,
    }
})

app.get('/health', (request, reply) => {
    reply.send({ "status": "ok" })
})

app.withTypeProvider<ZodTypeProvider>().post('/auth/register',
    { schema: { tags: ["auth"], body: userCreateSchema, response: { 201: userResponseSchema, 400: errorResponse, 500: errorResponse } } },
    async (request, reply) => {
        try {
            const { email, password, name } = request.body;
            if (await prisma.user.findUnique({ where: { email } })) {
                return reply.status(400).send({ error: "User already exists" })
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
        } catch (err) {
            console.log(err)
        }
    })

app.listen({ port: 8081 }, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})