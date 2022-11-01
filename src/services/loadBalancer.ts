import { ServiceError } from "../errors"
import { Participant } from "../models/participant"
import { murmur3 } from 'murmurhash-js';
import { getManager } from "typeorm";

const SEED = 12345
const MAX_PARTICIPANTS_PER_SERVER = 300
const MAX_PARTICIPANTS_PER_ROOM = 300

export const allocateServer = (id: string, serverCount: number): number => {
    /** Pick Allocation method */
    //findLeastUsedServer()
    return allocateServerUniformly(id, serverCount)

}

export const allocateServerUniformly = (id: string, serverCount: number): number => {
    const hash = murmur3(id, SEED);
    const serverId = hash % serverCount
    console.log("AllocatedServer", serverId)
    return serverId
}

export const findLeastUsedServer = async (): Promise<number> => {
    const query = `
            SELECT 
                "Participant__Participant_room"."server_id", 
                COUNT(DISTINCT("Participant"."participant_id")) AS "cnt" 
            FROM "webconference"."participant" "Participant" 
            INNER JOIN "webconference"."room" "Participant__Participant_room" 
                ON "Participant__Participant_room"."room_id"="Participant"."room_id" 
            GROUP BY "Participant__Participant_room"."server_id" 
            ORDER BY "cnt" ASC
            `
    const rawData = await getManager().query(query);
    const leastUsed = rawData[0].server_id
    console.log('Least used Server', leastUsed)
    return leastUsed
}

export const checkRoomCapacity = async (roomId: string) => {
    const where = { roomId }
    const count = await Participant.count({ where })
    console.log(`Room ${roomId} -> ${count} participants`)
    if (count >= MAX_PARTICIPANTS_PER_ROOM) {
        throw new ServiceError('No Capacity on selected room')
    }
}

export const checkServerCapacity = async (serverId: number) => {
    const where = { room: { serverId } }
    const count = await Participant.count({ where })

    console.log(`Server ${serverId} -> ${count} participants`)
    if (count >= MAX_PARTICIPANTS_PER_SERVER) {
        throw new ServiceError('No Capacity on selected server')
    }
}

