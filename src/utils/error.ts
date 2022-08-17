export class ErrorREST extends Error {
    public statusCode: number; 

    constructor(statusCode: number, message: string = undefined, ...args: any) {
        super(...args);
        this.statusCode = statusCode;
        this.message = message;
    }
}