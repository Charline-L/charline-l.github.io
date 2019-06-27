class Results {

    constructor() {

        this.$results = document.querySelector('.p-home-results')
        this.$ilustration = document.querySelector('.p-home-activity__container-illustration')
        this.$container = document.querySelector('.p-home-activity')
        this.$swipe = document.querySelector('.p-home-results__swipe')
        this.$top = document.querySelector('.p-home-activity__top')

        this.$iconBottom = document.querySelector('.js-poda-icon')
        this.$animates = document.querySelectorAll('.js-animate-top')

        this.$page = document.querySelector('.p-home')
        this.$openPromise = document.querySelector('.p-home__open-promise')

        console.log('this.$openPromise', this.$openPromise)

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

        // ouvre promise
        this.$openPromise.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent("openPromise"))
        })

        // ouvre
        document.addEventListener("openResults", this.openResults.bind(this) )

        // ferme
        document.addEventListener("closeResults", this.closeResults.bind(this) )
    }

    openResults() {
        const hasResults = localStorage.getItem('results') === 'true'

        if (hasResults) this.openResultsBig()
        else this.openResultsSmall()
    }

    openResultsBig() {

        const scopeHome = this

        // prépare animation
        anime.set(
            this.$animates,
            {
                opacity: 0,
                translateY: 10
            }
        )

        this.$results.classList.add('p-home-results--complete')
        this.$results.classList.remove('p-home-results--small')

        // récupère la taille du swipe
        const oldH = this.swipeH
        this.$swipe.style.height = 'auto'
        this.swipeH = this.$swipe.clientHeight + 100
        this.$swipe.style.height = oldH + 'px'

        const pageH = this.$page.clientHeight

        this.differenceTodAdd = this.swipeH - pageH * 0.25

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = true
                document.dispatchEvent(new CustomEvent("resizeSlideshow"))
            }
        })

        // animation
        timeline
            .add({
                targets: this.$page,
                height: '+=' + this.differenceTodAdd,
                easing: 'easeOutElastic(1, .6)',
                duration: 750,
            }, 0)
            .add({
                targets: this.$results,
                height: this.resultH + this.swipeH,
                easing: 'easeOutElastic(1, .6)',
                duration: 750,
            }, 0)
            .add({
                targets: this.$animates,
                opacity: 1,
                translateY: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
                delay: anime.stagger(100)
            }, '-=250')
    }

    openResultsSmall() {

        const scopeHome = this

        // prépare animation
        anime.set(
            this.$animates,
            {
                opacity: 0,
                translateY: 10
            }
        )

        anime.set(
            this.$iconBottom,
            { scale: 0 }
        )

        this.$iconBottom.style.display = 'block'
        this.$results.classList.add('p-home-results--waiting')

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
            .add({
                targets: this.$iconBottom,
                scale: 1,
                easing: 'easeOutElastic(1, .6)',
                duration: 500,
            }, '-=250')
    }

    closeResults() {

        if (localStorage.getItem('results') === 'false') this.closeResultsSmall()
        else this.closeResultsBig()
    }

    closeResultsBig() {

        const scopeHome = this

        this.$results.classList.add('p-home-results--small')
        this.$results.classList.remove('p-home-results--complete')
        this.$results.classList.remove('p-home-results--waiting')

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = false
            }
        })

        // animation
        timeline
            .add({
                targets: this.$results,
                height: this.resultH,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
            }, 0)
            .add({
                targets: this.$page,
                height: '-=' + this.differenceTodAdd,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
            }, 0)
    }

    closeResultsSmall() {

        const scopeHome = this

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = false

                this.$results.classList.add('p-home-results--small')
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
            .add({
                targets: this.$iconBottom,
                scale: 0,
                easing: 'easeOutElastic(1, .6)',
                duration: 250,
            }, 0)
    }
}