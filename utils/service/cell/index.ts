import { Cell } from "@/types/cell.types";

const getCell = async (): Promise<Cell[]> => {
    const apiRes = await fetch('/api/cell', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiRes.ok !== true) throw new Error('An error occurred when fetching cells');
    
    const result = await apiRes.json();
    return result;
}

const getCellById = async (id: string): Promise<Cell> => {
    console.log('id in method', id);
    
    const apiRes = await fetch(`/api/cell/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!apiRes.ok) throw new Error('An error occurred when fetching cell by id');
    
    const result = await apiRes.json();
    return result;
};

const deleteCell = async ({ id }: Cell): Promise<boolean> => {
    const body = { id };
    const apiRes = await fetch('/api/cell', {
        method: 'DELETE',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiRes.ok !== true) throw new Error('An error occurred when deleting cell');
    
    return true;
}

const createCell = async (values: Cell): Promise<boolean> => {
    const apiRes = await fetch('/api/cell', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!apiRes.ok) {
        const errorData = await apiRes.json();
        throw new Error(`An error occurred when creating cell: ${errorData.message || 'Unknown error'}`);
    }

    return true;
}

const updateCell = async (values: Cell): Promise<boolean> => {
    const apiRes = await fetch('/api/cell', {
        method: 'PUT',
        body: JSON.stringify(values),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiRes.ok !== true) throw new Error('An error occurred when updating cell.');
    
    return true;
}

export { getCell, getCellById, deleteCell, createCell, updateCell };
