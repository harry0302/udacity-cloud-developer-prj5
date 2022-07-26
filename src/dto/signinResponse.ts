/**
* Fields in a response signin user usecase.
*/
export interface SigninResponse {
    user: {
        username: string
        email: string
        token: string
        displayName: string
    }
}