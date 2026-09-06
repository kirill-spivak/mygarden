import { randomBytes } from "node:crypto"

export const generateRefreshToken = (length: number) => {
    return randomBytes(length).toString("hex")
}