class NeedToken {

    constructor() {

        new XHR({
            method: 'GET',
            url: 'auth',
            success: this.success.bind(this),
            error: this.error.bind(this),
            data: null
        })
    }

    success() {

        localStorage.setItem('connected', 'true')
    }

    error() {

        localStorage.setItem('connected', 'false')

        // renvoi vers connexion
        document.location.href = '/pages/login'
    }
}
class XHR {

    constructor(props) {

        this.method = props.method
        this.url = props.url
        this.success = props.success
        this.error = props.error
        this.data = props.data
        this.needsHeader = props.needsHeader !== undefined ? props.needsHeader : true

        this.init()
    }

    init() {

        this.req = new XMLHttpRequest()

        const req = this.req
        const thisRegister = this

        this.req.onload = function () {

            if (req.status === 200) {

                const response = JSON.parse(this.responseText)

                if (response.status === "success") thisRegister.success(response.message)
                else thisRegister.error(response.message)
            }

            else {
                console.log("Status de la réponse: %d (%s)", this.status, this.statusText)
                thisRegister.error()
            }
        }

        console.log('before send XHR')

        this.req.withCredentials = true
        this.req.open(this.method, `https://192.168.1.75:3003/${this.url}`, true)
        // this.req.open(this.method, `https://10.30.21.24:3003/${this.url}`, true)

        // pas d'hearder lorsque l'on envoit un blob
        if (this.needsHeader) this.req.setRequestHeader("Content-type","application/x-www-form-urlencoded")

        this.req.send(this.data)
    }
}
class Home {

    constructor() {

        this.$logout = document.getElementById('logout')

        this.init()
    }

    async init() {

        await new NeedToken()
        this.bindEvents()
    }

    bindEvents() {

        this.$logout.addEventListener('click', Home.logout)
    }

    static logout() {

        localStorage.setItem('connected', 'false')
        document.location.href = "/"
    }
}
class Index {

    constructor() {

        this.init()
    }

    async init(){

        await new NeedToken()
        Index.redirect()
    }

    static redirect() {

        document.location.href = localStorage.getItem('connected') === 'true' ? '/pages/home' : '/pages/login'
    }
}
class Login {

    constructor() {

        this.$form = document.querySelector('#loginForm')

        this.init()
    }


    init() {

        this.bindEvents()
    }

    bindEvents() {

        // submit form
        this.$form.addEventListener('submit', this.checkBeforeSubmit.bind(this))
    }

    checkBeforeSubmit(e) {

        // prevent default
        e.preventDefault()

        console.log('submit')

        // récupère nos données
        const data = serialize(this.$form)

        // créer la requete
        new XHR({
            method: 'POST',
            url: 'auth/login',
            success: this.success.bind(this),
            error: this.error.bind(this),
            data: data
        })
    }

    success() {

        document.location.href = '/pages/home'
    }

    error(error) {
        console.log('error', error)
    }
}
class Register {

    constructor() {

        this.$form = document.querySelector('#registerForm')

        this.init()
    }

    init() {

        this.bindEvents()
    }

    bindEvents() {

        // submit form
        this.$form.addEventListener('submit', this.checkBeforeSubmit.bind(this))
    }

    checkBeforeSubmit(e) {

        // prevent default
        e.preventDefault()

        // récupère nos données
        const data = serialize(this.$form)

        // créer la requete
        new Request({
            method: 'POST',
            url: 'auth/register',
            success: this.success.bind(this),
            error: this.error.bind(this),
            data: data
        })
    }

    success() {

        document.location.href = '/pages/register-child'
    }

    error(error) {
        console.log('error', error)
    }
}
window.MediaRecorder = require('audio-recorder-polyfill')

class RegisterChild {

    constructor() {

        this.childInfos = {
            color: null,
            name: null,
            city: null,
            school : null
        }

        this.currentStep = 0
        this.currentInfo = null

        this.$sections = document.querySelectorAll('.p-register-child__section')
        this.$steps = document.querySelectorAll('.p-register-child__step')
        this.$buttons = document.querySelectorAll('.p-register-child__button')

        this.$colors = document.querySelectorAll('.c-register-color__item')
        this.$avatar = document.querySelector('.c-register-color__avatar')

        this.$recorders = document.querySelectorAll('.c-register-sound__button')
        this.$inputs = document.querySelectorAll('.c-register-sound__input')
        this.$labels = document.querySelectorAll('.c-register-sound__label')

        this.$player = document.getElementById('player')
        this.chunks = []

        this.init()
    }

    init() {

        this.setUpElements()
        this.selectColor(0)
        this.setupAudio()
        this.getLocation()
        this.bindEvents()
    }

    setupAudio() {

        const thisRegister = this

        const constraints = {
            audio: {
                sampleRate: 48000,
                channelCount: 1,
                volume: 1.0,
                echoCancellation: true,
                autoGainControl: true
            },
            video: false
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {

                thisRegister.mediaRecorder = new MediaRecorder(stream)

                thisRegister.chunks = []

                // passe l'audio dans le player
                thisRegister.mediaRecorder.addEventListener('dataavailable', e => {
                    thisRegister.chunks.push(e.data)
                    thisRegister.$player.src = URL.createObjectURL(e.data)
                    thisRegister.sendBlob()
                })
            })
            .catch(() => {
                alert('pas de media')
            })
    }

    getLocation() {

        this.location = {
            lat: null,
            long: null
        }

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition( (position) => {

                this.location = {
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                }

                console.log('this.location', this.location)
            }, (error) => {
                console.log('erreur', error)
            });
        }
        else {
            console.log('no geoloc')
        }
    }

    setUpElements() {

        this.$sections[this.currentStep].classList.add('p-register-child__section--active')
        this.$steps[this.currentStep].classList.add('p-register-child__step--active')
        this.$colors[this.currentStep].classList.add('c-register-color__item--active')
    }

    bindEvents() {

        // click boutons suivant
        this.$buttons.forEach($button => {

            $button.addEventListener('click', () => {

                const isActive = getIndexNode($button, this.$buttons) === this.currentStep && $button.classList.contains('p-register-child__button--active')

                if (isActive) this.nextStep($button.getAttribute('data-name'))
            })
        })

        // click couleur
        this.$colors.forEach($color => {

            $color.addEventListener('click', () => {

                const isActive = $color.classList.contains('c-register-color__item--active')

                if (!isActive) this.selectColor(getIndexNode($color, this.$colors), true)
            })
        })

        // click son
        this.$recorders.forEach($recorder => {

            $recorder.addEventListener('click', () => {

                const isActive = $recorder.classList.contains('c-register-sound__button--active')

                if (!isActive) this.startRecording($recorder)
                else this.stopRecording($recorder)
            })
        })

        // changement des inputs
        this.$inputs.forEach($input => {

            $input.addEventListener('change', () => {
                this.currentInfo = $input.value
            })
        })
    }

    nextStep(name) {

        // enregistre l'information
        this.childInfos[name] = this.currentInfo
        this.currentInfo = null

        // met à jour la varible globale
        this.currentStep++

        // lance animation
        this.updateStep()
    }

    updateStep() {

        this.$sections[this.currentStep - 1].classList.remove('p-register-child__section--active')
        this.$steps[this.currentStep - 1].classList.remove('p-register-child__step--active')

        this.$sections[this.currentStep].classList.add('p-register-child__section--active')
        this.$steps[this.currentStep].classList.add('p-register-child__step--active')
    }

    selectColor(index, fromClick = false) {

        // récupère la couleur
        const color = this.$colors[index].getAttribute('data-color')

        // change le style du sélecteur
        document.querySelector('.c-register-color__item--active').classList.remove('c-register-color__item--active')
        this.$colors[index].classList.add('c-register-color__item--active')

        // change info pour server
        this.childInfos.color = color

        // change info visuellement
        this.$avatar.style.backgroundColor = color

        // passe le bouton en actif si vient d'un click
        if (fromClick) this.$buttons[this.currentStep].classList.add('p-register-child__button--active')
    }

    startRecording($recorder) {

        // affiche visuellement
        $recorder.classList.add('c-register-sound__button--active')
        $recorder.innerHTML = 'stop'

        // vide données
        this.chunks = []

        // lance audio
        this.mediaRecorder.start()

        // stop par défaut dans 5s
        this.timerMaxRecording = setTimeout(() => {
            this.stopRecording($recorder)
        }, 3000)
    }

    async stopRecording($recorder) {

        // enlève timer
        clearTimeout(this.timerMaxRecording)

        // affiche visuellement
        $recorder.classList.remove('c-register-sound__button--active')
        $recorder.innerHTML = 'enregistrer'

        // arrete enregistrement
        this.mediaRecorder.stop()
    }

    sendBlob(){

        // prépare enregistrement
        let formData = new FormData()
        formData.append('audio', new Blob(this.chunks))

        // prépare url
        let url = null
        switch (this.currentStep) {
            case 1 :
                url = 'detect-name'
                break;
            case 2 :
                url = 'detect-city'
                // ajoute la position
                formData.append('position', JSON.stringify(this.location))
                break;
            case 3 :
                url = 'detect-school'
                break;
            default :
                console.error('no step defined')
                break
        }

        // envoit au server
        new XHR({
            method: 'POST',
            url: 'child/' + url,
            success: this.success.bind(this),
            error: this.error.bind(this),
            data: formData,
            needsHeader: false
        })
    }

    success(wordDetected) {

        const stringOfWordsDetected = wordDetected.toString().replace(',', ' ')

        // ajoute les mots
        this.$inputs[this.currentStep - 1].value = stringOfWordsDetected

        // affiche le résultat
        this.$labels[this.currentStep - 1].classList.add('c-register-sound__label--active')

        // enregistre l'info
        this.currentInfo = stringOfWordsDetected

        // active boutton
        this.$buttons[this.currentStep].classList.add('p-register-child__button--active')
    }

    error() {
        console.log('error')
    }
}
class app {

    constructor() {

        this.init()
    }

    init() {

        this.detectPage()
    }

    detectPage() {

        const pageClass = document.getElementById('page').getAttribute('data-page')
        eval(`new ${pageClass}()`);
    }
}

new app()