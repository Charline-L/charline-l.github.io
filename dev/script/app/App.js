class app {

    constructor() {

        this.init()
    }

    init() {

        alert('ok micro')
        this.detectPage()
    }

    detectPage() {

        const pageClass = document.getElementById('page').getAttribute('data-page')
        eval(`new ${pageClass}()`);
    }
}

new app()