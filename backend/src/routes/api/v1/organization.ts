import { FastifyPluginAsync } from "fastify"

interface IQueryString {
  before?: string;
  after?: string;
}

interface IHeaders {
  'h-Custom': string;
}

const organization: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: IQueryString,
    Headers: IHeaders
  }>('/organization/', async function (request, reply) {
    return 'stream endpoint'
  })
}

export default organization;
