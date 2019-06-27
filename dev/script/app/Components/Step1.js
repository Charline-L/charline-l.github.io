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
            easing: 'cubicBezier(.5, .05, .1, .3)',
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
                    opacity: 0,
                    translateY: -20
                })
        }

        timeline
            .add({
                targets: this.$titles[this.currentIndex],
                opacity: 1,
                translateY: 0,
            }, '-=250')
            .add({
                targets: this.$next,
                scale: 0,
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