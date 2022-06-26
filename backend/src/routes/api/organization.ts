import { FastifyPluginAsync } from "fastify"

interface IQueryString {
  org?: string
}

interface IHeaders {
  'h-Custom': string;
}

const organization: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: IQueryString,
    Headers: IHeaders
  }>('/organization/', async function (request, reply) {
    if (!request.query.org) {
      return await fastify.prisma.organization.findMany()
    }

    const orgNameList = request.query.org.split(',').map(
      orgName => orgName.trim()
    )

    const dbReads = orgNameList.map((orgName) => {
      return fastify.prisma.organization.findUnique({
        where: {
          name: orgName,
        },
        include: {
          groups: {
            include: {
              channels: {
                include: {
                  streams: true
                }
              }
            }
          }
        }
      })
    })

    return await fastify.prisma.$transaction(dbReads);
  })
}

export default organization;
