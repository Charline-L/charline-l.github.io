class app {

    constructor() {

        this.init()
    }

    init() {

        this.detectPage()
        this.scrollTop()
    }

    scrollTop() {

        setTimeout( function() {
            alert("scroll")
            window.scrollTo(0, 1)
        }, 1000)
    }

    detectPage() {

        const pageClass = document.getElementById('page').getAttribute('data-page')
        eval(`new ${pageClass}()`);
    }
}

new app()