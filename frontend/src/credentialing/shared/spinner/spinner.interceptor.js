function spinnerInterceptor($q, $rootScope) {
    let activeRequests = 0;

    let service = {
        request: request,
        response: response,
        responseError: responseError
    };
    return service;

    function request(config) {
        started();
        return config || $q.when(config);
    }

    function response(response){
        ended();
        return response || $q.when(response);
    }

    function responseError(rejection){
        ended();
        return $q.reject(rejection);
    }

    function started(){
        if (activeRequests === 0) {
            $rootScope.$broadcast('spinnerActive');
        }
        activeRequests++;
    }

    function ended(){
        activeRequests--;
        if (activeRequests === 0) {
            $rootScope.$broadcast('spinnerInactive');
        }
    }
}

spinnerInterceptor.$inject = ['$q', '$rootScope'];

export default spinnerInterceptor;