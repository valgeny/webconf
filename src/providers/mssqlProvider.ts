import { createConnection } from "typeorm";


export const connectToDb = async (): Promise<void> => {
    // createConnection method will automatically read connection options
    // from your ormconfig file or environment variables
    const connection = await createConnection();
}
