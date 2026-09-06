import * as z from 'zod'
export const createPlantSchema = z.object({
    name: z.string().min(5),
    description: z.string().optional(),
}) 

export const plantResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    userID: z.string(),
})

export const plantListResponseSchema = z.array(plantResponseSchema)