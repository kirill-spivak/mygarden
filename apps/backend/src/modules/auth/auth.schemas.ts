import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .min(4, { message: "Имя должно содержать не менее 4 символов" }),
    email: z
        .string()
        .trim()
        .pipe(z.email({ message: "Некорректный email" })),
    password: z
        .string()
        .min(6, { message: "Пароль должен содержать не менее 6 символов" }),
});
