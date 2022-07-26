export const Errors = {
    BadRequest: {
        status: 400,
        error: "BadRequest"
    },
    Unauthorized: {
        status: 401,
        error: "Unauthorized"
    },
    Forbidden: {
        status: 403,
        error: "Forbidden"
    },
    InternalServerError: {
        status: 500,
        error: "InternalServerError"
    }
}

export class ErrorREST extends Error {
    public response: { status: number; error: string; message: string };

    constructor(error: { status: number, error: string }, message: string = undefined, ...args: any) {
        super(...args);
        this.response = { status: error.status, error: error.error, message: message };
    }
}