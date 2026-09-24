import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "root",
    password: "root_user_password_123",
    database: "mygarden_db",
    synchronize: false,
    entities: ["src/entities/*.entity.ts"],
    migrations: ["src/migrations/*.ts"],
});
