class Home {

    constructor() {

        console.log('in home')

        this.init()
    }

    async init() {

        await new NeedToken()
        this.bindEvents()
    }

    bindEvents() {

    }
}