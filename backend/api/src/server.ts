import Fastify from 'fastify';
import cors from '@fastify/cors';
import { searchRoute } from './routes/search.route';
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({ logger: true });

async function start() {
    await fastify.register(cors, {
        origin: ['http://localhost:5500', 'http://localhost:8081', 'http://192.168.8.191:8081'], // allow my index.html to bypass CORS
        methods: ['GET'],
    });

    fastify.get('/', () => {
        return { message: 'its working' };
    });

    fastify.get('/search', searchRoute);

    // todo: track session to bind to job for cancelling/cleaning

    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();