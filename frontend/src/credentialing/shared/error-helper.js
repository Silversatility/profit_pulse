import MESSAGES from '../message.constant';
class ErrorHelper {
    static getErrorMessage(err) {
        let data = err.data;
        if (!data || typeof(err) != 'object') {
            return MESSAGES.COMMON_ERROR;
        }
        return this.getFirstError(data);
    }

    static getFirstError(obj) {
        let firstError = obj[Object.keys(obj)[0]];
        if(typeof(firstError) == 'string'){
            return firstError;
        }
        if(Array.isArray(firstError)){
            return firstError[0];
        }
        return this.getFirstError(firstError);
    }

}
export default ErrorHelper;