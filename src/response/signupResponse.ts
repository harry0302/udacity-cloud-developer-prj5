/**
* Fields in a response of signup user usecase.
*/
export interface SignupResponse {
    user: {
        token: string
        userId: string
        email: string
        username: string
        bio: string
        image: string
    }
}