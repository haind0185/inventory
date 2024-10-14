export const success = (data = {}, code = 200, message = '') => {
    return {
        code: code,
        data: data,
        message: message,
    }
}

export const error = (message = '', code = 500, data = {}) => {
    return {
        code: code,
        data: data,
        message: message,
    }
}