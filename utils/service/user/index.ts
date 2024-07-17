
const getUser = async () => {
    const apiRes = await fetch('http://localhost:3000/api/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    const result = await apiRes.json()    
    return result
}


export { getUser }