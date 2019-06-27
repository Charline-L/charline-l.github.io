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

        // TODO : Results.updateStorage('true')

        this.step1 = new Step1({$container : document.querySelector('.p-home-step--one')})

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
        this.$container.classList.add('p-home-add-meal--active')

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

        const $nextStep = this.$steps[this.currentStep]
        const $fades = $nextStep.querySelectorAll('.js-fade')
        const $pops = $nextStep.querySelectorAll('.js-pop')

        // TODO : animation fade de départ

        // prépare animation
        anime.set(
            $pops,
            {
                scale: 0
            }
        )

        anime.set(
            $fades,
            {
                opacity: 0,
                translateY: 20
            }
        )

        // affiche
        $nextStep.classList.add('p-home-step--active')

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
                    default :
                        console.log('no index')

                }
            }
        })

        // animation
        timeline
            .add({
                targets: $pops,
                scale: 1,
                easing: 'easeOutElastic(1, .6)',
                duration: 500,
            })
            .add({
                targets: $fades,
                opacity: 1,
                translateY: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                delay: anime.stagger(100)
            }, '-=250')
    }
}