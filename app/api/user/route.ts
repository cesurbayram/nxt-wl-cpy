//GET POST PUT DELETE
//Typescript kullanıldığı için tiplere bakabilirsin.

import db from "@/utils/dbUtil"

interface User {
    firstName: String
}


export async function GET(request: Request){
    //Veri tsbsnı işlemi
    let userResp = []

    db.connect()
    
    try {
        const userDbResp = await db.query(`SELECT * FROM test`)
        userResp = userDbResp.rows
    } catch (error: any) {
        console.error('DB ERROR' + error?.message)        
    } finally {
        db.end()
    }

    return Response.json(userResp)
}


export async function POST(request: Request){
    //Veri tsbsnı işlemi
    
    const { firstName } : User  = await request.json()
    
    db.connect()
    
    try {
        await db.query(`INSERT INTO test (first_name) VALUES ($1)`, [firstName])
        
    } catch (error: any) {
        console.error('DB ERROR' + error?.message)        
    } finally {
        db.end()
    }

    return Response.json({message: 'User create sucess'})
}

export async function PUT(){

}

export async function DELETE(){

}