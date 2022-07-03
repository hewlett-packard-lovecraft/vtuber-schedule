import { FastifyPluginAsync } from "fastify"

interface IQueryString {
  org?: string
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
    // default query parameters
    let orgName = "";
    let before_date = new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)); // default to today + 2d
    let after_date = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)); // default to today - 2d

    if (request.query.org) {
      request.query.org.trim()
    }
    

    const org = await fastify.prisma.organization.findMany({
      where: {
        name:{
          contains: orgName
        }
      },
      include: {
        groups: {
          include: {
            channels: {
              include: {
                streams: {
                  where: {
                    start_date: {
                      gte: after_date,
                      lte: before_date
                    }
                  }
                }
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
