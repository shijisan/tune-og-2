import Fastify from 'fastify';
import cors from '@fastify/cors';
import { searchRoute } from './routes/search.route';

const fastify = Fastify({ logger: true });

async function start() {
    await fastify.register(cors, {
        origin: 'http://localhost:5500', // allow my index.html to bypass CORS
        methods: ['GET'],
    });

    fastify.get('/test', () => {
        return { message: 'its working' };
    });

    fastify.get('/search', searchRoute);

    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();