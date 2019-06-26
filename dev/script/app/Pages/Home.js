class Home {

    constructor() {

        this.$results = document.querySelector('.p-home-results')
        this.$middle = document.querySelector('.p-home__middle')
        this.$container = document.querySelector('.p-home__scroll-content')
        this.$swipe = document.querySelector('.p-home-results__swipe')

        this.$animates = document.querySelectorAll('.js-animate-top')

        this.areResultsOpen = false

        this.$daysToAdd = document.querySelectorAll('.js-day-to-add')

        this.init()
    }

    async init() {

        await new NeedToken()
        Home.updateStorage('false')
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
        const containerH = this.$container.clientHeight

        this.$middle.style.height = containerH - this.resultH + 'px'


        // vérifie si bilan présent ou pas
        const hasResults = localStorage.getItem('results')
        if (hasResults === 'false') this.$results.classList.add('p-home-results--waiting')

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

        // ajouter un repas
        this.$daysToAdd.forEach($day => {
            $day.addEventListener('click', () => {
                this.addDay($day.getAttribute('data-day'))
            })
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
    }


    closeResults() {

        const scopeHome = this

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


    }

    addDay(day) {

        localStorage.setItem('day-to-add', day)
        document.location = "/pages/register-food.html"
    }
}