export class ErrorREST extends Error {
    public statusCode: number; 

    constructor(statusCode: number, message: any = undefined, ...args: any) {
        super(...args);
        this.statusCode = statusCode;
        this.message = message;
    }
}