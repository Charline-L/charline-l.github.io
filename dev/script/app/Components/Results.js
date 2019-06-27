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

        // ouvre
        document.addEventListener("openResults", this.openResults.bind(this) )

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