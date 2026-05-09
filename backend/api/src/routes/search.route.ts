import { FastifyReply, FastifyRequest } from 'fastify';
import { Youtube } from '../services/youtube.service';

// Singleton — one client for the lifetime of the server
const youtube = new Youtube();

export async function searchRoute(
    request: FastifyRequest<{ Querystring: { q?: string } }>,
    reply: FastifyReply
) {
    const { q } = request.query;

    if (!q || q.trim() === '') {
        return reply.code(400).send({ error: 'Missing required query parameter: q' });
    }

    try {
        const metadata = await youtube.search(q.trim());

        return reply.send({
            success: true,
            data: {
                metadata
            },
        });
    } catch (error: any) {
        request.log.error(error, 'Search failed');
        return reply.code(500).send({
            error: 'Failed to fetch music metadata',
            message: error.message || 'Unknown error',
        });
    }
}