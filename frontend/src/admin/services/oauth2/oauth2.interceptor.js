function oauth2Interceptor($injector) {
    let service = {
        request: request
    };
    return service;

    function request(config) {
        let oauth2Service = $injector.get('oauth2Service');
        config.headers = config.headers || {};

        if (oauth2Service.hasAccessToken() && (!oauth2Service.hasExpired() || config.url.endsWith('/o/token/'))) {
            let accessToken = oauth2Service.getAccessToken();
            config.headers.Authorization = `Bearer ${accessToken}`;
            return config;
        }
        if(!oauth2Service.hasAccessToken()) {
            return config;
        }

        return oauth2Service.refreshToken()
            .then(data => {
                let accessToken = oauth2Service.getAccessToken();
                config.headers.Authorization = `Bearer ${accessToken}`;
                return config;
            });
    }
}

oauth2Interceptor.$inject = ['$injector'];

export default oauth2Interceptor;
