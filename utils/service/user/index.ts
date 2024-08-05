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

const getUserById = async ({id}: User): Promise<User> => {
    console.log('id in method', id);
    
    const apiRes = await fetch(`/api/user/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if(apiRes.ok !== true) throw new Error('An error occured when fetch user by id')
    
    const result = await apiRes.json()
    
    return result;
}

const deleteUser = async ({ id }: User): Promise<boolean> => {
    const body = { id }
    const apiRes = await fetch('/api/user', {
        method: 'DELETE',
        body: JSON.stringify(body),        
    })

    if(apiRes.ok !== true) throw new Error('An error occured when deleting user')
    
    return true
}

const createUser = async (values: User): Promise<boolean> => {
    const body = values
    const apiRes = await fetch('/api/user', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if(apiRes.ok !== true) throw new Error('An error occured when creating user.')

    return true
}

export { getUser, deleteUser, createUser, getUserById }