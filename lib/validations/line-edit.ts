import * as z from 'zod';

export const LineEditValidation = z.object({ 
    name: z.string().min(1, { message: 'Line name field is required!' }),
    status: z.string().min(1, { message: 'Status field is required!' }),
    cell_id: z.string().min(1, { message: 'Cell ID field is required!' }),
});