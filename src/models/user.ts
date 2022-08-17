export interface User {
    userId: string
    email: string
    username: string
    bio: string
    image: string
    followers?: string[]
    passwordHash: string
    createdAt?: string
    updatedAt: string
}

export type UserSecured = Omit<User, "passwordHash" | "updatedAt">

