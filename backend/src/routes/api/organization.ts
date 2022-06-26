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
      const org = await fastify.prisma.organization.findMany({
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
      return { organization: org }
    }

    const orgName = request.query.org.trim()

    const org = await fastify.prisma.organization.findUnique({
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

    return { organization: org }
  })
}

export default organization;
