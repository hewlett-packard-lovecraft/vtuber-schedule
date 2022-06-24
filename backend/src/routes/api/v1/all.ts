import { FastifyPluginAsync } from "fastify"

const all: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get('/all/', async function (request, reply) {
        const prisma = fastify.prisma;
        
        try {
            const organizations = prisma.organization.findMany({
                where: {},
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

            const streams = prisma.stream.findMany({
                where: {},
            })

            const data = await prisma.$transaction([organizations, streams])

            return {
                status: 200,
                data: {
                    "organizations": data[0],
                    "streams": data[1]
                }
            }
        } catch (error) {
            fastify.log.error(error)

            return this.httpErrors.notFound;
        }

    })
}

export default all;
