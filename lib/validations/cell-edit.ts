import * as z from 'zod';

export const CellEditValidation = z.object({ 
    name: z.string().min(1, { message: 'Cell name field is required!' }),
    status: z.string().min(1, { message: 'Status field is required!' }),
});
