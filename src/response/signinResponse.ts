/**
* Fields in a response signin user usecase.
*/
export interface SigninResponse {
    token: string
    user: {
        userId: string
        email: string
    }
}