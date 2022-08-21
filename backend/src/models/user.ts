export interface User {
    email: string
    username: string
    bio: string
    image: string
    followers?: string[]
    following?: string[]
    passwordHash: string
    createdAt?: string
    updatedAt: string
}
