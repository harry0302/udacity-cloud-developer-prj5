export interface User {
    userId: string
    email: string
    passwordHash: string
    createdAt: string
    updatedAt: string
}

export type UserSecured = Omit<User, "passwordHash"|"updatedAt">

