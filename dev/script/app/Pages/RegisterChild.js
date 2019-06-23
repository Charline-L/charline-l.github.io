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

        this.$player = document.getElementById('player')
        this.chunks = []

        this.init()
    }

    init() {

        this.setUpElements()
        this.selectColor(0)
        this.setupAudio()
        this.bindEvents()
    }

    setupAudio() {

        const thisRegister = this

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function (stream) {

                thisRegister.mediaRecorder = new MediaRecorder(stream)

                // Set record to <audio> when recording will be finished
                thisRegister.mediaRecorder .addEventListener('dataavailable', e => {
                    thisRegister.$player.src = URL.createObjectURL(e.data)
                })

                // Start recording
                thisRegister.mediaRecorder .start()
            })
            .catch(() => {
                alert('pas de media')
            })
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

    stopRecording($recorder) {

        // enlève timer
        clearTimeout(this.timerMaxRecording)

        // affiche visuellement
        $recorder.classList.remove('c-register-sound__button--active')
        $recorder.innerHTML = 'enregistrer'

        // lecture
        this.mediaRecorder.stop()

        // lance loader

        // afiche l'input pré-rempli
    }
}