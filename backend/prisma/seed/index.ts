import { PrismaClient } from '@prisma/client'
import hololive from "./json/hololive.json"
import nijisanji from "./json/nijisanji.json"

const prisma = new PrismaClient()

interface Organization {
    name: string;
    groupNames: string[];
    groups: Record<string, Channel[]>;
}

interface Channel {
    img: string;
    name: string;
    group: string;
    channelId: string;
    youtube: string;
    twitter: string;
}


async function seed(org: Organization) {
    console.log(`Start seeding ${org.name} ...`)

    const createOrgOperation = prisma.organization.create({
        data: {
            name: org.name,
        }
    })

    await prisma.$transaction([createOrgOperation])

    console.log(`Added ${org.name}`)

    for (const groupName of org.groupNames) {
        console.log(`Adding ${groupName}`)

        const createGroupOperation = prisma.group.create({
            data: {
                group_name: groupName,
                organization: {
                    connect: {
                        name: org.name
                    }
                }
            }
        })

        await prisma.$transaction([createGroupOperation])


        const channels = org.groups[groupName];

        for (const id in channels) {
            let channel: Channel = channels[id];

            console.log(`Added ${channel.name} to ${groupName}`)


            await prisma.channel.create({
                data: {
                    channel_name: channel.name,
                    avatar: channel.img,
                    youtube_id: channel.channelId,
                    youtube: channel.youtube,
                    twitter: channel.twitter,
                    last_updated: new Date(),
                    group: {
                        connect: {
                            group_name: groupName
                        }
                    }
                }
            })
        };


    }

    console.log(`Seeding ${org.name} finished.`)
}


async function main() {
    await seed(nijisanji)
    await seed(hololive)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })