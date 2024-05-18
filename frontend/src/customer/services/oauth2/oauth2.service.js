const PROFIT_PULSE_ACCESS_TOKEN = 'ACCESS_TOKEN';


export default class Oauth2Service {
    constructor($q, CLIENT_ID, CLIENT_SECRET, apiService, sessionService) {
        this.$q = $q;
        this.clientId = CLIENT_ID;
        this.clientSecret = CLIENT_SECRET;
        this.apiService = apiService;
        this.sessionService = sessionService;
    }

    login(credential) {
        let uri = 'o/token/';
        let data = {
            username: credential.username,
            password: credential.password,
            grant_type: 'password',
            client_id: this.clientId,
            client_secret: this.clientSecret
        }
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        let formData = $.param(data);
        return this.apiService.post(uri, formData, null, headers)
            .then((data) => {
                return this.saveSessionData(data);
            });
    }

    getSessionData() {
        return this.sessionService.getItem(PROFIT_PULSE_ACCESS_TOKEN);
    }

    saveSessionData(data) {
        let expiresIn = data.expires_in || 0;
        data.expires_in = (new Date().getTime() + (1000 * expiresIn) - 5000); // before 5 seconds
        this.sessionService.setItem(PROFIT_PULSE_ACCESS_TOKEN, data);

        return data;
    }

    removeSessionData() {
        this.sessionService.remove(PROFIT_PULSE_ACCESS_TOKEN);
    }

    logout() {
        this.removeSessionData();
    }

    refreshToken() {
        let refreshToken = this.getRefreshToken();
        if (!refreshToken){
            return this.$q.reject('Invalid Refresh Token');
        }
        this.removeSessionData();

        let uri = 'o/token/';
        let data = {
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            client_id: this.clientId,
            client_secret: this.clientSecret
        }
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        let formData = $.param(data);

        return this.apiService.post(uri, formData, null, headers)
            .then((data) => {
                return this.saveSessionData(data);
            });
    }

    getAccessToken() {
        let data = this.getSessionData();
        if (data && data.access_token) {
            return data.access_token;
        }
        return null;
    }

    getRefreshToken () {
        let data = this.getSessionData();
        if (data && data.refresh_token) {
            return data.refresh_token;
        }
        return null;
    }

    getExpireDate() {
        let data = this.getSessionData();
        if (data && data.expires_in) {
            return data.expires_in;
        }
        return 0;
    }

    hasAccessToken() {
        let accessToken = this.getAccessToken();
        if (accessToken) {
            return true;
        }
        return false;
    }

    hasExpired() {
        return this.getExpireDate() < (new Date()).getTime();
    }

    authenticated() {
        return this.hasAccessToken();
    }
}

Oauth2Service.$inject = ['$q', 'CLIENT_ID', 'CLIENT_SECRET', 'apiService', 'sessionService'];