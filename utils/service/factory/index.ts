import { Factory } from "@/types/factory.types";

const getFactory = async (): Promise<Factory[]>=> {
    const apiRes = await fetch('/api/factory', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (apiRes.ok !== true) throw new Error('An error occurred when fetching factory');
    
    const result = await apiRes.json();
    return result;
}

const getFactoryById = async (id: string): Promise<Factory> => {
    console.log('id in method', id);

    const apiRes = await fetch(`/api/factory/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!apiRes.ok) throw new Error('An error occurred when fetching factory by id');
    
    const result = await apiRes.json();
    return result;
};

const deleteFactory = async ({ id }: Factory): Promise<boolean> => {
    const body = { id };
    const apiRes = await fetch('/api/factory', {
        method: 'DELETE',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiRes.ok !== true) throw new Error('An error occurred when deleting factory');
    
    return true;
}

const createFactory = async (values: Factory): Promise<boolean> => {
    const apiRes = await fetch('/api/factory', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!apiRes.ok) {
        const errorData = await apiRes.json();
        throw new Error(`An error occurred when creating factory: ${errorData.message || 'Unknown error'}`);
    }

    return true;
}

const updateFactory = async (values: Factory): Promise<boolean> => {
    const apiRes = await fetch('/api/factory', {
        method: 'PUT',
        body: JSON.stringify(values),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiRes.ok !== true) throw new Error('An error occurred when updating factory.');
    
    return true;
}

export { getFactory, getFactoryById, deleteFactory, createFactory, updateFactory};