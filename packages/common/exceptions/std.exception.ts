export class StdException extends Error {
    constructor(message: string, public readonly code: number = 0) {
        super(message);
    }
}
