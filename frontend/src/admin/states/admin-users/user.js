export default class User {
    constructor() {
        this.first_name = '',
        this.last_name = '',
        this.email = '',
        this.password1 = '',
        this.password2 = '',
        this.is_owner = false,
        this.manager = {
          credentialing_only: false
        }
    }
}
