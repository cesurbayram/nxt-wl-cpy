import { User } from "@/app/api/user/route"

const getUser = async (): Promise<User> => {
    const apiRes = await fetch('/api/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    console.log('apiRes', apiRes);
    
    const result = await apiRes.json()    
    return result
}

export { getUser }