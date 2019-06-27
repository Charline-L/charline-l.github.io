class AddMeal {

    constructor() {

        this.$daysToAdd = document.querySelectorAll('.js-day-to-add')
        this.$container = document.querySelector('.p-home__add-meal')
        this.$steps = document.querySelectorAll('.p-home-step')
        this.$top = document.querySelector('.p-home-top')

        this.currentStep = 0

        this.init()
    }

    init() {

        this.step1 = new Step1({$container : document.querySelector('.p-home-step--one')})
        this.step2 = new Step2({$container : document.querySelector('.p-home-step--two')})
        this.step3 = new Step3({$container : document.querySelector('.p-home-step--three')})

        // TODO : Results.updateStorage('true')

        this.bindEvents()
    }

    bindEvents() {

        // ajouter un repas
        this.$daysToAdd.forEach($day => {

            $day.addEventListener('click', () => {
                this.selectDay($day.getAttribute('data-day'))
            })
        })

        // changement de step
        document.addEventListener("nextStep", this.nextStep.bind(this) )

        // TODO : retour accueil
    }

    selectDay(day) {

        // enregistre le jour
        this.dayToAdd = day

        // affiche container
        this.$container.classList.add('p-home__add-meal--active')

        // change le top
        this.$top.classList.remove('p-home-top--progress')
        this.$top.classList.add('p-home-top--back')

        // lance step
        this.showStep()
    }

    nextStep() {

        this.currentStep++
        this.showStep()
    }

    showStep() {

        const isFirst = this.currentStep === 0

        let $currentStep
        let $currentPops
        let $currentFades

        if (!isFirst) {

            $currentStep = this.$steps[this.currentStep - 1]
            $currentPops = $currentStep.querySelectorAll('.js-pop')
            $currentFades = $currentStep.querySelectorAll('.js-fade')
        }

        const $nextStep = this.$steps[this.currentStep]
        const $nextFades = $nextStep.querySelectorAll('.js-fade')
        const $nextPops = $nextStep.querySelectorAll('.js-pop')

        // prépare animation
        anime.set(
            $nextPops,
            {
                scale: 0
            }
        )

        anime.set(
            $nextFades,
            {
                opacity: 0,
                translateY: 20
            }
        )

        // affiche la slide si besoin
        if (isFirst) $nextStep.classList.add('p-home-step--active')

        // lance animation
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {

                // lance préparation des écrans
                switch (this.currentStep) {
                    case 0 :
                        this.step1.start()
                        break;
                    case 1 :
                        this.step2.start()
                        break;
                    default :
                        console.log('no index')
                }
            }
        })

        // animation de départ
        if (!isFirst) {

            timeline
                .add({
                    targets: $currentPops,
                    scale: 1,
                    easing: 'easeOutElastic(1, .6)',
                    duration: 500,
                    delay: anime.stagger(100)
                })
                .add({
                    targets: $currentFades,
                    opacity: 1,
                    translateY: 0,
                    easing: 'cubicBezier(.5, .05, .1, .3)',
                    delay: anime.stagger(100),
                    complete: () => {

                        $nextStep.classList.add('p-home-step--active')
                        $currentStep.classList.remove('p-home-step--active')
                    }
                }, '-=250')
        }

        // animation
        timeline
            .add({
                targets: $nextPops,
                scale: 1,
                easing: 'easeOutElastic(1, .6)',
                duration: 500,
                delay: anime.stagger(100)
            })
            .add({
                targets: $nextFades,
                opacity: 1,
                translateY: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                delay: anime.stagger(100)
            }, '-=250')
    }
}
class Illustration {

    constructor(props) {

        this.$container = props.$container
        this.$audio = document.getElementById("audioBodymoving")

        this.init()
    }

    init() {

        this.setUpAnimation()
        this.bindEvents()
    }

    setUpAnimation() {

        const params = {
            container: this.$container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '../assets/bodymoving/walk/data.json'
        }

        this.anim = lottie.loadAnimation(params)
    }

    bindEvents() {

        // si click stop animation et parle
        this.$container.addEventListener('click', () => {

            // stop
            this.anim.pause()

            // parle
            this.$audio.play()
        })

        // fin audio
        this.$audio.addEventListener("ended", () => {
            this.anim.play()
        })
    }
}
class Results {

    constructor() {

        this.$results = document.querySelector('.p-home-results')
        this.$ilustration = document.querySelector('.p-home-activity__container-illustration')
        this.$container = document.querySelector('.p-home-activity')
        this.$swipe = document.querySelector('.p-home-results__swipe')
        this.$top = document.querySelector('.p-home-activity__top')

        this.$iconBottom = document.querySelector('.js-poda-icon')
        this.$animates = document.querySelectorAll('.js-animate-top')

        this.areResultsOpen = false

        this.init()
    }

    async init() {

        Results.updateStorage('false')
        this.setUpCSS()
        this.setUpHammer()
        this.bindEvents()
    }

    static updateStorage(value) {

        localStorage.setItem('results', value)
    }

    setUpCSS() {

        // taille middle
        this.resultH = this.$results.clientHeight
        this.topH = this.$top.clientHeight

        const containerH = this.$container.clientHeight

        this.$ilustration.style.height = containerH - this.resultH - this.topH + 'px'

        // récupère la taille du swipe
        this.swipeH = this.$swipe.clientHeight

        // set la taille du container
        anime.set(
            this.$results,
            {
                height: this.resultH
            }
        )
    }

    setUpHammer() {

        this.hammer = new Hammer(this.$results)
        this.hammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL })
    }

    bindEvents() {

        // swipe
        this.hammer.on('swipeup', () => {

            if (this.areResultsOpen) return null
            else this.openResults()
        })

        this.hammer.on('swipedown', () => {

            if (!this.areResultsOpen) return null
            else this.closeResults()
        })
    }

    openResults() {
        const scopeHome = this

        // prépare animation
        anime.set(
            this.$animates,
            {
                opacity: 0,
                translateY: 10
            }
        )

        if (localStorage.getItem('results') === 'false') {
            anime.set(
                this.$iconBottom,
                { scale: 0 }
            )

            this.$iconBottom.style.display = 'block'
            this.$results.classList.add('p-home-results--waiting')
        }
        else {

            this.$results.classList.add('p-home-results--complete')
        }

        // récupère la taille du swipe
        const oldH = this.swipeH
        this.$swipe.style.height = 'auto'
        this.swipeH = this.$swipe.clientHeight
        this.$swipe.style.height = oldH + 'px'

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = true
            }
        })

        // animation
        timeline
            .add({
                targets: this.$results,
                height: this.resultH + this.swipeH,
                easing: 'easeOutElastic(1, .6)',
                duration: 750,
            })
            .add({
                targets: this.$animates,
                opacity: 1,
                translateY: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
                delay: anime.stagger(100)
            }, '-=250')

        // si fermé pop petite icone en bas
        if (localStorage.getItem('results') === 'false') {

            timeline
                .add({
                    targets: this.$iconBottom,
                    scale: 1,
                    easing: 'easeOutElastic(1, .6)',
                    duration: 500,
                }, '-=250')
        }
    }

    closeResults() {

        const scopeHome = this

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = false

                this.$results.classList.remove('p-home-results--complete')
                this.$results.classList.remove('p-home-results--waiting')
            }
        })

        // animation
        timeline
            .add({
                targets: this.$animates,
                opacity: 1,
                translateY: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
                delay: anime.stagger(100)
            }, 0)
            .add({
                targets: this.$results,
                height: this.resultH,
                easing: 'easeOutElastic(1, .6)',
                duration: 750,
            }, 0)

        // si fermé pop petite icone en bas
        if (localStorage.getItem('results') === 'false') {

            timeline
                .add({
                    targets: this.$iconBottom,
                    scale: 0,
                    easing: 'easeOutElastic(1, .6)',
                    duration: 250,
                }, 0)
        }
    }
}
class Slideshow {

    constructor(props) {

        this.$container = props.$container
        this.$slides = this.$container.querySelectorAll('.c-slideshow__card')
        this.$closes = this.$container.querySelectorAll('.c-slideshow__close')

        this.$slidesButton = this.$container.querySelectorAll('.c-slideshow__card--button')

        this.currentIndex = 0
        this.maxSlide = this.$slides.length
        this.isAnimating = false

        this.init()
    }

    init() {

        this.setUpCSS()
        this.setUpHammer()
        this.bindEvents()
    }

    setUpCSS(){

        // taille container
        this.cardW = this.$slides[0].clientWidth
        const cardMargin = 10

        this.$container.style.width = (this.cardW * 2 + cardMargin) + 'px'

        // taille margin-left
        const ww = window.innerWidth
        this.$container.style.marginLeft = (ww - this.cardW) / 2 - cardMargin * 1.5 + 'px'
    }

    setUpHammer() {

        this.hammer = new Hammer(this.$container)
    }

    bindEvents() {

        // swipe
        this.hammer.on('swipeleft', () => {

            if (this.currentIndex === this.maxSlide || this.isAnimating) return null
            else this.slide(-1)
        })

        this.hammer.on('swiperight', () => {

            if (this.currentIndex === 0 || this.isAnimating) return null
            else this.slide(1)
        })

        // click image produit
        this.$slidesButton.forEach($slide => {

            $slide.addEventListener('click', () => {

                const isOpen = $slide.classList.contains('c-slideshow__card--open')
                if (!isOpen && !this.isAnimating) this.openSlide($slide)
            })
        })

        // ferme
        this.$closes.forEach($close => {

            $close.addEventListener('click', () => {

                const $slide = $close.closest('.c-slideshow__card')
                if (!this.isAnimating) this.closeSlide($slide)
            })
        })
    }

    slide (direction) {

        const scopeSlideshow = this

        // block
        this.isAnimating = true

        const nextIndex = this.currentIndex + (direction * -1)

        // décale le slideshow
        anime({
            targets: this.$container,
            translateX: direction * this.cardW * nextIndex,
            complete: () => {
                scopeSlideshow.isAnimating = false
                this.currentIndex = nextIndex
            }
        })
    }

    openSlide($slide) {

        this.isAnimating = true
        const scopeSlideshow = this

        const $photo = $slide.querySelector('.c-slideshow__photo')
        const $close = $slide.querySelector('.c-slideshow__close')

        // prépare animation
        anime.set(
            $photo,
            { opacity: 0 }
        )

        anime.set(
            $close,
            { scale: 0 }
        )

        $photo.style.display = 'block'

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 500,
            complete: function () {
                $slide.classList.add('c-slideshow__card--open')
                scopeSlideshow.isAnimating = false
            }
        })

        // animation
        timeline
            .add({
                targets: $photo,
                opacity: 1,
            })
            .add({
                targets: $close,
                scale: 1,
                easing: 'easeOutElastic(1, .6)',
            })
    }

    closeSlide($slide) {

        const scopeSlideshow = this
        const $photo = $slide.querySelector('.c-slideshow__photo')

        this.isAnimating = true

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 500,
            complete: function () {
                $slide.classList.remove('c-slideshow__card--open')
                scopeSlideshow.isAnimating = false
            }
        })

        // animation
        timeline
            .add({
                targets: $photo,
                opacity: 0,
            })

    }
}
class Step1 {
    constructor(props) {

        this.$container = props.$container
        this.$titles = this.$container.querySelectorAll('.p-step-one__text')
        this.$audios = this.$container.querySelectorAll('.p-step-one__audio')
        this.$next = this.$container.querySelector('.p-step-one__next')

        this.isAnimating = false
        this.currentIndex = 0

        this.numberSlides = this.$titles.length

        this.init()
    }

    init() {

        this.setUpTexts()
        this.setUpArrow()
        this.setupMouthAnimation()
        this.bindEvents()
    }

    setUpTexts() {

        anime.set(
            this.$titles,
            {
                opacity: 0,
                translateY: 20
            }
        )
    }

    setUpArrow() {

        anime.set(
            this.$next,
            {
                scale: 0
            }
        )
    }

    bindEvents() {

        // flèche
        this.$next.addEventListener('click', () => {

            if (this.isAnimating) return null
            else if (this.currentIndex === this.numberSlides) this.nextStep()
            else this.nextText()
        })

        // audio fin
        this.$audios.forEach($audio => {
            $audio.addEventListener('ended', this.soundEnded.bind(this))
        })
    }

    start() {

        this.nextText()
    }

    nextText() {

        const scopeStep = this
        this.isAnimating = true

        const timeline = anime.timeline({
            duration: 500,
            complete: () => {

                this.$audios[scopeStep.currentIndex].play()
                this.currentIndex++
                this.isAnimating = false
            }
        })

        if (this.currentIndex !== 0) {

            timeline
                .add({
                    targets: this.$titles[this.currentIndex - 1],
                    easing: 'cubicBezier(.5, .05, .1, .3)',
                    opacity: 0,
                    translateY: -20
                })
        }

        timeline
            .add({
                targets: this.$titles[this.currentIndex],
                easing: 'cubicBezier(.5, .05, .1, .3)',
                opacity: 1,
                translateY: 0,
            }, '-=250')
            .add({
                targets: this.$next,
                scale: 0,
                duration: 250,
            }, 0)
    }

    setupMouthAnimation() {

        // const params = {
        //     container: this.$stepMouthAnimation.querySelector('.p-home-step__mouth'),
        //     renderer: 'svg',
        //     loop: true,
        //     autoplay: true,
        //     path: '../assets/bodymoving/mouth/data.json'
        // }
        //
        // this.mouthAnim = lottie.loadAnimation(params)

        // this.mouthAnim.pause()
    }

    soundEnded() {

        // TODO : pause animation de la bouche
        // this.mouthAnim.pause()

        anime({
            targets: this.$next,
            scale: 1,
        })
    }

    nextStep() {

        document.dispatchEvent(new CustomEvent("nextStep"))
    }
}
window.MediaRecorder = require('audio-recorder-polyfill')

class Step2 {

    constructor(props) {

        this.$container = props.$container
        this.$instructions = this.$container.querySelectorAll('.p-step-two__instruction')
        this.$buttons = this.$container.querySelectorAll('.p-step-two__button')
        this.$heads = this.$container.querySelectorAll('.p-step-two__head')

        this.$containerIllu = this.$container.querySelector('.p-step-two__poda')

        this.buttonsOrigins = []
        this.currentIndex = 0

        this.$player = this.$container.querySelector('.p-step-two__audio')

        this.init()
    }

    init() {

        this.reset()
        this.setUpRecorder()
        // this.getValues()
        this.setUpSlides()
        this.bindEvents()
    }

    start() {

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
    }

    sendBlob() {

        // prépare enregistrement
        let formData = new FormData()
        formData.append('audio', new Blob(this.chunks))

        // envoit au server
        new XHR({
            method: 'POST',
            url: 'child/detect-food',
            success: this.success.bind(this),
            error: this.error.bind(this),
            data: formData,
            needsHeader: false
        })
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

            timeline
                .add({
                    targets: this.$buttons[this.currentIndex - 1],
                    opacity: 0
                })
                .add({
                    targets: this.$instructions[this.currentIndex - 1],
                    opacity: 0,
                    translateY: -20
                })
        }

        // animation
        timeline
            .add({
                targets: this.$buttons[this.currentIndex],
                opacity: 1,
            })
            .add({
                targets: this.$instructions[this.currentIndex],
                opacity: 1,
                translateY: 0
            })

        // tete
        anime.set(
            this.$heads[this.currentIndex],
            {
                opacity: 0
            }
        )
    }
}
class Step3 {

    constructor(props) {

        this.$container = props.$container
        this.$containerFood = this.$container.querySelector('.p-step-three__container-food')
        this.$overlay = this.$container.querySelector('.p-step-three__overlay')
        this.$mouth = this.$container.querySelector('.p-step-three__mouth')

        this.$foodDragging = null
        this.isDragging = false
        this.oldPosition = {
            x: null,
            y: null
        }

        this.init()
    }

    init() {

        this.getMouthPosition()
        this.start()
    }

    getMouthPosition() {

        const left = this.$mouth.getBoundingClientRect().left
        const top = this.$mouth.getBoundingClientRect().top
        const width = this.$mouth.getBoundingClientRect().width
        const height = this.$mouth.getBoundingClientRect().height

        this.mouthPosition = {
            xMin: left,
            xMax: left + width,
            yMin: top,
            yMax: top + height
        }
    }

    start() {

        // ajoute aliments
        this.addFood()

        // écouteurs
        this.$foodSelect = this.$containerFood.querySelectorAll('.p-step-three__food--select')
        this.$food = this.$containerFood.querySelectorAll('.p-step-three__food')

        this.bindEvents()

        // animation pop
        this.showFood()
    }

    addFood() {

        // TODO : changer pour récupérerles vrais envoyés
        localStorage.setItem('food-detected', JSON.stringify(['riz', 'banane', 'fromage', 'viande']))

        // récupère éléments
        const food = JSON.parse(localStorage.getItem('food-detected'))

        // ajoute dans le DOM
        for(let i = 0; i < food.length; i++) {

            const li = document.createElement('li')
            li.classList.add('p-step-three__food')

            if (food[i] === 'viande') li.classList.add('p-step-three__food--select')

            const img = document.createElement('img')

            // détecte la sélection
            if (food[i] === 'viande') img.setAttribute('src', '../assets/img/food/viande-select.svg')
            else img.setAttribute('src', '../assets/img/food/' + food[i] + '.svg')
            img.setAttribute('draggable', 'false')

            li.appendChild(img)
            this.$containerFood.appendChild(li)

            // cache pour animation
            anime.set(
                li,
                {
                    scale: 0,
                }
            )
        }
    }

    bindEvents() {

        // click + présicion
        this.$foodSelect.forEach($foodSelect => {

            $foodSelect.addEventListener('click', () => {

                console.log('click')
            })
        })

        // drag
        this.$food.forEach($food => {

            $food.addEventListener('mousedown', e => {

                this.startDragging(e, $food)
            })

            $food.addEventListener('touchstart', e => {

                this.startDragging(e, $food)
            })
        })

        this.$containerFood.addEventListener('mouseup', this.stopDragging.bind(this))
        this.$containerFood.addEventListener('touchend', this.stopDragging.bind(this))

        this.$containerFood.addEventListener('mousemove', e => {

            this.moveDragging(e)
        })

        // TODO : drag mobile
        this.$containerFood.addEventListener('touchmove', e => {

            this.moveDragging(e)
        })
    }

    moveElement(event) {

        const x = event.pageX
        const y = event.pageY

        this.detecPosition(x, y)
        this.dragElement(x, y)
    }

    detecPosition(x, y) {

        const marge = 20

        // si sur bouche
        const insideMouthX = x > this.mouthPosition.xMin - marge && x < this.mouthPosition.xMax + marge
        const insideMouthY = y > this.mouthPosition.yMin - marge && y < this.mouthPosition.yMax + marge

        if (insideMouthX && insideMouthY) this.eatFood()
    }

    eatFood() {

        // animation
        anime.set(
            this.$foodDragging,
            {
                scale: 0,
            }
        )

        // reset variables
        this.stopDragging()
    }

    startDragging(e, $food) {

        // pas si besoin précision
        const isSelected = $food.classList.contains('p-step-three__food--select')
        if (isSelected) return null

        this.isDragging = true
        this.$foodDragging = $food

        this.oldPosition.x = e.pageX
        this.oldPosition.y = e.pageY

    }

    moveDragging(e) {


        if (!this.isDragging) return null
        else this.moveElement(e)
    }

    stopDragging() {

        this.isDragging = false
        this.$foodDragging = null
        this.oldPosition = {
            x: null,
            y: null
        }
    }

    dragElement(x, y) {

        const tx = x - this.oldPosition.x
        const ty = y - this.oldPosition.y

        anime.set(
            this.$foodDragging,
            {
                translateY: '+=' + ty,
                translateX: '+=' + tx,
            }
        )

        this.oldPosition = {
            x: x,
            y: y
        }
    }

    showFood() {

        anime({
            targets: this.$food,
            scale: 1,
            easing: 'easeOutElastic(1, .6)',
            duration: 1000,
            delay: anime.stagger(500),
            complete: () => {

                this.removeOverlay()
            }
        })
    }

    removeOverlay() {

        anime({
            targets: this.$overlay,
            opacity: 0,
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            delay: 250
        })
    }
}
class Accounts {

    constructor() {

        this.$list = document.querySelector('.p-account__list')

        this.init()
    }

    async init() {

        // await new NeedToken()
        this.getAccounts()
    }

    getAccounts() {

        new XHR({
            method: 'GET',
            url: 'child/accounts',
            success: this.successGetAccounts.bind(this),
            error: this.errorGetAccounts.bind(this),
            data: null
        })
    }

    successGetAccounts(data) {
        const children = JSON.parse(data)

        // ajoute les enfants le DOM
        for(let i = 0; i< children.length; i++) this.appendAccount(children[i])

        // stocke les comptes
        this.$accounts = document.querySelectorAll('.p-account__item')

        // lance écouter d'events
        this.bindEvents()
    }

    appendAccount(infos) {

        const isActive = infos.color !== null

        const li = document.createElement('li')
        li.classList.add('p-account__item')

        const p = document.createElement('p')
        p.classList.add('p-account__name')
        p.innerText = infos.name

        const img = document.createElement('img')
        img.classList.add('p-account__avatar')
        img.src = isActive ? '../assets/img/avatar/'+infos.color+'.svg' : '../assets/img/avatar/default.png'

        li.appendChild(img)
        li.appendChild(p)

        li.setAttribute('data-active', isActive)
        li.setAttribute('data-id', infos._id)
        li.setAttribute('data-name', infos.name)

        this.$list.appendChild(li)
    }

    errorGetAccounts(error) {

        console.log('Erreur pendant la récupération des comptes', error)
    }

    bindEvents() {

        this.$accounts.forEach($account => {

            $account.addEventListener('click', () => {
                const isActive = $account.getAttribute('data-active')

                if (isActive) this.selectAccount($account.getAttribute('data-id'), $account.getAttribute('data-name'))
                else document.location.href = '/pages/register-child'
            })
        })
    }

    selectAccount(id, name) {

        localStorage.setItem('child-name', name)
        localStorage.setItem('child-id', id)

        document.location.href = '/pages/home'
    }
}
class Custom {

    constructor() {

        this.$container = document.querySelector('.p-custom__container')
        this.$image = document.querySelector('.p-custom__image')
        this.$genders = document.querySelectorAll('.p-custom__item')
        this.$validate = document.querySelector('.p-custom__validate')
        this.$audios = document.querySelectorAll('.p-custom__audio')
        this.currentSelected = null

        this.init()
    }

    async init() {

        // await new NeedToken()
        this.updateSelection(0)
        this.setUpHammer()
        this.bindEvents()
    }

    setUpHammer() {

        this.hammer = new Hammer(this.$container)
    }

    updateSelection(index) {

        // enlève sélection du précédent
        if (this.currentSelected !== null ) this.$genders[this.currentSelected].classList.remove('p-custom__item--active')

        // nouvelle sélection
        this.$genders[index].classList.add('p-custom__item--active')
        this.$image.setAttribute('src', this.$genders[index].querySelector('img').getAttribute('src'))
        this.currentSelected = index

        // lance audio
        this.$audios[index].play()
    }

    bindEvents() {

        // swipe
        this.hammer.on('swipeleft', () => {

            if (this.currentSelected === 0) this.updateSelection(1)
        })

        this.hammer.on('swiperight', () => {

            if (this.currentSelected === 1) this.updateSelection(0)
        })

        // click
        this.$genders.forEach($gender => {

            $gender.addEventListener('click', () => {

                const isActive = $gender.classList.contains('p-custom__item--active')

                if (!isActive) this.updateSelection(Array.from(this.$genders).indexOf($gender))
            })
        })


        // valide
        this.$validate.addEventListener('click', this.validate.bind(this))
    }

    validate() {

        new XHR({
            method: 'POST',
            url: 'child/save-avatar',
            success: this.successValidate.bind(this),
            error: this.errorValidate.bind(this),
            data:
                encodeURIComponent('avatar') +
                "=" +
                encodeURIComponent(this.$genders[this.currentSelected].getAttribute('data-gender')) +
                "&" +
                encodeURIComponent('id') +
                "=" +
                encodeURIComponent(localStorage.getItem('child-id'))
        })
    }

    successValidate() {

        document.location = '/pages/home'
    }

    errorValidate(error) {

        console.log("error", error)
    }
}
class Home {

    constructor() {

        this.$slideshow = document.querySelectorAll('.c-slideshow')
        this.$illustration = document.querySelector('.p-home-activity__illustration')

        this.init()
    }

    async init() {

        // await new NeedToken()

        new Results()

        this.$slideshow.forEach($slideshow => {
            new Slideshow({$container: $slideshow})
        })

        new Illustration({$container: this.$illustration})

        new AddMeal()
    }
}
class Index {

    constructor() {

        this.init()
    }

    async init(){

        // await new NeedToken()
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

        document.location.href = '/pages/accounts'
    }

    error(error) {
        console.log('error', error)
    }
}
class Profile {

    constructor() {

        this.$logout = document.getElementById('logout')

        this.init()
    }

    async init() {

        // await new NeedToken()
        this.bindEvents()
    }

    bindEvents() {

        this.$logout.addEventListener('click', this.logout.bind(this))
    }

    logout() {

        new XHR({
            method: 'GET',
            url: 'auth/logout',
            success: this.successLougout.bind(this),
            error: this.errorLogout.bind(this),
            data: null
        })
    }

    successLougout() {

        localStorage.removeItem('connected')
        localStorage.removeItem('child-name')
        localStorage.removeItem('child-id')

        // renvoi vers connexion
        document.location.href = '/'
    }

    errorLogout() {

        console.log('erreur pendant la déconnexion')
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

        this.req.withCredentials = true
        this.req.open(this.method, `https://192.168.1.75:3003/${this.url}`, true)
        // this.req.open(this.method, `https://10.30.21.24:3003/${this.url}`, true)

        // pas d'hearder lorsque l'on envoit un blob
        if (this.needsHeader) this.req.setRequestHeader("Content-type","application/x-www-form-urlencoded")

        this.req.send(this.data)
    }
}
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