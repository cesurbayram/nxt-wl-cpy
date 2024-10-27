import * as z from 'zod';

export const ControllerEditValidation = z.object({
    name: z.string().min(1, { message: 'Controller name field is required!' }),
    status: z.string().min(1, { message: 'Status field is required!' }),
    model: z.string().min(1, { message: 'Model field is required!' }),
    location: z.string().min(1, { message: 'Location field is required!' }),
    ipAddress: z.string().min(1, { message: 'IP address field is required!' }),
    // serialNumber: z.string().min(1, { message: 'Serial number field is required!' }),
    // intervalMs: z.number().min(1, { message: 'Interval must be at least 1 ms' }),
    // maxConnection: z.number().min(1, { message: 'Max connection must be at least 1' }),
});
