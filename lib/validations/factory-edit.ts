import * as z from 'zod';

export const FactoryEditValidation = z.object({ 
    name: z.string().min(1, { message: 'Factory name field is required!' }),
    status: z.string().min(1, { message: 'Status field is required!' }),
    line_id: z.string().min(1, { message: 'Line ID field is required!' }),
});