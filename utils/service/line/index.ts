import { Line } from "@/types/line.types";

const getLine = async (): Promise<Line[]> => {
    const apiRes = await fetch('/api/line', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiRes.ok !== true) throw new Error('An error occurred when fetching lines');
    
    const result = await apiRes.json();
    return result;
}

const getLineById = async (id: string): Promise<Line> => {

    const apiRes = await fetch(`/api/line/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!apiRes.ok) throw new Error('An error occurred when fetching line by id');
    
    const result = await apiRes.json();
    return result;
};

const deleteLine = async ({ id }: Line): Promise<boolean> => {
    const body = { id };
    const apiRes = await fetch('/api/line', {
        method: 'DELETE',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiRes.ok !== true) throw new Error('An error occurred when deleting line');
    
    return true;
}

const createLine = async (values: Line): Promise<boolean> => {
    const apiRes = await fetch('/api/line', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!apiRes.ok) {
        const errorData = await apiRes.json();
        throw new Error(`An error occurred when creating line: ${errorData.message || 'Unknown error'}`);
    }

    return true;
}

const updateLine = async (values: Line): Promise<boolean> => {
    const apiRes = await fetch('/api/line', {
        method: 'PUT',
        body: JSON.stringify(values),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiRes.ok !== true) throw new Error('An error occurred when updating line.');
    
    return true;
}

export { getLine, getLineById, deleteLine, createLine, updateLine };
