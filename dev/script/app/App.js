class app {

    constructor() {

        this.init()
    }

    init() {

        this.detectPage()
        this.toggleFullScreen()
    }

    toggleFullScreen() {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen;

        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement) {
            console.log('in if')
            requestFullScreen.call(docEl);
        }
        else {
            console.log('in else')
            cancelFullScreen.call(doc);
        }
    }

    detectPage() {

        const pageClass = document.getElementById('page').getAttribute('data-page')
        eval(`new ${pageClass}()`);
    }
}

new app()