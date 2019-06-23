class Index {
    constructor() {

        this.isConnected = false

        this.init()
    }

    init(){

        console.log('this.isConnected', this.isConnected)
        document.location.href = this.isConnected ? '/pages/home' : '/pages/connect'
    }

}