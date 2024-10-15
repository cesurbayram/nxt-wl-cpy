import { Login } from "@/types/login.types";

const userLogin = async(values: Login): Promise<boolean> => {
    const apiRes = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if(!apiRes.ok) throw new Error('An error occured when login user.')

    return true;
}

export { userLogin }