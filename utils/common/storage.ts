const addStorage = (key: string, data: any): void => {
    if(typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

const getDataFromStorage = (key: string) => {
    if(typeof window !== 'undefined') {
        const item = localStorage.getItem(key)
        if(item !== null){
            return JSON.parse(item);
        }  
    }
    return null
}

const deleteDataFromStorage = (key: string) => {
    localStorage.removeItem(key);
}

export {addStorage, getDataFromStorage, deleteDataFromStorage}