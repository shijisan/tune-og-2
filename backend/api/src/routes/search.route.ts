import { FastifyReply, FastifyRequest } from 'fastify';
import { Youtube } from '../services/youtube.service';

const youtube = new Youtube();

export async function searchRoute(
    request: FastifyRequest<{ Querystring: { query?: string, hasQueue?: boolean } }>,
    reply: FastifyReply
) {
    const { query, hasQueue } = request.query;

    if (!query || query.trim() === '') {
        return reply.code(400).send({ error: 'Missing required query parameter: query' });
    }

    const cleanedQuery = query.trim();

    try {
        const metadata = await youtube.search(cleanedQuery, hasQueue);

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