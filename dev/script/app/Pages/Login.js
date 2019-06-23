class Login {

    constructor() {

        this.$form = document.querySelector('#loginForm')

        this.init()
    }


    init() {

        this.bindEvents()
    }

    bindEvents() {

        // submit form
        this.$form.addEventListener('submit', this.checkBeforeSubmit.bind(this))
    }

    checkBeforeSubmit(e) {

        // prevent default
        e.preventDefault()

        // récupère nos données
        const data = serialize(this.$form)

        // créer la requete
        new Request({
            method: 'POST',
            url: 'auth/login',
            success: this.success.bind(this),
            error: this.error.bind(this),
            data: data
        })
    }

    success() {
        document.location.href = '/pages/home'
    }

    error(error) {
        console.log('error', error)
    }
}