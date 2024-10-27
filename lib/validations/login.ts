import * as z from 'zod'

export const LoginValidation = z.object({
    email: z.string().email({message: 'Valid email is required!'}),
    password: z.string().min(1, {message: 'Password field is required!'}),
})