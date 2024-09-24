import "reflect-metadata"
import { DataSource } from "typeorm"
import { PersonalInfo } from "./entity/PersionalInfo"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [User, PersonalInfo],
    migrations: [],
    subscribers: [],
})
