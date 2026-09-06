import * as z from 'zod'

export const userCreateSchema = z.object({
    email: z.email(),
    password: z.string().min(5),
    name: z.string().min(3).optional(),
})

export const userResponseSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.email(),
})

export const userLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(5),
})

export const userLoginResponse = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
})