// Error carrying an HTTP status so the central error handler can respond
// with the right code (e.g. 404) instead of the default 400.
export class HttpError extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
        this.name = 'HttpError'
    }
}
