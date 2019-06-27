class app {

    constructor() {

        this.init()
    }

    init() {

        alert('no pwa')
        this.detectPage()
    }

    detectPage() {

        const pageClass = document.getElementById('page').getAttribute('data-page')
        eval(`new ${pageClass}()`);
    }
}

new app()