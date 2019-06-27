class app {

    constructor() {

        this.init()
    }

    init() {

        this.detectPage()
        alert('ok no token')
    }

    detectPage() {

        const pageClass = document.getElementById('page').getAttribute('data-page')
        eval(`new ${pageClass}()`);
    }
}



new app()