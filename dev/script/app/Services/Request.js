class Request {

    constructor(props) {

        this.method = props.method
        this.url = props.url
        this.success = props.success
        this.error = props.error || function(error) {console.log(error)}
        this.data = props.data

        this.init()
    }

    init() {
        const thisRegister = this

        this.req = new XMLHttpRequest()

        this.req.onreadystatechange = function(event) {

            if (this.readyState === XMLHttpRequest.DONE) {

                if (this.status === 200) {

                    const response = JSON.parse(this.responseText)

                    if (response.status === "success") thisRegister.success(response.message)
                    else thisRegister.error(response.message)
                }

                else {
                    console.log("Status de la réponse: %d (%s)", this.status, this.statusText)
                    thisRegister.error()
                }
            }
        }

        this.req.open(this.method, `http://192.168.1.75:3003/${this.url}`, true)
        this.req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        this.req.send(this.data)
    }
}