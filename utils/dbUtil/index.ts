import { Pool } from "pg";

export const dbPool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: 5432,
    password: process.env.PASSWORD,
    ssl: true
})





