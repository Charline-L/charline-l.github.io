class Index {

    constructor() {

        this.init()
    }

    async init(){

        // await new NeedToken()
        Index.redirect()
    }

    static redirect() {

        localStorage.setItem('connected', 'true')
        document.location.href = localStorage.getItem('connected') === 'true' ? '/pages/home' : '/pages/login'
    }
}