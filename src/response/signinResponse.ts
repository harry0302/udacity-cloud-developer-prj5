/**
* Fields in a response signin user usecase.
*/
export interface SigninResponse {
    user: {
        token: string
        userId: string
        email: string
        username: string
        bio: string
        image: string
    }
}