window.MediaRecorder = require('audio-recorder-polyfill')

class _OLD_RegisterChild {

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

        this.$name = document.querySelector('.p-register-child__name')

        this.$recorders = document.querySelectorAll('.c-register-sound__button')
        this.$inputs = document.querySelectorAll('.c-register-sound__input')
        this.$labels = document.querySelectorAll('.c-register-sound__label')

        this.$player = document.getElementById('player')
        this.chunks = []

        this.$schoolName = document.querySelector('.p-register-child__school-name')
        this.$oneSchool = document.querySelector('.p-register-child__one-school')
        this.$multipleSchools = document.querySelector('.p-register-child__multiple-schools')
        this.$changeSchool = document.querySelector('.p-register-child__change-school')

        this.init()
    }

    async init() {

        await new NeedToken()
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
                const isLast = $button.classList.contains('p-register-child__button--last')

                if (isActive) this.nextStep($button.getAttribute('data-name'), isLast)
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

        // changer d'école
        this.$changeSchool.addEventListener('click', this.showMultipleSchools.bind(this))
    }

    nextStep(name, isLast) {

        // enregistre l'information
        this.childInfos[name] = this.currentInfo
        this.currentInfo = null

        // si name on ajoute dans le texte
        if (name === 'name') this.$name.innerHTML = this.childInfos[name]

        // met à jour la varible globale
        this.currentStep++

        // si ville on l'envoit pour vérifier l'école
        if  (name === 'city') this.getSchoolPossibilities()

        // lance animation
        else {
            if (isLast) this.saveInfos()
            else this.updateStep()
        }
    }

    updateStep() {

        this.$sections[this.currentStep - 1].classList.remove('p-register-child__section--active')
        this.$steps[this.currentStep - 1].classList.remove('p-register-child__step--active')

        this.$sections[this.currentStep].classList.add('p-register-child__section--active')
        this.$steps[this.currentStep].classList.add('p-register-child__step--active')
    }

    getSchoolPossibilities() {

        new XHR({
            method: 'POST',
            url: 'child/school-possibilities',
            success: this.successSchoolPossibilities.bind(this),
            error: this.errorSchoolPossibilities.bind(this),
            data: encodeURIComponent('city') + "=" + encodeURIComponent(this.childInfos.city)
        })
    }

    successSchoolPossibilities(success) {
        const response = JSON.parse(success)
        this.schools = response.infos

        // en fonction du nombre d'école on affiche ou pas la pré-sélection
        if (response.number === 1) this.showOneSchool()
        else this.showMultipleSchools()

        // passe à la prochiane étape
        this.updateStep()
    }

    errorSchoolPossibilities(error) {

        console.log('error', error)
    }

    showOneSchool() {

        this.$schoolName.innerHTML = this.schools[0].fields.appellation_officielle
        this.$oneSchool.classList.add('p-register-child__one-school--active')

        this.currentInfo = this.schools[0].fields.appellation_officielle
        this.$buttons[this.currentStep].classList.add('p-register-child__button--active')
    }

    showMultipleSchools() {

        this.$oneSchool.classList.remove('p-register-child__one-school--active')
        this.$multipleSchools.classList.add('p-register-child__multiple-schools--active')

        this.$buttons[this.currentStep].classList.remove('p-register-child__button--active')
    }

    selectColor(index, fromClick = false) {

        // récupère la couleur
        const color = this.$colors[index].getAttribute('data-color')

        // change le style du sélecteur
        document.querySelector('.c-register-color__item--active').classList.remove('c-register-color__item--active')
        this.$colors[index].classList.add('c-register-color__item--active')

        // change info pour server
        this.currentInfo = color

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
                formData.append('position', JSON.stringify(this.location))
                break;
            case 3 :
                url = 'detect-school'
                formData.append('schools', JSON.stringify(this.schools))
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

    saveInfos() {

        let formData = new FormData()
        formData.append('infos', JSON.stringify(this.childInfos))

        new XHR({
            method: 'POST',
            url: 'child/',
            success: this.successSave.bind(this),
            error: this.errorSave.bind(this),
            data: formData,
            needsHeader: false
        })
    }

    successSave() {

        document.location.href = '/pages/home'
    }

    errorSave() {

        console.log('in errorSave')
    }
}