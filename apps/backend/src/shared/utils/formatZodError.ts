import * as z from "zod";

export const formatZodError = (error: z.ZodError): Record<string, string> => {
    return error.issues.reduce(
        (acc, issue) => {
            const path = issue.path.join(".");

            const key = path || "_root";

            acc[key] = `${issue.message}.`;

            return acc;
        },
        {} as Record<string, string>,
    );
};
