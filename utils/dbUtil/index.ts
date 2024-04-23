import { Client } from "pg";

const db = new Client({
    user: process.env.USER,    
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: 5432,
    password: process.env.PASSWORD,
    ssl: true
})



export default db;
