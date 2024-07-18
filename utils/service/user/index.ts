import { User } from "@/types/user.types"

const getUser = async (): Promise<User[]> => {
    const apiRes = await fetch('/api/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if(apiRes.ok !== true) throw new Error('An error occured when fetching users')
    
    const result = await apiRes.json()    
    return result
}

const deleteUser = async ({ id }: User): Promise<boolean> => {
    const body = { id }
    const apiRes = await fetch('/api/user', {
        method: 'DELETE',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if(apiRes.ok !== true) throw new Error('An error occured when deleting user')
    
    return true
}

export { getUser, deleteUser }