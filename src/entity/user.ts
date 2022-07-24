export interface User {
    username: string
    email: string
    displayName: string
    passwordHash: string
    createdAt: string
    updatedAt: string
}

export type UserSecured = Omit<User, "passwordHash"|"createdAt"|"updatedAt">

export function emptyUser(): User {
    return {
        username: '',
        email: '',
        displayName: '',
        passwordHash: '',
        createdAt: '',
        updatedAt: '',
    }

}
