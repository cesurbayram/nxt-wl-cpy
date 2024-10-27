import { Login } from "@/types/login.types";
import { User } from "@/types/user.types";

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

const userLogout = async(): Promise<boolean> => {
    const apiRes = await fetch('/api/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if(apiRes.ok !== true) throw new Error('An error occured when logout');

    return true
}

const getUserAfterAuth = async(): Promise<User> => {
    const apiRes = await fetch('/api/get-user-auth', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if(apiRes.ok !== true) throw new Error('An error occured when fetch user');
    const result = await apiRes.json();
    return result
}

export { userLogin, userLogout, getUserAfterAuth }