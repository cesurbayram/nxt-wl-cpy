import * as z from 'zod'

export const SignInValidation = z.object({
    username: z.string().min(1, {message: 'Username field is required!'}),
    password: z.string().min(1, {message: 'Password field is required!'}),
})