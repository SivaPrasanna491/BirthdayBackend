class ApiError extends Error{
    constructor(
        statusCode,
        message='Something went wrong',
        errors=[],
    ){
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.errors = errors;
    }
}

export {ApiError}