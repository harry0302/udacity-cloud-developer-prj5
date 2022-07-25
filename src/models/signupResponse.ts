/**
* Fields in a response of signup user usecase.
*/
export interface SignupResponse {
    user: {
        username: string
        email: string
        token: string
        displayName: string
    }
}