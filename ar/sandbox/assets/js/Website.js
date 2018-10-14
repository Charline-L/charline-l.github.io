class Website {
    constructor() {
        const t = this

        alert("in website")

        t.init()
    }

    init(){
        const t = this

        t.getMarkers()
        t.defineCustomEvents()
    }

    getMarkers() {
        const t = this

        // pour l'instant en dur mais après sera un appel vers la base de donnée
        let patterns = [
            'patt.hiro',
            'patt.kanji',
            'patt.letterA',
            'patt.letterB'
        ]

        new Sandboxe({pattern: 'patt.hiro', id: 'ar-sandbox'})
        // for (let pattern of patterns)  new Sandboxe(pattern)
    }

    defineCustomEvents() {
        const t = this

        window.customEvents = {
            hideButtonDelete: new Event('hideButtonDelete'),
            showButtonDelete: new Event('showButtonDelete'),
        }
    }
}

new Website()