import Fastify from 'fastify'

const app = Fastify()

app.get('/health', (request, reply) => {
    reply.send({"status": "ok"})
})

app.listen({port: 8081}, (err, address) => {
    console.log(address)
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})