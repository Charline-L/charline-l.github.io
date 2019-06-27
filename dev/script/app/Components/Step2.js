window.MediaRecorder = require('audio-recorder-polyfill')

class Step2 {

    constructor(props) {

        this.$container = props.$container
        this.$instructions = this.$container.querySelectorAll('.p-step-two__instruction')
        this.$buttons = this.$container.querySelectorAll('.p-step-two__button')
        this.$heads = this.$container.querySelectorAll('.p-step-two__head')
        this.$rights = this.$container.querySelectorAll('.p-step-two__right')
        this.$lefts = this.$container.querySelectorAll('.p-step-two__left')

        this.$containerIllu = this.$container.querySelector('.p-step-two__poda')

        this.buttonsOrigins = []
        this.currentIndex = 0

        this.$player = this.$container.querySelector('.p-step-two__audio')

        this.init()
    }

    init() {

        this.reset()
        // this.getValues()
        this.setUpSlides()
        this.bindEvents()
    }

    start() {

        this.setUpRecorder()
        this.updateStep()
    }

    reset(){

        localStorage.removeItem('food-detected')
    }

    setUpRecorder() {

        const scopeStep = this

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

                scopeStep.mediaRecorder = new MediaRecorder(stream)

                scopeStep.chunks = []

                // passe l'audio dans le player
                scopeStep.mediaRecorder.addEventListener('dataavailable', e => {
                    scopeStep.chunks.push(e.data)
                    scopeStep.$player.src = URL.createObjectURL(e.data)
                    scopeStep.sendBlob()
                })
            })
            .catch(() => {
                alert('pas de media')
            })

    }

    // getValues() {
    //
    //     const topContainer = this.$containerIllu.getBoundingClientRect().top
    //     const leftContainer = this.$containerIllu.getBoundingClientRect().left
    //
    //     this.$buttons.forEach( $button => {
    //
    //         const buttonW = $button.getBoundingClientRect().width
    //         const buttonH = $button.getBoundingClientRect().height
    //
    //         const centerX = $button.getBoundingClientRect().left + buttonW / 2 - leftContainer
    //         const centerY = $button.getBoundingClientRect().top + buttonH / 2 - topContainer
    //         const origin = centerX + "px " + centerY + "px 0"
    //
    //         this.buttonsOrigins.push(origin)
    //     })
    // }

    setUpSlides() {

        // instructions
        anime.set(
            this.$instructions,
            {
                opacity: 0,
                translateY: 20
            }
        )

        // icone
        anime.set(
            this.$buttons,
            {
                opacity: 0
            }
        )

        // tete
        anime.set(
            this.$heads[1],
            {
                opacity: 0,
            }
        )

        // main
        anime.set(
            this.$lefts[1],
            {
                opacity: 0,
            }
        )

        anime.set(
            this.$rights[1],
            {
                opacity: 0,
            }
        )
    }

    bindEvents() {

        // click micro
        this.$buttons.forEach($button => {

            $button.addEventListener('click', () => {

                const isStart = $button.classList.contains('p-step-two__button--start')

                if (isStart) this.startRecording()
                else this.stopRecording()
            })
        })
    }

    startRecording() {

        // vide données
        this.chunks = []

        // lance audio
        this.mediaRecorder.start()

        // stop par défaut dans 5s
        this.timerMaxRecording = setTimeout(() => {
            this.stopRecording()
        }, 60000)

        // animation
        this.updateStep()
    }

    stopRecording() {

        // enlève timer
        clearTimeout(this.timerMaxRecording)

        // arrete enregistrement
        this.mediaRecorder.stop()

        // enlève le micro
        anime({
            targets: this.$buttons[this.currentIndex - 1],
            opacity: 0,
        })

        // remet tete bonhomme normal
        anime.set(
            this.$heads[1],
            {
                opacity: 0,
            }
        )

        // remet bras
        anime.set(
            this.$rights[1],
            {opacity: 0}
        )
        anime.set(
            this.$rights[0],
            {opacity: 1}
        )
    }

    sendBlob() {

        this.success(['riz', 'viande', 'banane', 'fromage'])

        // PASSE EN DIRECT
        // // prépare enregistrement
        // let formData = new FormData()
        // formData.append('audio', new Blob(this.chunks))
        //
        // // envoit au server
        // new XHR({
        //     method: 'POST',
        //     url: 'child/detect-food',
        //     success: this.success.bind(this),
        //     error: this.error.bind(this),
        //     data: formData,
        //     needsHeader: false
        // })
    }

    success(wordDetected) {

        // enregistre données
        localStorage.setItem('food-detected', JSON.stringify(wordDetected))

        // prochaine étape
        document.dispatchEvent(new CustomEvent("nextStep"))
    }

    error() {

        console.log('error')
    }

    updateStep() {

        const scopeStep = this

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                // tete
                anime.set(
                    this.$heads[this.currentIndex],
                    {
                        opacity: 0
                    }
                )

                // change tete
                anime.set(
                    scopeStep.$heads[this.currentIndex],
                    {
                        opacity: 1
                    }
                )

                scopeStep.currentIndex++
            }
        })

        // si slide précédente
        if (this.currentIndex !== 0) {

            anime.set(
                this.$lefts[1],
                {opacity: 0}
            )
            anime.set(
                this.$lefts[0],
                {opacity: 1}
            )

            anime.set(
                this.$rights[1],
                {opacity: 1}
            )
            anime.set(
                this.$rights[0],
                {opacity: 0}
            )

            timeline
                .add({
                    targets: this.$buttons[this.currentIndex - 1],
                    opacity: 0
                }, 0)
                .add({
                    targets: this.$instructions[this.currentIndex - 1],
                    opacity: 0,
                    translateY: -20
                }, 0)
        }
        else {

            anime.set(
                this.$lefts[1],
                {opacity: 1}
            )
            anime.set(
                this.$lefts[0],
                {opacity: 0}
            )
        }

        // animation
        timeline
            .add({
                targets: this.$buttons[this.currentIndex],
                opacity: 1,
            }, 0)
            .add({
                targets: this.$instructions[this.currentIndex],
                opacity: 1,
                translateY: 0
            }, 0)
    }
}