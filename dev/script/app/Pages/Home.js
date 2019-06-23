class Home {

    constructor() {

        console.log('OK in Home')
        this.$logout = document.getElementById('logout')

        this.init()
    }

    async init() {

        await new NeedToken()
        this.bindEvents()
    }

    bindEvents() {

        this.$logout.addEventListener('click', Home.logout)
    }

    static logout() {

        localStorage.setItem('connected', 'false')
        document.location.href = "/"
    }
}