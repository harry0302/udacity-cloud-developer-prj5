/**
* Fields in a response of signup user usecase.
*/
export interface SignupResponse {
    token: string
    user: {
        userId: string
        email: string
    }
}